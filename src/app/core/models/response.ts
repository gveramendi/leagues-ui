// API Response wrapper
export interface ApiResponse<T> {
  header: ApiHeader;
  body: ApiBody<T>;
}

export interface ApiHeader {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface ApiBody<T> {
  pagination?: PaginationInfo;
  data: T;
}

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Role interfaces
export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  description?: string;
}
