import "server-only";
import tls from "node:tls";
import type { MailTransport } from "./supportNotificationDelivery";

/**
 * Narrow SMTP-over-TLS transport for THRIVE's initial plain-text alerts.
 * Gmail Workspace app-password AUTH PLAIN on implicit TLS port 465.
 * No external packages, public routes, or Supabase service-role credentials.
 * Intended for a private, authorized server worker only.
 */
type SmtpOptions = {
  host: string;
  port: number;
  username: string;
  appPassword: string;
  timeoutMs?: number;
};

function safeHeader(value: string): string {
  if (!value || /[\r\n\x00-\x1f\x7f]/.test(value)) {
    throw new Error("Invalid SMTP header");
  }
  return value;
}

function smtpText(value: string): string {
  return value.replace(/\r\n|\r|\n/g, "\r\n").replace(/(^|\r\n)\./g, "$1..");
}

export function createGoogleSmtpTransport(options: SmtpOptions): MailTransport {
  if (options.host !== "smtp.gmail.com" || options.port !== 465) {
    throw new Error("This transport is restricted to Gmail implicit TLS on port 465");
  }
  const user = safeHeader(options.username);
  const password = options.appPassword;
  if (!password || /[\r\n]/.test(password)) throw new Error("SMTP credential missing or invalid");

  return {
    async send({ from, to, subject, text }) {
      safeHeader(from); safeHeader(to); safeHeader(subject);
      if (!text || /\x00/.test(text)) throw new Error("Invalid notification body");
      const socket = tls.connect({
        host: options.host,
        port: options.port,
        servername: options.host,
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      });

      let incoming = "";
      let responses: Array<{ code: number; message: string }> = [];
      let pending: ((response: { code: number; message: string }) => void) | null = null;
      let pendingReject: ((error: Error) => void) | null = null;
      let multiCode: number | null = null;
      const deliver = (item: { code: number; message: string }) => {
        if (pending) {
          const resolve = pending;
          pending = null;
          pendingReject = null;
          resolve(item);
        } else responses.push(item);
      };
      const fail = (error: Error) => {
        if (pendingReject) {
          const reject = pendingReject;
          pending = null;
          pendingReject = null;
          reject(error);
        }
      };

      socket.setTimeout(options.timeoutMs ?? 15000);
      socket.on("timeout", () => socket.destroy(new Error("SMTP connection timed out")));
      socket.on("error", fail);
      socket.on("close", () => fail(new Error("SMTP connection closed")));
      socket.on("data", (part: Buffer) => {
        incoming += part.toString("utf8");
        if (incoming.length > 64_000) {
          socket.destroy(new Error("SMTP response exceeded limit"));
          return;
        }
        let end;
        while ((end = incoming.indexOf("\r\n")) !== -1) {
          const line = incoming.slice(0, end);
          incoming = incoming.slice(end + 2);
          if (!/^\d{3}[ -]/.test(line)) {
            socket.destroy(new Error("Invalid SMTP response"));
            return;
          }
          const code = Number(line.slice(0, 3));
          if (multiCode !== null && multiCode !== code) {
            socket.destroy(new Error("Inconsistent SMTP multiline response"));
            return;
          }
          if (line[3] === "-") {
            multiCode = code;
          } else {
            multiCode = null;
            deliver({ code, message: line.slice(4) });
          }
        }
      });

      const read = () => new Promise<{ code: number; message: string }>((resolve, reject) => {
        if (responses.length) { resolve(responses.shift()!); return; }
        if (socket.destroyed) { reject(new Error("SMTP disconnected")); return; }
        pending = resolve;
        pendingReject = reject;
      });
      const command = async (line: string, expected: number) => {
        if (socket.destroyed) throw new Error("SMTP disconnected");
        socket.write(line + "\r\n");
        const reply = await read();
        if (reply.code !== expected) throw new Error("SMTP command rejected: " + reply.code);
      };
      try {
        const greeting = await read();
        if (greeting.code !== 220) throw new Error("SMTP greeting rejected");
        await command("EHLO thrive-stability-platform.vercel.app", 250);
        const auth = Buffer.from("\u0000" + user + "\u0000" + password).toString("base64");
        await command("AUTH PLAIN " + auth, 235);
        await command("MAIL FROM:<" + safeHeader(from) + ">", 250);
        await command("RCPT TO:<" + safeHeader(to) + ">", 250);
        await command("DATA", 354);
        const mime = [
          "From: " + from,
          "To: " + to,
          "Subject: " + subject,
          "MIME-Version: 1.0",
          "Content-Type: text/plain; charset=UTF-8",
          "Content-Transfer-Encoding: 8bit",
          "",
          smtpText(text),
        ].join("\r\n");
        await command(mime + "\r\n.", 250);
        socket.write("QUIT\r\n");
      } finally {
        socket.end();
        socket.destroy();
      }
    },
  };
}
