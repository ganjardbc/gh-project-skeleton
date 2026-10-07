import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { PaginationDto } from '../common/dto/pagination.dto';

const MERCHANT_A = 'merchant-a';
const MERCHANT_B = 'merchant-b';

const merchantRow = (overrides: Record<string, unknown> = {}) => ({
  id: MERCHANT_A,
  slug: 'company-a',
  name: 'Company A',
  logo: null,
  logo_upload_id: null,
  ...overrides,
});

/**
 * Tenant isolation: a user reads and changes only the merchant they belong to.
 */
describe('MerchantsService', () => {
  let service: MerchantsService;
  let prisma: {
    merchants: Record<
      'findMany' | 'findUnique' | 'count' | 'create' | 'update' | 'delete',
      jest.Mock
    >;
    uploads: Record<'findUnique', jest.Mock>;
    $transaction: jest.Mock;
  };
  let uploads: { generateSignedUrl: jest.Mock };

  beforeEach(() => {
    prisma = {
      merchants: {
        findMany: jest.fn().mockResolvedValue([]),
        // Every merchant exists and none is the admin merchant.
        findUnique: jest.fn(({ where }: { where: { id?: string } }) =>
          Promise.resolve(merchantRow({ id: where.id ?? MERCHANT_A })),
        ),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      uploads: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
    };
    uploads = {
      generateSignedUrl: jest.fn().mockResolvedValue({ url: 'signed-url' }),
    };
    service = new MerchantsService(prisma as any, uploads as any);
  });

  describe('findAll', () => {
    it('filters the list and the count to the caller’s merchant', async () => {
      await service.findAll(new PaginationDto(), MERCHANT_A);

      const where = { id: MERCHANT_A };
      expect(prisma.merchants.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where }),
      );
      expect(prisma.merchants.count).toHaveBeenCalledWith({ where });
    });

    it('returns { data, meta } with a signed logo URL', async () => {
      prisma.merchants.findMany.mockResolvedValue([
        merchantRow({ logo_upload_id: 'up-1' }),
      ]);
      prisma.merchants.count.mockResolvedValue(1);

      const result = await service.findAll(new PaginationDto(), MERCHANT_A);

      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(result.data[0].logo).toBe('signed-url');
    });
  });

  describe('findOne', () => {
    it('returns the caller’s own merchant', async () => {
      const merchant = await service.findOne(MERCHANT_A, MERCHANT_A);

      expect(merchant.id).toBe(MERCHANT_A);
    });

    it('throws ForbiddenException for another merchant', async () => {
      await expect(service.findOne(MERCHANT_B, MERCHANT_A)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when the merchant does not exist', async () => {
      prisma.merchants.findUnique.mockResolvedValue(null);

      await expect(service.findOne(MERCHANT_A, MERCHANT_A)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('rejects a slug that is taken', async () => {
      await expect(
        service.create({ slug: 'company-a', name: 'Copy' } as any, 'actor'),
      ).rejects.toThrow(ConflictException);
      expect(prisma.merchants.create).not.toHaveBeenCalled();
    });

    it('creates the merchant with audit columns', async () => {
      prisma.merchants.findUnique.mockResolvedValue(null);

      await service.create({ slug: 'new-co', name: 'New Co' } as any, 'actor');

      expect(prisma.merchants.create).toHaveBeenCalledWith({
        data: {
          slug: 'new-co',
          name: 'New Co',
          created_by: 'actor',
          updated_by: 'actor',
        },
      });
    });
  });

  describe('writes', () => {
    it('does not update another merchant', async () => {
      await expect(
        service.update(MERCHANT_B, { name: 'Hacked' }, 'actor', MERCHANT_A),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.merchants.update).not.toHaveBeenCalled();
    });

    it('rejects changing the slug to one another merchant holds', async () => {
      prisma.merchants.findUnique.mockImplementation(
        ({ where }: { where: { id?: string; slug?: string } }) =>
          Promise.resolve(
            where.slug
              ? merchantRow({ id: MERCHANT_B, slug: where.slug })
              : merchantRow({ id: where.id }),
          ),
      );

      await expect(
        service.update(MERCHANT_A, { slug: 'company-b' }, 'actor', MERCHANT_A),
      ).rejects.toThrow(ConflictException);
      expect(prisma.merchants.update).not.toHaveBeenCalled();
    });

    it('updates the caller’s merchant and records who did it', async () => {
      await service.update(
        MERCHANT_A,
        { name: 'Renamed' },
        'actor',
        MERCHANT_A,
      );

      expect(prisma.merchants.update).toHaveBeenCalledWith({
        where: { id: MERCHANT_A },
        data: expect.objectContaining({ name: 'Renamed', updated_by: 'actor' }),
      });
    });

    it('does not delete another merchant', async () => {
      await expect(service.remove(MERCHANT_B, MERCHANT_A)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.merchants.delete).not.toHaveBeenCalled();
    });
  });

  describe('logo', () => {
    it('does not set a logo on another merchant', async () => {
      await expect(
        service.setImage(MERCHANT_B, 'up-1', MERCHANT_A, 'actor'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.merchants.update).not.toHaveBeenCalled();
    });

    it('rejects an upload that does not exist', async () => {
      await expect(
        service.setImage(MERCHANT_A, 'missing', MERCHANT_A, 'actor'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.merchants.update).not.toHaveBeenCalled();
    });

    it('stores the upload id and its URL', async () => {
      prisma.uploads.findUnique.mockResolvedValue({ id: 'up-1' });

      await service.setImage(MERCHANT_A, 'up-1', MERCHANT_A, 'actor');

      expect(prisma.merchants.update).toHaveBeenCalledWith({
        where: { id: MERCHANT_A },
        data: expect.objectContaining({
          logo_upload_id: 'up-1',
          logo: 'signed-url',
          updated_by: 'actor',
        }),
      });
    });

    it('clears the logo', async () => {
      await service.removeImage(MERCHANT_A, MERCHANT_A, 'actor');

      expect(prisma.merchants.update).toHaveBeenCalledWith({
        where: { id: MERCHANT_A },
        data: expect.objectContaining({ logo_upload_id: null, logo: null }),
      });
    });

    it('does not clear the logo of another merchant', async () => {
      await expect(
        service.removeImage(MERCHANT_B, MERCHANT_A, 'actor'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.merchants.update).not.toHaveBeenCalled();
    });
  });
});
