export class Permission {
  id!: number;
  roleId!: number;
  resourceId!: number;
  canCreate!: boolean;
  canRead!: boolean;
  canWrite!: boolean;
  canDelete!: boolean;
  canExecute!: boolean;
}
