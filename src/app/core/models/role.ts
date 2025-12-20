import { Permission } from './permission';

export class Role {
  id!: number;
  name!: string;
  description?: string;

  // Permissions associated with this role
  permissions?: Permission[];
}