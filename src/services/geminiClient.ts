/**
 * Client service for interacting with server-side Gemini AI features:
 * Senna AI Chatbot (sennagallery.com specialized customer assistance)
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'navigate' | 'filter' | 'wa';
    payload: string;
  };
}

/**
 * Send multi-turn chat messages to Gemini server-side API
 */
export async function sendGeminiChatMessage(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  currentProductContext?: any
): Promise<{ success: boolean; reply: string; error?: string }> {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        currentProductContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return {
        success: true,
        reply: data.reply,
      };
    } else {
      return {
        success: false,
        reply: data.message || 'Maaf, terjadi kendala teknis saat memproses pesan Anda.',
        error: data.message,
      };
    }
  } catch (error: any) {
    console.error('[Gemini Client Error]', error);
    return {
      success: false,
      reply: 'Mohon maaf, koneksi ke asisten AI sedang tidak stabil. Anda juga bisa langsung chat kami di WhatsApp 0812-7883-9990.',
      error: error?.message,
    };
  }
}
