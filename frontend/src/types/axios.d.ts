import type { AxiosResponse as BaseAxiosResponse, AxiosRequestConfig as BaseAxiosRequestConfig } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig extends BaseAxiosRequestConfig {
    headers: Record<string, string>;
  }

  interface AxiosResponse<T = any> extends BaseAxiosResponse<T> {
    data: T;
  }

  interface AxiosError<T = any> extends Error {
    response?: AxiosResponse<T>;
    request?: any;
    statusCode?: number;
    displayMessage?: string;
  }
}

export type ApiErrorData = {
  message: string;
  statusCode: number;
};

export type ApiError = Error & {
  response?: {
    data: ApiErrorData;
    status: number;
  };
  request?: any;
  statusCode?: number;
  displayMessage?: string;
};
