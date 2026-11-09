import { handleAssistantChatRequest } from '../../server/assistantEndpoint.js';

export default async function handler(req, res) {
  return handleAssistantChatRequest(req, res);
}