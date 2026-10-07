import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SettingsService } from './settings.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const compare = bcrypt.compare as unknown as jest.Mock;
const hash = bcrypt.hash as unknown as jest.Mock;

const USER = 'user-1';
const MERCHANT_A = 'merchant-a';

const userRow = (overrides: Record<string, unknown> = {}) => ({
  id: USER,
  name: 'User One',
  email: 'one@example.com',
  password_hash: 'hashed',
  merchant_id: MERCHANT_A,
  avatar: null,
  avatar_upload_id: null,
  is_active: true,
  ...overrides,
});

/**
 * Settings act on the caller's own account: every write targets `where: { id: userId }`.
 */
describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: {
    users: Record<'findUnique' | 'findFirst' | 'update', jest.Mock>;
  };
  let uploads: { generateSignedUrl: jest.Mock };

  beforeEach(() => {
    prisma = {
      users: {
        findUnique: jest.fn().mockResolvedValue(userRow()),
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn(({ data }) => Promise.resolve({ id: USER, ...data })),
      },
    };
    uploads = {
      generateSignedUrl: jest.fn().mockResolvedValue({ url: 'signed-url' }),
    };
    compare.mockReset().mockResolvedValue(true);
    hash.mockReset().mockResolvedValue('new-hash');
    // requestEmailVerification logs the code; keep the test output clean.
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    service = new SettingsService(prisma as any, uploads as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('profile', () => {
    it('throws NotFoundException for a user that no longer exists', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(USER)).rejects.toThrow(NotFoundException);
    });

    it('never selects password_hash', async () => {
      await service.getProfile(USER);

      const { select } = prisma.users.findUnique.mock.calls[0][0];
      expect(select).not.toHaveProperty('password_hash');
    });

    it('replaces the avatar with a signed URL when there is an upload', async () => {
      prisma.users.findUnique.mockResolvedValue(
        userRow({ avatar_upload_id: 'up-1' }),
      );

      const profile = await service.getProfile(USER);

      expect(profile.avatar).toBe('signed-url');
    });

    it('updates only the caller’s own row', async () => {
      await service.updateProfile(USER, { name: 'Renamed' });

      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: USER },
          data: expect.objectContaining({ name: 'Renamed' }),
        }),
      );
    });

    it('does not update a user that no longer exists', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile(USER, { name: 'Renamed' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.users.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const dto = (overrides: Record<string, string> = {}) => ({
      currentPassword: 'old-secret',
      newPassword: 'new-secret',
      confirmPassword: 'new-secret',
      ...overrides,
    });

    it('rejects a confirmation that does not match', async () => {
      await expect(
        service.changePassword(USER, dto({ confirmPassword: 'other' })),
      ).rejects.toThrow('Passwords do not match');
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('rejects a new password equal to the current one', async () => {
      await expect(
        service.changePassword(
          USER,
          dto({ newPassword: 'old-secret', confirmPassword: 'old-secret' }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('rejects a wrong current password', async () => {
      compare.mockResolvedValue(false);

      await expect(service.changePassword(USER, dto())).rejects.toThrow(
        'Current password is incorrect',
      );
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('stores the hash, never the plain password', async () => {
      await service.changePassword(USER, dto());

      expect(compare).toHaveBeenCalledWith('old-secret', 'hashed');
      expect(hash).toHaveBeenCalledWith('new-secret', 10);
      const { where, data, select } = prisma.users.update.mock.calls[0][0];
      expect(where).toEqual({ id: USER });
      expect(data.password_hash).toBe('new-hash');
      expect(JSON.stringify(data)).not.toContain('new-secret');
      expect(select).not.toHaveProperty('password_hash');
    });
  });

  describe('email change', () => {
    // Math.random() = 0 makes the six-digit code 100000.
    const CODE = '100000';

    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
    });

    it('looks for the new email inside the caller’s merchant only', async () => {
      await service.requestEmailVerification(USER, {
        email: 'new@example.com',
      });

      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { email: 'new@example.com', merchant_id: MERCHANT_A },
      });
    });

    it('rejects an email another user of the merchant holds', async () => {
      prisma.users.findFirst.mockResolvedValue(userRow({ id: 'user-2' }));

      await expect(
        service.requestEmailVerification(USER, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects a change that was never requested', async () => {
      await expect(
        service.updateEmail(USER, {
          newEmail: 'new@example.com',
          verificationCode: CODE,
        }),
      ).rejects.toThrow('Verification code not found or expired');
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('rejects a wrong verification code', async () => {
      await service.requestEmailVerification(USER, {
        email: 'new@example.com',
      });

      await expect(
        service.updateEmail(USER, {
          newEmail: 'new@example.com',
          verificationCode: '999999',
        }),
      ).rejects.toThrow('Invalid verification code');
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('rejects a code after ten minutes', async () => {
      jest.useFakeTimers();
      await service.requestEmailVerification(USER, {
        email: 'new@example.com',
      });
      jest.advanceTimersByTime(10 * 60 * 1000 + 1);

      await expect(
        service.updateEmail(USER, {
          newEmail: 'new@example.com',
          verificationCode: CODE,
        }),
      ).rejects.toThrow('Verification code expired');
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('changes the email with the right code, and the code works once', async () => {
      await service.requestEmailVerification(USER, {
        email: 'new@example.com',
      });
      const change = { newEmail: 'new@example.com', verificationCode: CODE };

      await service.updateEmail(USER, change);

      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: USER },
          data: expect.objectContaining({ email: 'new@example.com' }),
        }),
      );
      await expect(service.updateEmail(USER, change)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deactivateAccount', () => {
    it('rejects a wrong password', async () => {
      compare.mockResolvedValue(false);

      await expect(
        service.deactivateAccount(USER, { password: 'wrong' }),
      ).rejects.toThrow('Password is incorrect');
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('soft-deletes the caller’s own account', async () => {
      await service.deactivateAccount(USER, { password: 'old-secret' });

      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: USER },
          data: expect.objectContaining({ is_active: false }),
        }),
      );
    });
  });
});
