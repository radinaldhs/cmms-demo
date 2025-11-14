import { writable } from 'svelte/store';
import type { User, Role, Permission } from '$types';

// Mock permissions data
const mockPermissions: Permission[] = [
	// Assets module
	{ id: 'P001', name: 'View Assets', description: 'View asset information', module: 'assets' },
	{ id: 'P002', name: 'Create Assets', description: 'Create new assets', module: 'assets' },
	{ id: 'P003', name: 'Edit Assets', description: 'Edit asset information', module: 'assets' },
	{ id: 'P004', name: 'Delete Assets', description: 'Delete assets', module: 'assets' },

	// Fleet module
	{ id: 'P005', name: 'View Fleet', description: 'View fleet vehicles', module: 'fleet' },
	{ id: 'P006', name: 'Create Fleet', description: 'Add new fleet vehicles', module: 'fleet' },
	{ id: 'P007', name: 'Edit Fleet', description: 'Edit fleet information', module: 'fleet' },
	{ id: 'P008', name: 'Delete Fleet', description: 'Remove fleet vehicles', module: 'fleet' },

	// Work Orders module
	{
		id: 'P009',
		name: 'View Work Orders',
		description: 'View work orders',
		module: 'work-orders'
	},
	{
		id: 'P010',
		name: 'Create Work Orders',
		description: 'Create new work orders',
		module: 'work-orders'
	},
	{
		id: 'P011',
		name: 'Edit Work Orders',
		description: 'Edit work orders',
		module: 'work-orders'
	},
	{
		id: 'P012',
		name: 'Delete Work Orders',
		description: 'Delete work orders',
		module: 'work-orders'
	},

	// Inventory module
	{
		id: 'P013',
		name: 'View Inventory',
		description: 'View spare parts inventory',
		module: 'inventory'
	},
	{
		id: 'P014',
		name: 'Manage Inventory',
		description: 'Add/edit inventory items',
		module: 'inventory'
	},
	{
		id: 'P015',
		name: 'Adjust Stock',
		description: 'Perform stock adjustments',
		module: 'inventory'
	},

	// Reports module
	{ id: 'P016', name: 'View Reports', description: 'View reports', module: 'reports' },
	{ id: 'P017', name: 'Export Reports', description: 'Export reports to CSV', module: 'reports' },

	// Settings module
	{ id: 'P018', name: 'View Settings', description: 'View system settings', module: 'settings' },
	{ id: 'P019', name: 'Edit Settings', description: 'Edit system settings', module: 'settings' },
	{
		id: 'P020',
		name: 'Manage Users',
		description: 'Manage users and roles',
		module: 'settings'
	}
];

// Initial roles with permissions
const initialRoles: Role[] = [
	{
		id: 'ROLE001',
		name: 'Admin',
		description: 'Full system access with all permissions',
		permissions: mockPermissions.map((p) => p.id), // All permissions
		isSystemRole: true,
		userCount: 2,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 'ROLE002',
		name: 'Manager',
		description: 'Can view and manage assets, work orders, and view reports',
		permissions: [
			'P001',
			'P002',
			'P003',
			'P005',
			'P006',
			'P007',
			'P009',
			'P010',
			'P011',
			'P013',
			'P014',
			'P016',
			'P017',
			'P018'
		],
		isSystemRole: true,
		userCount: 5,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 'ROLE003',
		name: 'Technician',
		description: 'Can view assets, execute work orders, and manage inventory',
		permissions: ['P001', 'P005', 'P009', 'P010', 'P011', 'P013', 'P014', 'P015'],
		isSystemRole: true,
		userCount: 15,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 'ROLE004',
		name: 'Viewer',
		description: 'Read-only access to most modules',
		permissions: ['P001', 'P005', 'P009', 'P013', 'P016', 'P018'],
		isSystemRole: true,
		userCount: 8,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	}
];

// Initial users data
const initialUsers: User[] = [
	{
		id: 'USER001',
		username: 'admin',
		email: 'admin@democompany.com',
		firstName: 'System',
		lastName: 'Administrator',
		roleId: 'ROLE001',
		roleName: 'Admin',
		status: 'Active',
		phone: '+62 21 1234 5601',
		department: 'IT',
		lastLoginAt: '2024-02-15T08:30:00Z',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-02-15T08:30:00Z'
	},
	{
		id: 'USER002',
		username: 'jsmith',
		email: 'john.smith@democompany.com',
		firstName: 'John',
		lastName: 'Smith',
		roleId: 'ROLE001',
		roleName: 'Admin',
		status: 'Active',
		phone: '+62 21 1234 5602',
		department: 'Operations',
		lastLoginAt: '2024-02-14T16:45:00Z',
		createdAt: '2024-01-15T00:00:00Z',
		updatedAt: '2024-02-14T16:45:00Z'
	},
	{
		id: 'USER003',
		username: 'mjohnson',
		email: 'mary.johnson@democompany.com',
		firstName: 'Mary',
		lastName: 'Johnson',
		roleId: 'ROLE002',
		roleName: 'Manager',
		status: 'Active',
		phone: '+62 21 1234 5603',
		department: 'Maintenance',
		lastLoginAt: '2024-02-15T07:20:00Z',
		createdAt: '2024-01-20T00:00:00Z',
		updatedAt: '2024-02-15T07:20:00Z'
	},
	{
		id: 'USER004',
		username: 'rwilliams',
		email: 'robert.williams@democompany.com',
		firstName: 'Robert',
		lastName: 'Williams',
		roleId: 'ROLE002',
		roleName: 'Manager',
		status: 'Active',
		phone: '+62 21 1234 5604',
		department: 'Fleet',
		lastLoginAt: '2024-02-14T14:10:00Z',
		createdAt: '2024-01-25T00:00:00Z',
		updatedAt: '2024-02-14T14:10:00Z'
	},
	{
		id: 'USER005',
		username: 'sbrown',
		email: 'susan.brown@democompany.com',
		firstName: 'Susan',
		lastName: 'Brown',
		roleId: 'ROLE003',
		roleName: 'Technician',
		status: 'Active',
		phone: '+62 21 1234 5605',
		department: 'Maintenance',
		lastLoginAt: '2024-02-15T06:00:00Z',
		createdAt: '2024-02-01T00:00:00Z',
		updatedAt: '2024-02-15T06:00:00Z'
	},
	{
		id: 'USER006',
		username: 'djones',
		email: 'david.jones@democompany.com',
		firstName: 'David',
		lastName: 'Jones',
		roleId: 'ROLE003',
		roleName: 'Technician',
		status: 'Active',
		phone: '+62 21 1234 5606',
		department: 'Maintenance',
		lastLoginAt: '2024-02-15T05:45:00Z',
		createdAt: '2024-02-01T00:00:00Z',
		updatedAt: '2024-02-15T05:45:00Z'
	},
	{
		id: 'USER007',
		username: 'lmiller',
		email: 'linda.miller@democompany.com',
		firstName: 'Linda',
		lastName: 'Miller',
		roleId: 'ROLE004',
		roleName: 'Viewer',
		status: 'Active',
		phone: '+62 21 1234 5607',
		department: 'Finance',
		lastLoginAt: '2024-02-14T13:30:00Z',
		createdAt: '2024-02-05T00:00:00Z',
		updatedAt: '2024-02-14T13:30:00Z'
	},
	{
		id: 'USER008',
		username: 'jdavis',
		email: 'james.davis@democompany.com',
		firstName: 'James',
		lastName: 'Davis',
		roleId: 'ROLE003',
		roleName: 'Technician',
		status: 'Inactive',
		phone: '+62 21 1234 5608',
		department: 'Maintenance',
		lastLoginAt: '2024-01-20T10:00:00Z',
		createdAt: '2024-01-10T00:00:00Z',
		updatedAt: '2024-02-01T00:00:00Z'
	},
	{
		id: 'USER009',
		username: 'pgarcia',
		email: 'patricia.garcia@democompany.com',
		firstName: 'Patricia',
		lastName: 'Garcia',
		roleId: 'ROLE002',
		roleName: 'Manager',
		status: 'Pending',
		phone: '+62 21 1234 5609',
		department: 'Operations',
		createdAt: '2024-02-14T00:00:00Z',
		updatedAt: '2024-02-14T00:00:00Z'
	}
];

// Create writable stores
const usersStore = writable<User[]>(initialUsers);
const rolesStore = writable<Role[]>(initialRoles);
const permissionsStore = writable<Permission[]>(mockPermissions);

// Helper functions for users
export const users = {
	subscribe: usersStore.subscribe,

	getAll: (): User[] => {
		let allUsers: User[] = [];
		usersStore.subscribe((value) => (allUsers = value))();
		return allUsers;
	},

	getById: (id: string): User | undefined => {
		const allUsers = users.getAll();
		return allUsers.find((u) => u.id === id);
	},

	filterByStatus: (status: string): User[] => {
		const allUsers = users.getAll();
		return allUsers.filter((u) => u.status === status);
	},

	filterByRole: (roleId: string): User[] => {
		const allUsers = users.getAll();
		return allUsers.filter((u) => u.roleId === roleId);
	},

	create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
		const newUser: User = {
			...userData,
			id: `USER${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		usersStore.update((allUsers) => [...allUsers, newUser]);

		// Update role user count
		roles.incrementUserCount(newUser.roleId);

		return newUser;
	},

	update: (id: string, updates: Partial<User>): User | undefined => {
		let updatedUser: User | undefined;

		usersStore.update((allUsers) => {
			const index = allUsers.findIndex((u) => u.id === id);
			if (index !== -1) {
				const oldRoleId = allUsers[index].roleId;
				updatedUser = {
					...allUsers[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				allUsers[index] = updatedUser;

				// Update role counts if role changed
				if (updates.roleId && updates.roleId !== oldRoleId) {
					roles.decrementUserCount(oldRoleId);
					roles.incrementUserCount(updates.roleId);
				}
			}
			return allUsers;
		});

		return updatedUser;
	},

	delete: (id: string): boolean => {
		let deleted = false;
		let roleId: string | undefined;

		usersStore.update((allUsers) => {
			const user = allUsers.find((u) => u.id === id);
			if (user) {
				roleId = user.roleId;
			}

			const initialLength = allUsers.length;
			const filtered = allUsers.filter((u) => u.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		// Update role user count
		if (deleted && roleId) {
			roles.decrementUserCount(roleId);
		}

		return deleted;
	}
};

// Helper functions for roles
export const roles = {
	subscribe: rolesStore.subscribe,

	getAll: (): Role[] => {
		let allRoles: Role[] = [];
		rolesStore.subscribe((value) => (allRoles = value))();
		return allRoles;
	},

	getById: (id: string): Role | undefined => {
		const allRoles = roles.getAll();
		return allRoles.find((r) => r.id === id);
	},

	create: (roleData: Omit<Role, 'id' | 'userCount' | 'createdAt' | 'updatedAt'>): Role => {
		const newRole: Role = {
			...roleData,
			id: `ROLE${String(Date.now()).slice(-6)}`,
			userCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		rolesStore.update((allRoles) => [...allRoles, newRole]);
		return newRole;
	},

	update: (id: string, updates: Partial<Role>): Role | undefined => {
		let updatedRole: Role | undefined;

		rolesStore.update((allRoles) => {
			const index = allRoles.findIndex((r) => r.id === id);
			if (index !== -1) {
				updatedRole = {
					...allRoles[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				allRoles[index] = updatedRole;
			}
			return allRoles;
		});

		return updatedRole;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		rolesStore.update((allRoles) => {
			const role = allRoles.find((r) => r.id === id);
			// Don't delete system roles or roles with users
			if (role && !role.isSystemRole && role.userCount === 0) {
				const initialLength = allRoles.length;
				const filtered = allRoles.filter((r) => r.id !== id);
				deleted = filtered.length < initialLength;
				return filtered;
			}
			return allRoles;
		});

		return deleted;
	},

	incrementUserCount: (roleId: string): void => {
		rolesStore.update((allRoles) => {
			const index = allRoles.findIndex((r) => r.id === roleId);
			if (index !== -1) {
				allRoles[index].userCount++;
			}
			return allRoles;
		});
	},

	decrementUserCount: (roleId: string): void => {
		rolesStore.update((allRoles) => {
			const index = allRoles.findIndex((r) => r.id === roleId);
			if (index !== -1 && allRoles[index].userCount > 0) {
				allRoles[index].userCount--;
			}
			return allRoles;
		});
	}
};

// Helper functions for permissions
export const permissions = {
	subscribe: permissionsStore.subscribe,

	getAll: (): Permission[] => {
		let allPermissions: Permission[] = [];
		permissionsStore.subscribe((value) => (allPermissions = value))();
		return allPermissions;
	},

	getByModule: (module: string): Permission[] => {
		const allPermissions = permissions.getAll();
		return allPermissions.filter((p) => p.module === module);
	},

	getByIds: (ids: string[]): Permission[] => {
		const allPermissions = permissions.getAll();
		return allPermissions.filter((p) => ids.includes(p.id));
	}
};
