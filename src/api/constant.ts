import { env } from './env';

type HostConfig = {
  baseUrl: string;
};

const HOSTNAME_MAP: Record<string, HostConfig> = {

  // Local (Pre Production)
  localhost: {
    baseUrl: env.baseUrl,
  },
};

export const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  return HOSTNAME_MAP[hostname].baseUrl;
};

export const api_constants = {
  baseUrl: getApiBaseUrl(),
};
