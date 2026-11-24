import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.name,
    short_name: APP_CONFIG.shortName,
    description: APP_CONFIG.tagline,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f3fd",
    theme_color: "#7c5ce0",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
