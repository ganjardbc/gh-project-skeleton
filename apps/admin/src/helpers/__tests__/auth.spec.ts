import { beforeEach, describe, expect, it } from 'vitest';
import {
  getMerchant,
  getPermissions,
  getRolesList,
  getToken,
  getUser,
  isHasPermission,
  removeAuth,
  setAuth,
} from '@/helpers/auth.ts';

const loginResponse = () => ({
  access_token: 'token-1',
  token_type: 'Bearer',
  user: {
    id: 'user-1',
    name: 'User One',
    merchant_id: 'merchant-a',
    merchant: { id: 'merchant-a', name: 'Merchant A' },
  },
  rbac: [
    {
      role: {
        id: 'role-1',
        name: 'owner',
        description: 'Owner',
        permissions: [{ code: 'user.read' }, { code: 'user.create' }],
      },
    },
    {
      role: {
        id: 'role-2',
        name: 'viewer',
        description: 'Viewer',
        permissions: [{ code: 'merchants.read' }],
      },
    },
  ],
});

describe('auth helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setAuth', () => {
    it('stores the token, the user, and the merchant separately', () => {
      setAuth(loginResponse());

      expect(getToken()).toBe('token-1');
      expect(getUser()).toEqual({ id: 'user-1', name: 'User One' });
      expect(getMerchant()).toEqual({ id: 'merchant-a', name: 'Merchant A' });
    });

    it('stores every role but only the first role’s permissions', () => {
      setAuth(loginResponse());

      expect(getRolesList().map((role: { name: string }) => role.name)).toEqual(['owner', 'viewer']);
      expect(getPermissions()).toEqual(['user.read', 'user.create']);
    });
  });

  describe('isHasPermission', () => {
    it('grants a code held by the first role', () => {
      setAuth(loginResponse());

      expect(isHasPermission('user.create')).toBe(true);
    });

    it('rejects a code held only by a later role', () => {
      setAuth(loginResponse());

      expect(isHasPermission('merchants.read')).toBe(false);
    });

    it('always grants dashboard.view, even when logged out', () => {
      expect(isHasPermission('dashboard.view')).toBe(true);
      expect(isHasPermission('user.read')).toBe(false);
    });
  });

  describe('removeAuth', () => {
    it('clears the session', () => {
      setAuth(loginResponse());
      removeAuth();

      expect(getToken()).toBe('');
      expect(getPermissions()).toEqual([]);
      expect(isHasPermission('user.read')).toBe(false);
    });
  });
});
