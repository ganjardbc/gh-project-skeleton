import type { ModuleMenuEntry } from '@/types/menu.ts';
import { PREFIX_ROUTE_PATH } from '@/modules/user/services/constants.ts';
import { PERMISSIONS } from '@/modules/user/services/rbac.ts';

export default [
  {
    key: 'user',
    group: 'management',
    order: 2,
    icon: 'pi pi-users',
    label: 'Users',
    route: PREFIX_ROUTE_PATH,
    permissions: PERMISSIONS,
  },
] satisfies ModuleMenuEntry[];
