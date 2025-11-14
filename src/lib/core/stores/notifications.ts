import { writable, derived } from 'svelte/store';
import type { Notification } from '$types';

// In-memory notifications storage
const initialNotifications: Notification[] = [
	{
		id: 'NOT001',
		type: 'OVERDUE_MAINTENANCE',
		message: 'Work Order WO004 (Belt Tension Adjustment) is overdue',
		severity: 'Error',
		relatedEntityType: 'WorkOrder',
		relatedEntityId: 'WO004',
		createdAt: '2024-02-14T08:00:00Z'
	},
	{
		id: 'NOT002',
		type: 'OVERDUE_MAINTENANCE',
		message: 'Work Order WO010 (Refrigerant Level Check) is overdue',
		severity: 'Error',
		relatedEntityType: 'WorkOrder',
		relatedEntityId: 'WO010',
		createdAt: '2024-02-14T08:00:00Z'
	},
	{
		id: 'NOT003',
		type: 'LOW_STOCK',
		message: 'Low stock alert: V-Belt A-60 below minimum (4 < 6)',
		severity: 'Warning',
		relatedEntityType: 'SparePart',
		relatedEntityId: 'SP005',
		createdAt: '2024-02-13T10:00:00Z'
	},
	{
		id: 'NOT004',
		type: 'LOW_STOCK',
		message: 'Low stock alert: Timing Belt HTD-120 below minimum (3 < 5)',
		severity: 'Warning',
		relatedEntityType: 'SparePart',
		relatedEntityId: 'SP006',
		createdAt: '2024-02-13T10:00:00Z'
	},
	{
		id: 'NOT005',
		type: 'UPCOMING_MAINTENANCE',
		message: 'Work Order WO002 (Air Filter Replacement) scheduled for tomorrow',
		severity: 'Info',
		relatedEntityType: 'WorkOrder',
		relatedEntityId: 'WO002',
		readAt: '2024-02-14T09:00:00Z',
		createdAt: '2024-02-14T07:00:00Z'
	},
	{
		id: 'NOT006',
		type: 'UPCOMING_MAINTENANCE',
		message: 'Work Order WO006 (Filter Change and Coil Cleaning) due in 6 days',
		severity: 'Info',
		relatedEntityType: 'WorkOrder',
		relatedEntityId: 'WO006',
		createdAt: '2024-02-14T07:00:00Z'
	},
	{
		id: 'NOT007',
		type: 'WORK_ORDER_COMPLETED',
		message: 'Work Order WO008 (Battery Maintenance) has been completed',
		severity: 'Success',
		relatedEntityType: 'WorkOrder',
		relatedEntityId: 'WO008',
		readAt: '2024-02-08T14:00:00Z',
		createdAt: '2024-02-08T11:30:00Z'
	},
	{
		id: 'NOT008',
		type: 'WORK_ORDER_ASSIGNED',
		message: 'New work order WO012 (Brake System Repair) assigned',
		severity: 'Info',
		relatedEntityType: 'WorkOrder',
		relatedEntityId: 'WO012',
		createdAt: '2024-02-13T16:00:00Z'
	}
];

// Create writable store
const notificationsStore = writable<Notification[]>(initialNotifications);

// Helper functions
export const notifications = {
	subscribe: notificationsStore.subscribe,

	getAll: (): Notification[] => {
		let items: Notification[] = [];
		notificationsStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): Notification | undefined => {
		let items: Notification[] = [];
		notificationsStore.subscribe((value) => (items = value))();
		return items.find((n) => n.id === id);
	},

	getUnread: (): Notification[] => {
		const items = notifications.getAll();
		return items.filter((n) => !n.readAt);
	},

	create: (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
		const newNotification: Notification = {
			...notification,
			id: `NOT${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString()
		};

		notificationsStore.update((items) => [newNotification, ...items]);
		return newNotification;
	},

	markAsRead: (id: string): Notification | undefined => {
		let updatedNotification: Notification | undefined;

		notificationsStore.update((items) => {
			const index = items.findIndex((n) => n.id === id);
			if (index !== -1 && !items[index].readAt) {
				updatedNotification = {
					...items[index],
					readAt: new Date().toISOString()
				};
				items[index] = updatedNotification;
			}
			return items;
		});

		return updatedNotification;
	},

	markAllAsRead: (): void => {
		const now = new Date().toISOString();
		notificationsStore.update((items) => {
			return items.map((item) => {
				if (!item.readAt) {
					return { ...item, readAt: now };
				}
				return item;
			});
		});
	},

	delete: (id: string): boolean => {
		let deleted = false;

		notificationsStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((n) => n.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	deleteAll: (): void => {
		notificationsStore.set([]);
	}
};

// Derived stores
export const unreadNotifications = derived(notificationsStore, ($notifications) =>
	$notifications.filter((n) => !n.readAt)
);

export const unreadCount = derived(unreadNotifications, ($unread) => $unread.length);
