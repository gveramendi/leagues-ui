import { Role } from '@core/models/role';
import { Resource } from '@core/models/resource';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';

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

  // Menus from login response (dynamic sidebar)
  menus?: RouteInfo[];

  // Token metadata
  tokenType?: string;
  expiresIn?: number;
  issuedAt?: string;
  expiresAt?: string;
}

// Auth data from login response
export interface AuthData {
  token: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  menus: RouteInfo[];
  issuedAt: string;
  expiresAt: string;
}

// Auth response DTO matching backend response with header/body structure
export interface AuthResponse {
  header: {
    success: boolean;
    statusCode: number;
    message: string;
  };
  body: {
    data: AuthData;
  };
}
