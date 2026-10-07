import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from '../common/dto/pagination.dto';

const MERCHANT_A = 'merchant-a';
const MERCHANT_B = 'merchant-b';

const userRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  name: 'User One',
  email: 'one@example.com',
  username: 'one',
  password_hash: 'hashed',
  merchant_id: MERCHANT_A,
  avatar_upload_id: null,
  ...overrides,
});

/**
 * Tenant isolation: every query on `users` must be scoped by the merchant id
 * the controller reads from the authenticated user.
 */
describe('UsersService tenant scoping', () => {
  let service: UsersService;
  let prisma: {
    users: Record<
      'findMany' | 'findFirst' | 'count' | 'create' | 'update',
      jest.Mock
    >;
    uploads: Record<'findFirst', jest.Mock>;
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      users: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      uploads: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
    };
    const uploads = {
      generateSignedUrl: jest.fn().mockResolvedValue({ url: 'signed-url' }),
    };
    service = new UsersService(prisma as any, uploads as any);
  });

  describe('findAll', () => {
    it('filters the list and the count by merchant_id', async () => {
      await service.findAll(MERCHANT_A, new PaginationDto());

      const where = { merchant_id: MERCHANT_A };
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where }),
      );
      expect(prisma.users.count).toHaveBeenCalledWith({ where });
    });

    it('returns { data, meta } and never password_hash', async () => {
      prisma.users.findMany.mockResolvedValue([userRow()]);
      prisma.users.count.mockResolvedValue(1);

      const result = await service.findAll(MERCHANT_A, new PaginationDto());

      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password_hash');
    });
  });

  describe('findOne', () => {
    it('looks the user up by id and merchant_id together', async () => {
      prisma.users.findFirst.mockResolvedValue(userRow());

      await service.findOne('user-1', MERCHANT_A);

      expect(prisma.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1', merchant_id: MERCHANT_A },
        }),
      );
    });

    it('throws NotFoundException for a user of another merchant', async () => {
      // The scoped lookup finds nothing for merchant B.
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', MERCHANT_B)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('writes', () => {
    it('does not update a user of another merchant', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(
        service.update('user-1', { name: 'Hacked' }, MERCHANT_B, 'actor'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('does not deactivate a user of another merchant', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('user-1', MERCHANT_B, 'actor'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('soft-deletes: remove sets is_active to false', async () => {
      prisma.users.findFirst.mockResolvedValue(userRow());
      prisma.users.update.mockResolvedValue(userRow({ is_active: false }));

      await service.remove('user-1', MERCHANT_A, 'actor');

      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            is_active: false,
            updated_by: 'actor',
          }),
        }),
      );
    });

    it('creates the user under the given merchant with audit columns', async () => {
      prisma.users.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'user-2', ...data }),
      );

      const created = await service.create(
        {
          name: 'Two',
          username: 'two',
          email: 'two@example.com',
          password: 'secret123',
        } as any,
        MERCHANT_A,
        'actor',
      );

      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { email: 'two@example.com' },
      });
      expect(prisma.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          merchant_id: MERCHANT_A,
          created_by: 'actor',
          updated_by: 'actor',
        }),
      });
      expect(created).not.toHaveProperty('password_hash');
    });
  });

  /**
   * Login identifies an account by email alone, so an email is unique across
   * all merchants. A username is still unique per merchant.
   */
  describe('email uniqueness', () => {
    const dto = {
      name: 'Two',
      username: 'two',
      email: 'taken@example.com',
      password: 'secret123',
    } as any;

    it('rejects an email held by a user of another merchant on create', async () => {
      prisma.users.findFirst.mockImplementation(
        ({ where }: { where: { email?: string } }) =>
          Promise.resolve(
            where.email
              ? userRow({ id: 'user-9', merchant_id: MERCHANT_B })
              : null,
          ),
      );

      await expect(service.create(dto, MERCHANT_A, 'actor')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.users.create).not.toHaveBeenCalled();
    });

    it('rejects an email held by a user of another merchant on update', async () => {
      prisma.users.findFirst.mockImplementation(
        ({ where }: { where: { id?: string; email?: string } }) =>
          Promise.resolve(
            where.email
              ? userRow({ id: 'user-9', merchant_id: MERCHANT_B })
              : userRow(),
          ),
      );

      await expect(
        service.update(
          'user-1',
          { email: 'taken@example.com' },
          MERCHANT_A,
          'actor',
        ),
      ).rejects.toThrow(ConflictException);
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('still checks a username inside the merchant only', async () => {
      prisma.users.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'user-2', ...data }),
      );

      await service.create(dto, MERCHANT_A, 'actor');

      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { merchant_id: MERCHANT_A, username: 'two' },
      });
    });
  });

  describe('avatar', () => {
    beforeEach(() => {
      prisma.users.findFirst.mockResolvedValue(userRow());
      prisma.users.update.mockResolvedValue(userRow());
    });

    it('looks the upload up inside the caller’s merchant', async () => {
      prisma.uploads.findFirst.mockResolvedValue({ id: 'up-1' });

      await service.setAvatar('user-1', 'up-1', MERCHANT_A, 'actor');

      expect(prisma.uploads.findFirst).toHaveBeenCalledWith({
        where: { id: 'up-1', merchant_id: MERCHANT_A },
      });
    });

    it('rejects an upload that does not exist or belongs to another merchant', async () => {
      await expect(
        service.setAvatar('user-1', 'up-1', MERCHANT_A, 'actor'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.users.update).not.toHaveBeenCalled();
    });
  });
});
