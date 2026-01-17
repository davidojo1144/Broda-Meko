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

  