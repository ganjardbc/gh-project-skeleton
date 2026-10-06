import type { ModuleMenuEntry } from '@/types/menu.ts';
import { PREFIX_ROUTE_PATH } from '@/modules/permission/services/constants.ts';
import { PERMISSIONS } from '@/modules/permission/services/rbac.ts';

export default [
  {
    key: 'permission',
    group: 'access',
    order: 2,
    icon: 'pi pi-shield',
    label: 'Permissions',
    route: PREFIX_ROUTE_PATH,
    permissions: PERMISSIONS,
  },
] satisfies ModuleMenuEntry[];
