import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UploadsService } from './uploads.service';

const file = (overrides: Record<string, unknown> = {}) =>
  ({
    originalname: 'photo.png',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('x'),
    ...overrides,
  }) as Express.Multer.File;

const uploadRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'up-1',
  original_name: 'photo.png',
  mime_type: 'image/png',
  size: 1024,
  s3_key: 'uploads/photo.png',
  ...overrides,
});

const driver = (name: string) => ({
  upload: jest.fn().mockResolvedValue({
    key: `${name}/photo.png`,
    url: `https://${name}/photo.png`,
  }),
  getUrl: jest.fn().mockResolvedValue(`https://${name}/signed`),
  delete: jest.fn().mockResolvedValue(undefined),
});

describe('UploadsService', () => {
  const originalDriver = process.env.STORAGE_DRIVER;

  let prisma: {
    uploads: Record<'create' | 'findUnique' | 'delete', jest.Mock>;
  };
  let s3Config: { bucket: string; allowedMimeTypes: string[] };
  let s3: ReturnType<typeof driver>;
  let local: ReturnType<typeof driver>;

  // The driver is chosen in the constructor, from STORAGE_DRIVER.
  const build = (storageDriver?: string) => {
    if (storageDriver === undefined) delete process.env.STORAGE_DRIVER;
    else process.env.STORAGE_DRIVER = storageDriver;
    return new UploadsService(
      prisma as any,
      s3Config as any,
      s3 as any,
      local as any,
    );
  };

  beforeEach(() => {
    prisma = {
      uploads: {
        create: jest.fn(({ data }) => Promise.resolve({ id: 'up-1', ...data })),
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
      },
    };
    s3Config = {
      bucket: 'bucket-1',
      allowedMimeTypes: ['image/png', 'image/jpeg'],
    };
    s3 = driver('s3');
    local = driver('local');
  });

  afterAll(() => {
    if (originalDriver === undefined) delete process.env.STORAGE_DRIVER;
    else process.env.STORAGE_DRIVER = originalDriver;
  });

  describe('storage driver', () => {
    it('uses the local driver when STORAGE_DRIVER is unset', async () => {
      await build().upload(file(), 'user-1');

      expect(local.upload).toHaveBeenCalled();
      expect(s3.upload).not.toHaveBeenCalled();
    });

    it('uses the S3 driver when STORAGE_DRIVER is s3, in any case', async () => {
      await build('S3').upload(file(), 'user-1');

      expect(s3.upload).toHaveBeenCalled();
      expect(local.upload).not.toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    it('rejects a request without a file', async () => {
      await expect(
        build('local').upload(undefined as any, 'user-1'),
      ).rejects.toThrow(BadRequestException);
      expect(local.upload).not.toHaveBeenCalled();
    });

    it('rejects a MIME type that is not allowed, before storing anything', async () => {
      await expect(
        build('local').upload(file({ mimetype: 'application/x-sh' }), 'user-1'),
      ).rejects.toThrow('Invalid file type');
      expect(local.upload).not.toHaveBeenCalled();
      expect(prisma.uploads.create).not.toHaveBeenCalled();
    });

    it('accepts any MIME type when the allow list is empty', async () => {
      s3Config.allowedMimeTypes = [];

      await build('local').upload(
        file({ mimetype: 'application/zip' }),
        'user-1',
      );

      expect(local.upload).toHaveBeenCalled();
    });

    it('records the file, the storage key, and the uploader', async () => {
      const result = await build('local').upload(file(), 'user-1');

      expect(prisma.uploads.create).toHaveBeenCalledWith({
        data: {
          original_name: 'photo.png',
          mime_type: 'image/png',
          size: 1024,
          s3_key: 'local/photo.png',
          bucket: 'bucket-1',
          uploaded_by_id: 'user-1',
        },
      });
      expect(result).toEqual({
        id: 'up-1',
        original_name: 'photo.png',
        mime_type: 'image/png',
        size: 1024,
        s3_key: 'local/photo.png',
        url: 'https://local/photo.png',
      });
    });
  });

  describe('findById', () => {
    it('throws NotFoundException for an unknown upload', async () => {
      await expect(build('local').findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateSignedUrl', () => {
    it('asks the driver for the URL of the stored key', async () => {
      prisma.uploads.findUnique.mockResolvedValue(uploadRow());

      const result = await build('local').generateSignedUrl('up-1');

      expect(local.getUrl).toHaveBeenCalledWith('uploads/photo.png');
      expect(result).toEqual({ url: 'https://local/signed' });
    });

    it('does not ask the driver about an unknown upload', async () => {
      await expect(build('local').generateSignedUrl('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(local.getUrl).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('removes the stored file and then the row', async () => {
      prisma.uploads.findUnique.mockResolvedValue(uploadRow());

      await build('local').delete('up-1');

      expect(local.delete).toHaveBeenCalledWith('uploads/photo.png');
      expect(prisma.uploads.delete).toHaveBeenCalledWith({
        where: { id: 'up-1' },
      });
    });

    it('keeps the row when the stored file cannot be removed', async () => {
      prisma.uploads.findUnique.mockResolvedValue(uploadRow());
      local.delete.mockRejectedValue(new Error('storage down'));

      await expect(build('local').delete('up-1')).rejects.toThrow(
        'storage down',
      );
      expect(prisma.uploads.delete).not.toHaveBeenCalled();
    });

    it('deletes nothing for an unknown upload', async () => {
      await expect(build('local').delete('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(local.delete).not.toHaveBeenCalled();
      expect(prisma.uploads.delete).not.toHaveBeenCalled();
    });
  });
});
