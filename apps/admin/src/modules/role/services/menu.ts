import type { ModuleMenuEntry } from '@/types/menu.ts';
import { PREFIX_ROUTE_PATH } from '@/modules/role/services/constants.ts';
import { PERMISSIONS } from '@/modules/role/services/rbac.ts';

export default [
  {
    key: 'role',
    group: 'access',
    order: 1,
    icon: 'pi pi-flag',
    label: 'Roles',
    route: PREFIX_ROUTE_PATH,
    permissions: PERMISSIONS,
  },
] satisfies ModuleMenuEntry[];
