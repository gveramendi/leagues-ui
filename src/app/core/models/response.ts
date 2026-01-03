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
export interface RoleResourceResponse {
  id: number;
  code: string;
  name: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
  resources?: RoleResourceResponse[];
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

export interface ResourceRoleResponse {
  id: number;
  name: string;
}

export interface ResourceResponse {
  id: number;
  code: string;
  name: string;
  type: ResourceType;
  roles?: ResourceRoleResponse[];
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
  resourceId: number;
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

// Club interfaces
export interface AddressDto {
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactInfoDto {
  email?: string;
  phone?: string;
  mobile?: string;
  contactPerson?: string;
}

export interface ClubResponse {
  id: number;
  name: string;
  code: string;
  shortName?: string;
  foundationDate?: string;
  logoUrl?: string;
  address?: AddressDto;
  contactInfo?: ContactInfoDto;
  colors?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  website?: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClubRequest {
  name: string;
  code: string;
  shortName?: string;
  foundationDate?: string;
  logoUrl?: string;
  address?: AddressDto;
  contactInfo?: ContactInfoDto;
  colors?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  website?: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
}

export interface UpdateClubRequest {
  name?: string;
  shortName?: string;
  foundationDate?: string;
  logoUrl?: string;
  address?: AddressDto;
  contactInfo?: ContactInfoDto;
  colors?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  website?: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
}

// Team enums
export type Category = 'SUB_8' | 'SUB_10' | 'SUB_12' | 'SUB_14' | 'SUB_15' | 'SUB_16' | 'SUB_17' | 'SUB_18' | 'SUB_19' | 'SUB_20' | 'SUB_21' | 'SUB_23' | 'PRIMERA' | 'RESERVA' | 'SENIOR' | 'MASTER' | 'SUPER_MASTER' | 'LIBRE';
export type Gender = 'MALE' | 'FEMALE' | 'MIXED';
export type FootballType = 'FOOTBALL_11' | 'FOOTBALL_9' | 'FOOTBALL_8' | 'FOOTBALL_7' | 'FOOTBALL_6' | 'FOOTBALL_5' | 'FUTSAL' | 'BEACH_SOCCER';
export type TeamStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DISSOLVED';

// Team interfaces
export interface TeamResponse {
  id: number;
  clubId: number;
  clubName?: string;
  clubCode?: string;
  name: string;
  code: string;
  fullName?: string;
  category: Category;
  gender: Gender;
  footballType: FootballType;
  seasonYear: number;
  status: TeamStatus;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homeVenue?: string;
  description?: string;
  maxPlayers?: number;
  minPlayers?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamRequest {
  clubId: number;
  name: string;
  code: string;
  category: Category;
  gender: Gender;
  footballType: FootballType;
  seasonYear: number;
  status: TeamStatus;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homeVenue?: string;
  description?: string;
  maxPlayers?: number;
  minPlayers?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  category?: Category;
  gender?: Gender;
  footballType?: FootballType;
  seasonYear?: number;
  status?: TeamStatus;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homeVenue?: string;
  description?: string;
  maxPlayers?: number;
  minPlayers?: number;
}
