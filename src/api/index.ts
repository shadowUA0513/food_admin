import axios from 'axios';
import Cookies from 'js-cookie';

declare module 'axios' {
  interface AxiosRequestConfig {
    fullResponse?: boolean;
  }
}

function newAbortSignal(timeoutMs: number) {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);
  return abortController.signal;
}

export const api = axios.create({});

api.interceptors.request.use(
  (config) => {
    if (config.method === 'get') {
      config.signal = newAbortSignal(10000);
    }

    if (!config.headers.Authorization) {
      const session = Cookies.get('token');
      if (session) {
        config.headers.Authorization = session;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.config.fullResponse) {
      return response;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // do something
    }
    return Promise.reject(error);
  }
);