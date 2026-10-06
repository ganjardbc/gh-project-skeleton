<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Groups -->
    <div
      v-for="(group, groupIndex) in filteredGroups"
      :key="group.key"
      class="w-full flex flex-col gap-1"
    >
      <SectionHeader
        :label="group.label"
        :is-collapsed="isCollapsed"
        :is-first="groupIndex === 0"
      />

      <!-- Menu Items -->
      <MenuItem
        v-for="item in group.menus"
        :key="item.key"
        :item="item"
        :is-collapsed="isCollapsed"
        :is-active="isActive(item)"
        @navigate="$emit('navigate')"
      >
        <!-- Submenu Items -->
        <SubmenuContainer
          v-for="child in item.menus ?? []"
          :key="child.route"
          :item="child"
          :is-collapsed="isCollapsed"
          :is-active="child.route === activeChildRoute(item)"
          @navigate="$emit('navigate')"
        />
      </MenuItem>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { isHasPermission } from '@/helpers/auth.ts';
import groups from '@/services/menus.ts';
import type { SidebarGroup, SidebarMenu } from '@/types/menu.ts';
import MenuItem from './UiSidebarMenuItem.vue';
import SectionHeader from './UiSidebarMenuSectionHeader.vue';
import SubmenuContainer from './UiSidebarSubmenuContainer.vue';

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['navigate']);

const route = useRoute();

const isAllowed = (item: { permissions?: string[]; featureFlag: boolean }): boolean =>
  item.featureFlag &&
  (!item.permissions || item.permissions.some((permission) => isHasPermission(permission)));

const filterMenu = (menu: SidebarMenu): SidebarMenu | null => {
  if (!isAllowed(menu)) {
    return null;
  }
  if (!menu.menus) {
    return menu;
  }
  // A menu holding submenus is only worth showing when one of them is reachable.
  const children = menu.menus.filter(isAllowed);
  return children.length ? { ...menu, menus: children } : null;
};

const filteredGroups = computed<SidebarGroup[]>(() =>
  groups
    .map((group) => ({
      ...group,
      menus: group.menus
        .map(filterMenu)
        .filter((menu): menu is SidebarMenu => menu !== null),
    }))
    .filter((group) => group.menus.length)
);

const isUnderPath = (path: string): boolean =>
  route.path === path || route.path.startsWith(`${path}/`);

// The deepest matching submenu wins, so `/user` stays inactive while on `/user/settings`.
const activeChildRoute = (menu: SidebarMenu): string | undefined =>
  (menu.menus ?? [])
    .map((child) => child.route)
    .filter(isUnderPath)
    .sort((a, b) => b.length - a.length)[0];

const isActive = (menu: SidebarMenu): boolean => {
  if (menu.menus) {
    return activeChildRoute(menu) !== undefined;
  }
  const routePath = (menu.route || '').split('/')[1];
  const routeName = route.path.split('/')[1];
  return routePath === routeName;
};
</script>
