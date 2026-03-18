import axios, { AxiosRequestConfig } from 'axios';

import { mapApiError } from './apiErrorMapper';
import { getApiRuntimeConfig } from './apiConfig';
import { getAuthorizationHeaderValue } from './authTokenProvider';

export interface ApiRequestConfig<D = unknown>
  extends Omit<AxiosRequestConfig<D>, 'baseURL'> {
  requiresAuth?: boolean;
  forceRefreshToken?: boolean;
}

const normalizeHeaders = (
  headers?: AxiosRequestConfig['headers'],
): Record<string, string> => {
  if (!headers) {
    return {};
  }

  return Object.entries(headers as Record<string, unknown>).reduce<Record<string, string>>(
    (result, [key, value]) => {
      if (value === undefined || value === null) {
        return result;
      }

      result[key] = String(value);
      return result;
    },
    {},
  );
};

const buildRequestHeaders = async (
  config: ApiRequestConfig,
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...normalizeHeaders(config.headers),
  };

  if (config.requiresAuth === false) {
    return headers;
  }

  const authorization = await getAuthorizationHeaderValue({
    forceRefresh: config.forceRefreshToken,
  });

  if (authorization) {
    headers.Authorization = authorization;
  }

  return headers;
};

export class HttpClient {
  async request<TResponse, D = unknown>(
    config: ApiRequestConfig<D>,
  ): Promise<TResponse> {
    try {
      const headers = await buildRequestHeaders(config);
      const response = await axios.request<TResponse, { data: TResponse }, D>({
        ...config,
        baseURL: getApiRuntimeConfig().restBaseUrl,
        timeout: config.timeout ?? getApiRuntimeConfig().httpTimeoutMs,
        headers,
      });

      return response.data;
    } catch (error) {
      throw mapApiError(error, {
        url: config.url,
        method: config.method?.toUpperCase(),
      });
    }
  }

  get<TResponse>(url: string, config?: Omit<ApiRequestConfig, 'method' | 'url'>) {
    return this.request<TResponse>({
      ...config,
      method: 'GET',
      url,
    });
  }

  delete<TResponse>(url: string, config?: Omit<ApiRequestConfig, 'method' | 'url'>) {
    return this.request<TResponse>({
      ...config,
      method: 'DELETE',
      url,
    });
  }

  post<TResponse, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<ApiRequestConfig<D>, 'method' | 'url' | 'data'>,
  ) {
    return this.request<TResponse, D>({
      ...config,
      method: 'POST',
      url,
      data,
    });
  }

  put<TResponse, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<ApiRequestConfig<D>, 'method' | 'url' | 'data'>,
  ) {
    return this.request<TResponse, D>({
      ...config,
      method: 'PUT',
      url,
      data,
    });
  }

  patch<TResponse, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<ApiRequestConfig<D>, 'method' | 'url' | 'data'>,
  ) {
    return this.request<TResponse, D>({
      ...config,
      method: 'PATCH',
      url,
      data,
    });
  }
}

export const httpClient = new HttpClient();
