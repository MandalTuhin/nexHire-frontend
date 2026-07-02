export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'CANDIDATE' | 'HR' | 'ADMIN';

export interface AuthResponse {
  token: string;
  role: UserRole;
  userId: string;
  name: string;
}
