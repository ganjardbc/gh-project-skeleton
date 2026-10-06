import type { MENU_GROUPS } from '@/services/menu-groups.ts';

export type MenuGroupKey = keyof typeof MENU_GROUPS;

// Submenu declared inline, under `children` of a menu in the same module.
export interface ModuleSubmenu {
  label: string;
  route: string;
  order?: number;
  permissions: string[];
  featureFlag?: boolean;
}

// Menu placed directly in a group.
export interface ModuleMenu {
  key: string;
  group: MenuGroupKey;
  order: number;
  icon: string;
  label: string;
  // Omit on a menu that only holds submenus.
  route?: string;
  // Omit on a menu that only holds submenus; it then shows when any submenu does.
  permissions?: string[];
  featureFlag?: boolean;
  children?: ModuleSubmenu[];
}

// Submenu attached to a menu owned by another module, by that menu's key.
export interface ModuleSubmenuRef extends ModuleSubmenu {
  parent: string;
}

export type ModuleMenuEntry = ModuleMenu | ModuleSubmenuRef;

// Resolved sidebar tree: group -> menu -> submenu.
export interface SidebarSubmenu {
  label: string;
  route: string;
  permissions: string[];
  featureFlag: boolean;
}

export interface SidebarMenu {
  key: string;
  icon: string;
  label: string;
  route?: string;
  permissions?: string[];
  featureFlag: boolean;
  menus?: SidebarSubmenu[];
}

export interface SidebarGroup {
  key: MenuGroupKey;
  label: string;
  menus: SidebarMenu[];
}
