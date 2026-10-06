import { MENU_GROUPS } from '@/services/menu-groups.ts';
import type {
  MenuGroupKey,
  ModuleMenu,
  ModuleMenuEntry,
  ModuleSubmenu,
  ModuleSubmenuRef,
  SidebarGroup,
  SidebarMenu,
} from '@/types/menu.ts';

// Each module registers its own sidebar entries in services/menu.ts.
const modules = import.meta.glob<{ default: ModuleMenuEntry[] }>(
  '../modules/**/services/menu.ts',
  { eager: true },
);

const entries = Object.values(modules).flatMap((fileModule) => fileModule.default || []);

const isSubmenuRef = (entry: ModuleMenuEntry): entry is ModuleSubmenuRef => 'parent' in entry;

const byOrder = <T extends { order?: number; label: string }>(a: T, b: T) =>
  (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label);

const warn = (message: string) => {
  if (import.meta.env.DEV) {
    console.warn(`[menus] ${message}`);
  }
};

const menus = entries.filter((entry): entry is ModuleMenu => !isSubmenuRef(entry));
const submenuRefs = entries.filter(isSubmenuRef);

// Submenus per menu key: inline `children` plus `parent` references from other modules.
const submenus = new Map<string, ModuleSubmenu[]>();

menus.forEach((menu) => {
  if (submenus.has(menu.key)) {
    warn(`Duplicate menu key "${menu.key}".`);
  }
  submenus.set(menu.key, [...(menu.children || [])]);
});

submenuRefs.forEach((submenu) => {
  const siblings = submenus.get(submenu.parent);
  if (!siblings) {
    warn(`Submenu "${submenu.label}" points at unknown parent "${submenu.parent}".`);
    return;
  }
  siblings.push(submenu);
});

const toSidebarMenu = (menu: ModuleMenu): SidebarMenu => {
  const children = [...(submenus.get(menu.key) || [])].sort(byOrder);

  return {
    key: menu.key,
    icon: menu.icon,
    label: menu.label,
    route: menu.route,
    permissions: menu.permissions,
    featureFlag: menu.featureFlag ?? true,
    menus: children.length
      ? children.map((child) => ({
          label: child.label,
          route: child.route,
          permissions: child.permissions,
          featureFlag: child.featureFlag ?? true,
        }))
      : undefined,
  };
};

const groups: SidebarGroup[] = (Object.keys(MENU_GROUPS) as MenuGroupKey[])
  .sort((a, b) => MENU_GROUPS[a].order - MENU_GROUPS[b].order)
  .map((key) => ({
    key,
    label: MENU_GROUPS[key].label,
    menus: menus
      .filter((menu) => menu.group === key)
      .sort(byOrder)
      .map(toSidebarMenu),
  }));

export default groups;
