import type { ModuleMenuEntry } from '@/types/menu.ts';
import { PREFIX_ROUTE_PATH } from '@/modules/merchants/services/constants.ts';
import { PERMISSIONS } from '@/modules/merchants/services/rbac.ts';

export default [
  {
    key: 'merchants',
    group: 'management',
    order: 1,
    icon: 'pi pi-shop',
    label: 'Merchants',
    route: PREFIX_ROUTE_PATH,
    permissions: PERMISSIONS,
  },
] satisfies ModuleMenuEntry[];
