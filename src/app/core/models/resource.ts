import { Permission } from './permission';

export class Resource {
  // Backend fields
  id!: number;
  code!: string;
  name!: string;
  type!: string;

  // UI-specific fields (for sidebar rendering)
  title?: string;
  description?: string;
  order?: number;
  groupName?: string;
  badge?: string;
  badgeClass?: string;
  icon?: string;
  iconType?: string;
  path?: string;

  // Permission flags (populated from Permission entity)
  canCreate?: boolean;
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
  canExecute?: boolean;

  // Associated permission object
  permission?: Permission;
}