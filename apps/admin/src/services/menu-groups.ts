// Sidebar groups. Modules point at a group by key from their services/menu.ts.
export const MENU_GROUPS = {
  main: { label: 'Main', order: 1 },
  management: { label: 'Management', order: 2 },
  access: { label: 'Access Control', order: 3 },
} as const;
