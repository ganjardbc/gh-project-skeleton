import type { ModuleMenuEntry } from '@/types/menu.ts';
import { PREFIX_ROUTE_PATH } from '@/modules/dashboard/services/constants.ts';
import { PERMISSIONS } from '@/modules/dashboard/services/rbac.ts';

export default [
  {
    key: 'dashboard',
    group: 'main',
    order: 1,
    icon: 'pi pi-objects-column',
    label: 'Dashboard',
    route: PREFIX_ROUTE_PATH,
    permissions: PERMISSIONS,
  },
] satisfies ModuleMenuEntry[];
