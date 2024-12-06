import axios, { AxiosInstance, AxiosError } from 'axios';

export interface RetryConfig {
  retries?: number;
  retryDelay?: number;
  shouldRetry?: (error: AxiosError) => boolean;
}

export const createRetryAxios = (config: RetryConfig = {}): AxiosInstance => {
  const instance = axios.create({
    timeout: 5000
  });

  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const { config: axiosConfig } = error;
    if (!axiosConfig || !config.retries) {
      return Promise.reject(error);
    }

    const retryCount = (axiosConfig as any)._retryCount || 0;
    if (retryCount >= (config.retries || 3)) {
      return Promise.reject(error);
    }

    // Check if we should retry
    if (config.shouldRetry && !config.shouldRetry(error)) {
      return Promise.reject(error);
    }

    (axiosConfig as any)._retryCount = retryCount + 1;

    // Wait before retrying
    await new Promise(resolve => 
      setTimeout(resolve, (config.retryDelay || 2000) * (retryCount + 1))
    );

    return instance(axiosConfig);
  });

  return instance;
};