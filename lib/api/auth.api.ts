import axios, { AxiosInstance } from 'axios';
const BASE_URL = "https://brodameko-server.onrender.com"

type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

type ApiError = {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
};

const API_BASE = `${BASE_URL}/api/v1`;

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAccessToken(token: string | null) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
}

export async function requestOtp(phoneNumber: string) {
  const res = await client.post<ApiSuccess<{ expiresIn: number }>>('/auth/request-otp', {
    phoneNumber,
  });
  return res.data;
}

export async function verifyOtp(payload: { phoneNumber: string; otp: string }) {
  const res = await client.post<
    ApiSuccess<{
      user: {
        _id: string;
        phoneNumber: string;
        roles: string[];
        isActive: boolean;
        createdAt: string;
      };
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>
  >('/auth/verify-otp', payload);
  return res.data;
}

export async function refreshToken(refreshTokenValue: string) {
  const res = await client.post<ApiSuccess<{ accessToken: string; expiresIn: number }>>(
    '/auth/refresh-token',
    { refreshToken: refreshTokenValue }
  );
  return res.data;
}

export async function logout() {
  const res = await client.post<ApiSuccess<unknown>>('/auth/logout');
  return res.data;
}

export async function getMe() {
  const res = await client.get<
    ApiSuccess<{
      user: {
        _id: string;
        phoneNumber: string;
        roles: string[];
        isActive: boolean;
        verificationStatus?: string;
        createdAt: string;
      };
    }>
  >('/auth/me');
  return res.data;
}
