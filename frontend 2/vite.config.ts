import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// AIFit client (Proposal 3.4 "Technology solution"): React.js + TypeScript on
// the client, built with Vite. The AI pose-estimation and vector-angle work
// happens entirely in the browser (Proposal 4.4 "Technical Proposed" / Edge
// tier) - this config just needs worker support for src/workers/*.
export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the ASP.NET Core backend in development
      // (Architecture Design 3.2, "API Client Module" -> "Backend Server").
      "/api": {
        target: "https://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
