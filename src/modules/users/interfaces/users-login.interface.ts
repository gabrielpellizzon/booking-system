export interface UserPayload {
  sub: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginResponse {
  access_token: string;
}
