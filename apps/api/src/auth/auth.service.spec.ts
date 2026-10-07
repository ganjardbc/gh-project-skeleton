import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const compare = bcrypt.compare as unknown as jest.Mock;
const hash = bcrypt.hash as unknown as jest.Mock;

const userRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  name: 'User One',
  email: 'one@example.com',
  username: 'one',
  password_hash: 'hashed',
  merchant_id: 'merchant-a',
  avatar: null,
  avatar_upload_id: null,
  is_active: true,
  merchants: {
    id: 'merchant-a',
    name: 'Merchant A',
    slug: 'merchant-a',
    logo: null,
    logo_upload_id: null,
  },
  ...overrides,
});

const userRoleRow = () => ({
  roles: {
    id: 'role-1',
    name: 'owner',
    description: 'Owner',
    role_permissions: [
      {
        permissions: { id: 'perm-1', code: 'user.read', description: 'Read' },
      },
    ],
  },
});

const registerDto = () => ({
  name: 'New Owner',
  email: 'owner@new.com',
  password: 'secret123',
  merchant: { slug: 'new-co', name: 'New Co' },
});

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    users: Record<'findFirst' | 'findUnique' | 'create', jest.Mock>;
    merchants: Record<'findUnique' | 'create', jest.Mock>;
    roles: Record<'findFirst', jest.Mock>;
    user_roles: Record<'findMany' | 'create', jest.Mock>;
    $transaction: jest.Mock;
  };
  let jwt: { sign: jest.Mock };
  let uploads: { generateSignedUrl: jest.Mock };

  beforeEach(() => {
    prisma = {
      users: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      merchants: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      roles: { findFirst: jest.fn() },
      user_roles: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      },
      // Callback form: the service receives the same mock as `tx`.
      $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
    };
    jwt = { sign: jest.fn().mockReturnValue('signed-token') };
    uploads = { generateSignedUrl: jest.fn() };
    compare.mockReset().mockResolvedValue(true);
    hash.mockReset().mockResolvedValue('new-hash');
    service = new AuthService(prisma as any, jwt as any, uploads as any);
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      await expect(
        service.login({ email: 'nobody@example.com', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('rejects an inactive user before checking the password', async () => {
      prisma.users.findUnique.mockResolvedValue(userRow({ is_active: false }));

      await expect(
        service.login({ email: 'one@example.com', password: 'x' }),
      ).rejects.toThrow('User account is inactive');
      expect(compare).not.toHaveBeenCalled();
    });

    it('rejects a wrong password with the same message as an unknown email', async () => {
      prisma.users.findUnique.mockResolvedValue(userRow());
      compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'one@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid email or password');
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('returns a token, the user without password_hash, and the roles', async () => {
      prisma.users.findUnique.mockResolvedValue(userRow());
      prisma.user_roles.findMany.mockResolvedValue([userRoleRow()]);

      const result = await service.login({
        email: 'one@example.com',
        password: 'secret123',
      });

      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'one@example.com',
      });
      expect(result.access_token).toBe('signed-token');
      expect(result.token_type).toBe('Bearer');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user.merchant).toEqual(
        expect.objectContaining({ id: 'merchant-a' }),
      );
      expect(result.rbac).toEqual([
        {
          role: {
            id: 'role-1',
            name: 'owner',
            description: 'Owner',
            permissions: [
              { id: 'perm-1', code: 'user.read', description: 'Read' },
            ],
          },
        },
      ]);
    });

    it('falls back to the stored avatar URL when signing fails', async () => {
      prisma.users.findUnique.mockResolvedValue(
        userRow({ avatar: 'https://cdn/old.png', avatar_upload_id: 'up-1' }),
      );
      uploads.generateSignedUrl.mockRejectedValue(new Error('gone'));

      const result = await service.login({
        email: 'one@example.com',
        password: 'secret123',
      });

      expect(result.user.avatar).toBe('https://cdn/old.png');
    });
  });

  describe('register', () => {
    it('rejects a merchant slug that is taken', async () => {
      prisma.merchants.findUnique.mockResolvedValue({ id: 'merchant-x' });

      await expect(service.register(registerDto() as any)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects an email that is already registered', async () => {
      prisma.users.findUnique.mockResolvedValue(userRow());

      await expect(service.register(registerDto() as any)).rejects.toThrow(
        'Email already registered',
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates the merchant, the user, and the owner role in one transaction', async () => {
      prisma.merchants.create.mockResolvedValue({
        id: 'merchant-new',
        name: 'New Co',
        slug: 'new-co',
      });
      prisma.users.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'user-new', merchants: {}, ...data }),
      );
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-owner' });

      const result = await service.register(registerDto() as any);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            merchant_id: 'merchant-new',
            username: 'owner',
            password_hash: 'new-hash',
            is_active: true,
          }),
        }),
      );
      expect(prisma.roles.findFirst).toHaveBeenCalledWith({
        where: { name: 'owner' },
      });
      expect(prisma.user_roles.create).toHaveBeenCalledWith({
        data: { user_id: 'user-new', role_id: 'role-owner' },
      });
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.merchant).toEqual({
        id: 'merchant-new',
        name: 'New Co',
        slug: 'new-co',
      });
    });

    it('never stores the plain password', async () => {
      prisma.merchants.create.mockResolvedValue({ id: 'merchant-new' });
      prisma.users.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'user-new', ...data }),
      );
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-owner' });

      await service.register(registerDto() as any);

      expect(hash).toHaveBeenCalledWith('secret123', 10);
      const { data } = prisma.users.create.mock.calls[0][0];
      expect(JSON.stringify(data)).not.toContain('secret123');
    });

    it('fails when the owner role has not been seeded', async () => {
      prisma.merchants.create.mockResolvedValue({ id: 'merchant-new' });
      prisma.users.create.mockResolvedValue({ id: 'user-new' });
      prisma.roles.findFirst.mockResolvedValue(null);

      await expect(service.register(registerDto() as any)).rejects.toThrow(
        'Owner role not found',
      );
      expect(prisma.user_roles.create).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('rejects a user that no longer exists', async () => {
      await expect(service.getProfile('user-gone')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns the profile without password_hash', async () => {
      prisma.users.findUnique.mockResolvedValue(userRow());

      const profile = await service.getProfile('user-1');

      expect(prisma.users.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
      expect(profile).not.toHaveProperty('password_hash');
      expect(profile.merchant_id).toBe('merchant-a');
    });
  });
});
