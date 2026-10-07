import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

const USER_A = 'user-a';
const USER_B = 'user-b';

const notificationRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'notif-1',
  user_id: USER_A,
  title: 'Welcome',
  is_read: false,
  ...overrides,
});

/**
 * Notifications belong to one user: every query is scoped by `user_id`.
 */
describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notifications: Record<
      'findMany' | 'findUnique' | 'count' | 'update' | 'updateMany',
      jest.Mock
    >;
  };

  beforeEach(() => {
    prisma = {
      notifications: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    service = new NotificationsService(prisma as any);
  });

  describe('findAll', () => {
    it('filters the list and the count by user_id', async () => {
      await service.findAll(USER_A, {});

      const where = { user_id: USER_A };
      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where }),
      );
      expect(prisma.notifications.count).toHaveBeenCalledWith({ where });
    });

    it('adds is_read: false when only unread ones are requested', async () => {
      await service.findAll(USER_A, { unread: true });

      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: USER_A, is_read: false },
        }),
      );
    });

    it('pages with skip and take', async () => {
      await service.findAll(USER_A, { page: 3, limit: 5 });

      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });

    it('returns the unread count of this user in meta', async () => {
      prisma.notifications.findMany.mockResolvedValue([notificationRow()]);
      prisma.notifications.count
        .mockResolvedValueOnce(12)
        .mockResolvedValueOnce(4);

      const result = await service.findAll(USER_A, {});

      expect(prisma.notifications.count).toHaveBeenLastCalledWith({
        where: { user_id: USER_A, is_read: false },
      });
      expect(result.meta).toEqual({
        total: 12,
        page: 1,
        limit: 10,
        totalPages: 2,
        unreadCount: 4,
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for an unknown notification', async () => {
      await expect(service.findOne('missing', USER_A)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException for a notification of another user', async () => {
      prisma.notifications.findUnique.mockResolvedValue(notificationRow());

      await expect(service.findOne('notif-1', USER_B)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns the owner’s notification', async () => {
      prisma.notifications.findUnique.mockResolvedValue(notificationRow());

      await expect(service.findOne('notif-1', USER_A)).resolves.toEqual(
        notificationRow(),
      );
    });
  });

  describe('markAsRead', () => {
    it('does not mark a notification of another user', async () => {
      prisma.notifications.findUnique.mockResolvedValue(notificationRow());

      await expect(service.markAsRead('notif-1', USER_B)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.notifications.update).not.toHaveBeenCalled();
    });

    it('sets is_read on the owner’s notification', async () => {
      prisma.notifications.findUnique.mockResolvedValue(notificationRow());

      await service.markAsRead('notif-1', USER_A);

      expect(prisma.notifications.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: expect.objectContaining({ is_read: true }),
      });
    });
  });

  describe('markAllAsRead', () => {
    it('updates only this user’s unread notifications', async () => {
      prisma.notifications.updateMany.mockResolvedValue({ count: 7 });

      const result = await service.markAllAsRead(USER_A);

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: { user_id: USER_A, is_read: false },
        data: expect.objectContaining({ is_read: true }),
      });
      expect(result).toEqual({ updated: 7 });
    });
  });
});
