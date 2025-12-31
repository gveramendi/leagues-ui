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

// User interfaces
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
}

// Resource interfaces
export type ResourceType = 'API' | 'VIEW';

export interface ResourceResponse {
  id: number;
  code: string;
  name: string;
  type: ResourceType;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateResourceRequest {
  code: string;
  name: string;
  type: ResourceType;
}

export interface UpdateResourceRequest {
  name?: string;
  type?: ResourceType;
}

// Permission interfaces
export interface PermissionResponse {
  id: number;
  roleId: number;
  roleName: string;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  canCreate: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExecute: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionRequest {
  roleId: number;
  resourceId: number;
  canCreate: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExecute: boolean;
}

// Menu interfaces
export interface MenuResponse {
  id: number;
  code: string;
  title: string;
  resourceId: number;
  resourceCode?: string;
  resourceName?: string;
  path?: string;
  iconType?: string;
  icon?: string;
  className?: string;
  groupTitle?: boolean;
  groupName?: string;
  badge?: string;
  badgeClass?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuRequest {
  code: string;
  title: string;
  resourceId: number;
  path?: string;
  iconType?: string;
  icon?: string;
  className?: string;
  groupTitle?: boolean;
  groupName?: string;
  badge?: string;
  badgeClass?: string;
  displayOrder?: number;
}

export interface UpdateMenuRequest {
  title: string;
  path?: string;
  iconType?: string;
  icon?: string;
  className?: string;
  groupTitle?: boolean;
  groupName?: string;
  badge?: string;
  badgeClass?: string;
}

// MenuItem interfaces
export interface MenuItemResponse {
  id: number;
  menuId: number;
  menuCode?: string;
  parentId?: number;
  resourceId?: number;
  resourceCode?: string;
  title: string;
  icon?: string;
  path?: string;
  iconType?: string;
  className?: string;
  groupTitle?: boolean;
  badge?: string;
  badgeClass?: string;
  displayOrder: number;
  children?: MenuItemResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuItemRequest {
  menuId: number;
  parentId?: number;
  resourceId?: number;
  title: string;
  icon?: string;
  path?: string;
  iconType?: string;
  className?: string;
  groupTitle?: boolean;
  badge?: string;
  badgeClass?: string;
  displayOrder: number;
}

export interface UpdateMenuItemRequest {
  parentId?: number;
  resourceId?: number;
  title?: string;
  icon?: string;
  path?: string;
  iconType?: string;
  className?: string;
  groupTitle?: boolean;
  badge?: string;
  badgeClass?: string;
  displayOrder?: number;
}
