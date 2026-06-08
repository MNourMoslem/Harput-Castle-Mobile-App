import { apiRequest } from '@/services/apiClient';

export async function askAssistant(message: string): Promise<string> {
  const data = await apiRequest<{ reply: string }>('/assistant/ask', {
    method: 'POST',
    body: { message },
  });
  return data.reply;
}
