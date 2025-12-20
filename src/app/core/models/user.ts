import { Role } from '@core/models/role';
import { Resource } from '@core/models/resource';

export class User {
  id!: number;
  email!: string;
  password?: string;
  firstName!: string;
  lastName!: string;
  token!: string;

  // Roles can be either string[] (from login response) or Role[] (from detailed user data)
  roles!: string[] | Role[];

  // Resources with permissions (populated after fetching permissions)
  resources?: Resource[];

  // Token metadata
  tokenType?: string;
  expiresIn?: number;
  issuedAt?: string;
  expiresAt?: string;
}

// Auth response DTO matching backend response
export interface AuthResponse {
  message: string;
  data: {
    token: string;
    tokenType: string;
    expiresIn: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    issuedAt: string;
    expiresAt: string;
  };
}
