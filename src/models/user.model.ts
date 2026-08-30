export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: string;
}
