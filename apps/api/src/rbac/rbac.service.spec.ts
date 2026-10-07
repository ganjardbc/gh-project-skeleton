import { ConflictException, NotFoundException } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PaginationDto } from '../common/dto/pagination.dto';

/**
 * Roles and permissions are global tables: these tests carry no merchant id.
 */
describe('RbacService', () => {
  let service: RbacService;
  let prisma: {
    roles: Record<
      'findFirst' | 'findMany' | 'count' | 'create' | 'update' | 'delete',
      jest.Mock
    >;
    permissions: Record<
      'findFirst' | 'findMany' | 'count' | 'create' | 'delete',
      jest.Mock
    >;
    role_permissions: Record<'findFirst' | 'create' | 'delete', jest.Mock>;
    user_roles: Record<
      'findFirst' | 'findMany' | 'create' | 'delete',
      jest.Mock
    >;
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      roles: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      permissions: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        delete: jest.fn(),
      },
      role_permissions: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        delete: jest.fn(),
      },
      user_roles: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
    };
    service = new RbacService(prisma as any);
  });

  describe('roles', () => {
    it('rejects a duplicate role name', async () => {
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-1', name: 'owner' });

      await expect(
        service.createRole({ name: 'owner' } as any, 'actor'),
      ).rejects.toThrow(ConflictException);
      expect(prisma.roles.create).not.toHaveBeenCalled();
    });

    it('creates a role with its name and description', async () => {
      await service.createRole(
        { name: 'editor', description: 'Edits' } as any,
        'actor',
      );

      expect(prisma.roles.create).toHaveBeenCalledWith({
        data: { name: 'editor', description: 'Edits' },
      });
    });

    it('lists roles as { data, meta }', async () => {
      prisma.roles.findMany.mockResolvedValue([{ id: 'role-1' }]);
      prisma.roles.count.mockResolvedValue(1);

      const result = await service.findAllRoles(new PaginationDto());

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('throws NotFoundException for an unknown role', async () => {
      await expect(service.findOneRole('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not update an unknown role', async () => {
      await expect(
        service.updateRole('missing', { name: 'x' } as any, 'actor'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.roles.update).not.toHaveBeenCalled();
    });

    it('rejects renaming a role to a name another role holds', async () => {
      prisma.roles.findFirst
        .mockResolvedValueOnce({ id: 'role-1', name: 'editor' })
        .mockResolvedValueOnce({ id: 'role-2', name: 'owner' });

      await expect(
        service.updateRole('role-1', { name: 'owner' } as any, 'actor'),
      ).rejects.toThrow(ConflictException);
      expect(prisma.roles.update).not.toHaveBeenCalled();
    });

    it('allows saving a role under its own name', async () => {
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-1', name: 'owner' });

      await service.updateRole('role-1', { name: 'owner' } as any, 'actor');

      expect(prisma.roles.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'role-1' } }),
      );
    });

    it('does not delete an unknown role', async () => {
      await expect(service.removeRole('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.roles.delete).not.toHaveBeenCalled();
    });
  });

  describe('permissions', () => {
    it('rejects a duplicate permission code', async () => {
      prisma.permissions.findFirst.mockResolvedValue({ id: 'perm-1' });

      await expect(
        service.createPermission({ code: 'user.read' } as any, 'actor'),
      ).rejects.toThrow(ConflictException);
      expect(prisma.permissions.create).not.toHaveBeenCalled();
    });

    it('creates a permission with audit columns', async () => {
      await service.createPermission(
        { code: 'product.read', description: 'Read products' } as any,
        'actor',
      );

      expect(prisma.permissions.create).toHaveBeenCalledWith({
        data: {
          code: 'product.read',
          description: 'Read products',
          created_by: 'actor',
          updated_by: 'actor',
        },
      });
    });

    it('does not delete an unknown permission', async () => {
      await expect(service.removePermission('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.permissions.delete).not.toHaveBeenCalled();
    });
  });

  describe('role permissions', () => {
    beforeEach(() => {
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-1' });
      prisma.permissions.findFirst.mockResolvedValue({ id: 'perm-1' });
    });

    it('does not assign a permission to an unknown role', async () => {
      prisma.roles.findFirst.mockResolvedValue(null);

      await expect(
        service.assignPermissionToRole(
          'missing',
          { permission_id: 'perm-1' },
          'actor',
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.role_permissions.create).not.toHaveBeenCalled();
    });

    it('does not assign an unknown permission', async () => {
      prisma.permissions.findFirst.mockResolvedValue(null);

      await expect(
        service.assignPermissionToRole(
          'role-1',
          { permission_id: 'missing' },
          'actor',
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.role_permissions.create).not.toHaveBeenCalled();
    });

    it('rejects assigning the same permission twice', async () => {
      prisma.role_permissions.findFirst.mockResolvedValue({
        role_id: 'role-1',
      });

      await expect(
        service.assignPermissionToRole(
          'role-1',
          { permission_id: 'perm-1' },
          'actor',
        ),
      ).rejects.toThrow(ConflictException);
      expect(prisma.role_permissions.create).not.toHaveBeenCalled();
    });

    it('assigns a permission with audit columns', async () => {
      await service.assignPermissionToRole(
        'role-1',
        { permission_id: 'perm-1' },
        'actor',
      );

      expect(prisma.role_permissions.create).toHaveBeenCalledWith({
        data: {
          role_id: 'role-1',
          permission_id: 'perm-1',
          created_by: 'actor',
          updated_by: 'actor',
        },
      });
    });

    it('does not revoke a permission the role does not hold', async () => {
      await expect(
        service.revokePermissionFromRole('role-1', 'perm-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.role_permissions.delete).not.toHaveBeenCalled();
    });

    it('revokes by the composite key', async () => {
      prisma.role_permissions.findFirst.mockResolvedValue({
        role_id: 'role-1',
      });

      await service.revokePermissionFromRole('role-1', 'perm-1');

      expect(prisma.role_permissions.delete).toHaveBeenCalledWith({
        where: {
          role_id_permission_id: { role_id: 'role-1', permission_id: 'perm-1' },
        },
      });
    });
  });

  describe('user roles', () => {
    const dto = { user_id: 'user-1', role_id: 'role-1' };

    it('does not assign an unknown role', async () => {
      await expect(service.assignRoleToUser(dto, 'actor')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('rejects assigning the same role twice', async () => {
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-1' });
      prisma.user_roles.findFirst.mockResolvedValue(dto);

      await expect(service.assignRoleToUser(dto, 'actor')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('assigns a role with audit columns', async () => {
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-1' });

      await service.assignRoleToUser(dto, 'actor');

      expect(prisma.user_roles.create).toHaveBeenCalledWith({
        data: { ...dto, created_by: 'actor', updated_by: 'actor' },
      });
    });

    it('does not revoke an assignment that does not exist', async () => {
      await expect(service.revokeRoleFromUser(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user_roles.delete).not.toHaveBeenCalled();
    });

    it('revokes by the composite key', async () => {
      prisma.user_roles.findFirst.mockResolvedValue(dto);

      await service.revokeRoleFromUser(dto);

      expect(prisma.user_roles.delete).toHaveBeenCalledWith({
        where: { user_id_role_id: dto },
      });
    });

    it('lists the roles of one user', async () => {
      await service.getUserRoles('user-1');

      expect(prisma.user_roles.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: 'user-1' } }),
      );
    });
  });
});
