/* Isolated candidate tests. No Supabase connection, secrets or email send. */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(name, modules = {}) {
  const file = path.join(process.cwd(), "src", "lib", name + ".ts");
  const source = fs.readFileSync(file, "utf8");
  const js = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022
  } }).outputText;
  const exports = {};
  const context = {
    exports, Buffer, URL, Error, TypeError,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (specifier.startsWith("node:")) return require(specifier);
      if (modules[specifier]) return modules[specifier];
      throw Error("Unexpected import " + specifier);
    }
  };
  vm.runInNewContext(js, context, { filename: file });
  return exports;
}

const auth = load("supportNotificationCronAuth");
const jobs = load("supportNotificationMachineOutbox");
const { AmbiguousSmtpDeliveryError } = load("supportNotificationSmtp", {
  "./supportNotificationDelivery": {}
});
const email = load("supportNotificationEmail");
const delivery = load("supportNotificationDelivery", {
  "./supportNotificationSmtp": { AmbiguousSmtpDeliveryError },
  "./supportNotificationEmail": email
});
const batch = load("supportNotificationBatch", {
  "./supportNotificationDelivery": delivery
});

const SECRET = "a".repeat(48);
const JOB = "44444444-4444-4444-8444-444444444444";
const TOKEN = "55555555-5555-4555-8555-555555555555";
const settings = { origin: "https://thrive-stability-platform.vercel.app", sender: "thrive@example.com", recipient: "admin@example.com" };

test("scheduler rejects absent, short, invalid and malformed secrets", () => {
  assert.equal(auth.isAuthorizedSupportCron(null, SECRET), false);
  assert.equal(auth.isAuthorizedSupportCron("Bearer "+SECRET, "short"), false);
  assert.equal(auth.isAuthorizedSupportCron("Bearer "+("b".repeat(48)), SECRET), false);
  assert.equal(auth.isAuthorizedSupportCron(SECRET, SECRET), false);
  assert.equal(auth.isAuthorizedSupportCron("Bearer "+SECRET, SECRET), true);
});

test("outbox uses exact claim and token-bound finish query", async () => {
  const calls = [];
  const sql = { async query(query, params) {
    calls.push([query, params]);
    return { rows: calls.length === 1 ? [{ job_id: JOB, event_kind: "request_created", claim_token: TOKEN }] : [{ finished: true }] };
  }};
  const outbox = jobs.createMachineNotificationOutbox(sql);
  assert.equal((await outbox.claimNext()).id, JOB);
  await outbox.markSent(JOB);
  assert.match(calls[0][0], /thrive_worker_claim_support_notification/);
  assert.deepEqual(Array.from(calls[1][1]), [JOB,TOKEN,true,null]);
  await assert.rejects(() => outbox.markSent(JOB), /Missing worker claim/);
});

test("transport failure records failed, without reporting sent", async () => {
  let marked = "";
  const outbox = {
    async claimNext() { return { id: JOB, eventKind: "request_created" }; },
    async markSent() { throw Error("Should not acknowledge sent"); },
    async markFailed(id, category) { marked = id + ":" + category; }
  };
  const result = await delivery.deliverOneSupportNotification(outbox, {
    async send() { throw Error("SMTP rejected"); }
  }, settings);
  assert.equal(result, "failed");
  assert.equal(marked, JOB + ":transport");
});

test("ambiguous SMTP acceptance is not marked failed or retried", async () => {
  let marked = false;
  const outbox = {
    async claimNext() { return { id: JOB, eventKind: "request_created" }; },
    async markSent() { marked=true; },
    async markFailed() { marked=true; }
  };
  await assert.rejects(() => delivery.deliverOneSupportNotification(outbox, {
    async send() { throw new AmbiguousSmtpDeliveryError(); }
  }, settings), /SMTP acceptance uncertain/);
  assert.equal(marked, false);
});

test("database ack failure propagates rather than automatic resend", async () => {
  let failed = false;
  const outbox = {
    async claimNext() { return { id: JOB, eventKind: "participant_replied" }; },
    async markSent() { throw Error("DB ack lost"); },
    async markFailed() { failed = true; }
  };
  await assert.rejects(() => delivery.deliverOneSupportNotification(outbox, {
    async send() {}
  }, settings), /DB ack lost/);
  assert.equal(failed,false);
});

test("batch halts after first failure", async () => {
  let claimed = 0;
  const outbox = {
    async claimNext() { claimed++; return { id: JOB, eventKind: "request_created" }; },
    async markSent() {},
    async markFailed() {}
  };
  const result = await batch.runSupportNotificationBatch(outbox, { async send() { throw Error("SMTP failure"); } }, settings, 3);
  assert.equal(result.failed, 1);
  assert.equal(claimed,1);
});

test("worker connection URL is restricted to direct role or THRIVE session pooler tenant", () => {
  const validate = load("supportNotificationDatabaseConfig").validateSupportWorkerDatabaseUrl;
  const direct = "postgresql://thrive_support_notifier:synthetic@db.example.supabase.co:5432/postgres";
  const session = "postgresql://thrive_support_notifier.ovzifochmrsaxabclxoe:synthetic@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
  assert.equal(validate(direct), direct);
  assert.equal(validate(session), session);
  assert.throws(() => validate(session.replace("ovzifochmrsaxabclxoe","anotherproject")), /Dedicated worker/);
  assert.throws(() => validate(session.replace(":5432",":6543")), /Dedicated worker/);
  assert.throws(() => validate(direct + "?sslmode=disable"), /TLS/);
});
