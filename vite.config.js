import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Site publicado na raiz do domínio (Netlify/Vercel). Necessário para a rota /admin.
  base: "/"
});
