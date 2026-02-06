import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Эта функция будет центральным местом для всех API-запросов
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Получаем данные пользователя из Telegram Web App
  // Это самый надежный источник на старте приложения
  const webAppData = window.Telegram?.WebApp?.initDataUnsafe;
  const userId = webAppData?.user?.id.toString();

  // Создаем заголовки
  const headers = new Headers(options.headers || {});
  headers.append('Content-Type', 'application/json');

  // !!! КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Добавляем заголовок x-user-id, если он есть
  if (userId) {
    headers.append('x-user-id', userId);
  } else {
    console.warn(`[apiFetch] User ID не найден, запрос к ${endpoint} может быть неавторизован.`);
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    // Попытаемся прочитать тело ошибки, если оно есть
    const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error body' }));
    console.error(`API Error: ${response.status} ${response.statusText} for ${url}`, errorBody);
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

// Хук для выполнения GET-запросов
export function useApi<T>(endpoint: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFetch(endpoint);
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Функция для выполнения POST-запросов
export async function postApi(endpoint: string, body: unknown) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}
