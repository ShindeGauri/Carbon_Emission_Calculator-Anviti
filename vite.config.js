import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { handleAssistantChatRequest } from './server/assistantEndpoint.js'

function assistantApiPlugin() {
  return {
    name: 'assistant-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/assistant/chat') {
          await handleAssistantChatRequest(req, res);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/assistant/chat') {
          await handleAssistantChatRequest(req, res);
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), assistantApiPlugin()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
