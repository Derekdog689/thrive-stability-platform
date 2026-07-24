import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "THRIVE Stability Platform",
    short_name: "THRIVE",
    description:
      "A budgeting, wellness, and support-planning application for approved users and support teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef4ef",
    theme_color: "#047857",
    orientation: "portrait",
    categories: ["finance", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}