export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}