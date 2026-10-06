import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';

const roleWith = (...codes: string[]) => ({
  roles: {
    role_permissions: codes.map((code) => ({ permissions: { code } })),
  },
});

const contextFor = (user?: { id: string }) =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let prisma: { user_roles: { findMany: jest.Mock } };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    prisma = { user_roles: { findMany: jest.fn().mockResolvedValue([]) } };
    guard = new PermissionGuard(
      reflector as unknown as Reflector,
      prisma as any,
    );
  });

  it('allows a handler without @RequirePermission and skips the database', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(contextFor({ id: 'u1' }))).resolves.toBe(
      true,
    );
    expect(prisma.user_roles.findMany).not.toHaveBeenCalled();
  });

  it('rejects a request without an authenticated user', async () => {
    reflector.getAllAndOverride.mockReturnValue('user.create');

    await expect(guard.canActivate(contextFor())).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects a user whose roles lack the permission code', async () => {
    reflector.getAllAndOverride.mockReturnValue('user.create');
    prisma.user_roles.findMany.mockResolvedValue([roleWith('user.read')]);

    await expect(guard.canActivate(contextFor({ id: 'u1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('grants access when any of the user roles has the code', async () => {
    reflector.getAllAndOverride.mockReturnValue('user.create');
    prisma.user_roles.findMany.mockResolvedValue([
      roleWith('user.read'),
      roleWith('user.create'),
    ]);

    await expect(guard.canActivate(contextFor({ id: 'u1' }))).resolves.toBe(
      true,
    );
  });

  it('loads roles for the authenticated user only', async () => {
    reflector.getAllAndOverride.mockReturnValue('user.read');
    prisma.user_roles.findMany.mockResolvedValue([roleWith('user.read')]);

    await guard.canActivate(contextFor({ id: 'u1' }));

    expect(prisma.user_roles.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user_id: 'u1' } }),
    );
  });
});
