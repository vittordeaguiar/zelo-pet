export class NetworkError extends Error {
  constructor(message = 'Sem conexão com a internet.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Tempo de conexão esgotado.');
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timeout);
  }
};

export const isNetworkError = (error: unknown) => error instanceof NetworkError;
