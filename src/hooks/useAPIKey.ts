import { useState, useEffect } from "react";

const API_KEY_STORAGE_KEY = "openai-api-key";

interface UseApiKeyReturn {
  apiKey: string;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isKeySet: boolean;
}

export function useAPIKey(): UseApiKeyReturn {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [isKeySet, setIsKeySet] = useState<boolean>(false);

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKeyState(savedKey);
      setIsKeySet(true);
    }
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKeyState(key);
    setIsKeySet(true);
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKeyState("");
    setIsKeySet(false);
  };

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    isKeySet,
  };
}
