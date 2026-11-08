import { AUTH_API, request } from './http';
import type { LoginResponse } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>(AUTH_API, '/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),
};
