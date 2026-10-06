---
to: "src/modules/<%=h.changeCase.param(name)%>/services/menu.ts"
---
import type { ModuleMenuEntry } from '@/types/menu.ts';
import { PREFIX_ROUTE_PATH } from '@/modules/<%= h.changeCase.param(name) %>/services/constants.ts';
import { PERMISSIONS } from '@/modules/<%= h.changeCase.param(name) %>/services/rbac.ts';

// Sidebar entries for this module. Groups are defined in @/services/menu-groups.ts.
export default [
  {
    key: '<%= h.changeCase.param(name) %>',
    group: 'main',
    order: 99,
    icon: 'pi pi-box',
    label: '<%= h.changeCase.title(name) %>',
    route: PREFIX_ROUTE_PATH,
    permissions: PERMISSIONS,
  },
] satisfies ModuleMenuEntry[];
