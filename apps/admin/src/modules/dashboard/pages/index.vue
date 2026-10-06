<template>
  <div class="w-full space-y-4">
    <!-- Welcome -->
    <UiCard>
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <UiWrapIcon
          icon="pi pi-user"
          bg-color="bg-primary-50 dark:bg-dark"
          icon-color="text-primary-500 dark:text-primary-400"
        />
        <div class="flex-1 min-w-0">
          <div class="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            Welcome back, {{ user.name || user.username || 'there' }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ merchant.name || '-' }}
          </div>
        </div>
        <UiBadge
          v-if="role.name"
          variant="primary"
          class="capitalize self-start md:self-center"
          :label="role.name"
        />
      </div>
    </UiCard>

    <!-- Summary -->
    <div
      v-if="stats.length"
      class="grid grid-cols-2 xl:grid-cols-4 gap-4"
    >
      <router-link
        v-for="stat in stats"
        :key="stat.key"
        :to="stat.route"
      >
        <UiCard hoverable class="h-full">
          <div class="flex items-center gap-4">
            <UiWrapIcon
              :icon="stat.icon"
              bg-color="bg-primary-50 dark:bg-dark"
              icon-color="text-primary-500 dark:text-primary-400"
            />
            <div class="min-w-0">
              <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ stat.label }}
              </div>
              <Skeleton
                v-if="stat.loading"
                width="3rem"
                height="2rem"
              />
              <div
                v-else
                class="text-2xl font-bold text-gray-900 dark:text-gray-100"
              >
                {{ stat.value ?? '-' }}
              </div>
            </div>
          </div>
        </UiCard>
      </router-link>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- Recent users -->
      <UiCard v-if="isCanReadUser">
        <template #header>
          <UiCardHeader
            title="Recent Users"
            subtitle="Latest users in your merchant"
          >
            <router-link :to="PRP_USER">
              <Button
                severity="secondary"
                variant="text"
                size="small"
                label="View all"
              />
            </router-link>
          </UiCardHeader>
        </template>

        <UiLoading v-if="users.loading" />
        <div
          v-else-if="!users.items.length"
          class="py-6 text-sm text-gray-400 text-center"
        >
          {{ users.error || 'Users are empty.' }}
        </div>
        <div
          v-else
          class="flex flex-col divide-y divide-gray-200 dark:divide-dark-line"
        >
          <div
            v-for="item in users.items"
            :key="item.id"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <img
              v-if="item.avatar"
              :src="item.avatar"
              alt=""
              class="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <UiWrapIcon
              v-else
              icon="pi pi-user"
              size="40px"
              bg-color="bg-gray-100 dark:bg-dark"
              icon-color="text-gray-400"
            />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {{ item.name }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ item.email }}
              </div>
            </div>
            <Tag
              :value="item.is_active ? 'Active' : 'Inactive'"
              :severity="item.is_active ? 'success' : 'danger'"
            />
          </div>
        </div>
      </UiCard>

      <!-- Merchants -->
      <UiCard v-if="isCanReadMerchants">
        <template #header>
          <UiCardHeader
            title="Merchants"
            subtitle="Merchants you have access to"
          >
            <router-link :to="PRP_MERCHANTS">
              <Button
                severity="secondary"
                variant="text"
                size="small"
                label="View all"
              />
            </router-link>
          </UiCardHeader>
        </template>

        <UiLoading v-if="merchants.loading" />
        <div
          v-else-if="!merchants.items.length"
          class="py-6 text-sm text-gray-400 text-center"
        >
          {{ merchants.error || 'Merchants are empty.' }}
        </div>
        <div
          v-else
          class="flex flex-col divide-y divide-gray-200 dark:divide-dark-line"
        >
          <router-link
            v-for="item in merchants.items"
            :key="item.id"
            :to="{ name: `${PRN_MERCHANTS}-detail`, params: { id: item.id } }"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <img
              v-if="item.logo"
              :src="item.logo"
              alt=""
              class="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <UiWrapIcon
              v-else
              icon="pi pi-shop"
              size="40px"
              bg-color="bg-gray-100 dark:bg-dark"
              icon-color="text-gray-400"
            />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {{ item.name }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ item.address || '-' }}
              </div>
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {{ item.phone || '-' }}
            </div>
          </router-link>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { UiBadge, UiCard, UiCardHeader, UiLoading, UiWrapIcon } from '@gh-skeleton/ui';
import { getPersonalInformation, isHasPermission } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';

import { getListUser } from '@/modules/user/services/api.ts';
import { PREFIX_ROUTE_PATH as PRP_USER } from '@/modules/user/services/constants.ts';
import { READ as USER_READ } from '@/modules/user/services/rbac.ts';

import { getListRole } from '@/modules/role/services/api.ts';
import { PREFIX_ROUTE_PATH as PRP_ROLE } from '@/modules/role/services/constants.ts';
import { READ as ROLE_READ } from '@/modules/role/services/rbac.ts';

import { getListPermission } from '@/modules/permission/services/api.ts';
import { PREFIX_ROUTE_PATH as PRP_PERMISSION } from '@/modules/permission/services/constants.ts';
import { READ as PERMISSION_READ } from '@/modules/permission/services/rbac.ts';

import { getListMerchants } from '@/modules/merchants/services/api.ts';
import {
  PREFIX_ROUTE_PATH as PRP_MERCHANTS,
  PREFIX_ROUTE_NAME as PRN_MERCHANTS,
} from '@/modules/merchants/services/constants.ts';
import { READ as MERCHANTS_READ } from '@/modules/merchants/services/rbac.ts';

const RECENT_LIMIT = 5;

const { user, role, merchant } = getPersonalInformation();

// RBAC
const isCanReadUser = isHasPermission(USER_READ);
const isCanReadMerchants = isHasPermission(MERCHANTS_READ);

// Summary
interface Stat {
  key: string;
  label: string;
  icon: string;
  route: string;
  permission: string;
  value: number | null;
  loading: boolean;
}

const allStats = reactive<Stat[]>([
  { key: 'user', label: 'Users', icon: 'pi pi-users', route: PRP_USER, permission: USER_READ, value: null, loading: true },
  { key: 'role', label: 'Roles', icon: 'pi pi-flag', route: PRP_ROLE, permission: ROLE_READ, value: null, loading: true },
  { key: 'permission', label: 'Permissions', icon: 'pi pi-shield', route: PRP_PERMISSION, permission: PERMISSION_READ, value: null, loading: true },
  { key: 'merchants', label: 'Merchants', icon: 'pi pi-shop', route: PRP_MERCHANTS, permission: MERCHANTS_READ, value: null, loading: true },
]);

const stats = computed(() => allStats.filter((stat) => isHasPermission(stat.permission)));

const setStat = (key: string, value: number | null) => {
  const stat = allStats.find((item) => item.key === key);
  if (stat) {
    stat.value = value;
    stat.loading = false;
  }
};

// The list endpoints return the total in `meta`, so one row is enough for a count.
const fetchTotal = async (key: string, request: (params: any) => Promise<any>) => {
  try {
    const response = await request({ page: 1, limit: 1 });
    setStat(key, response?.data?.data?.meta?.total ?? null);
  } catch (error) {
    console.log(error);
    setStat(key, null);
  }
};

// Recent users
const users = reactive({
  items: [] as any[],
  loading: true,
  error: '',
});

const fetchUsers = async () => {
  try {
    const response = await getListUser({ page: 1, limit: RECENT_LIMIT });
    const { data, meta } = response?.data?.data || {};
    users.items = data || [];
    setStat('user', meta?.total ?? null);
  } catch (error) {
    users.error = getErrorMessage(error) || 'There was an error.';
    setStat('user', null);
  } finally {
    users.loading = false;
  }
};

// Merchants
const merchants = reactive({
  items: [] as any[],
  loading: true,
  error: '',
});

const fetchMerchants = async () => {
  try {
    const response = await getListMerchants({ page: 1, limit: RECENT_LIMIT });
    const { data, meta } = response?.data?.data || {};
    merchants.items = data || [];
    setStat('merchants', meta?.total ?? null);
  } catch (error) {
    merchants.error = getErrorMessage(error) || 'There was an error.';
    setStat('merchants', null);
  } finally {
    merchants.loading = false;
  }
};

onMounted(() => {
  if (isCanReadUser) fetchUsers();
  if (isCanReadMerchants) fetchMerchants();
  if (isHasPermission(ROLE_READ)) fetchTotal('role', getListRole);
  if (isHasPermission(PERMISSION_READ)) fetchTotal('permission', getListPermission);
});
</script>
