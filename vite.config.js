import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      watch: {
       usePolling: true,
      },
      esbuild: {
       target: "esnext",
       platform: "linux",
     },
   },
   define: {
     VITE_OPENAI_API_KEY: JSON.stringify(env.VITE_OPENAI_API_KEY),
     VITE_GOOGLE_MAPS_API_KEY: JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
   },
  };
 });
