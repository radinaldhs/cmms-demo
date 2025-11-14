import { writable } from 'svelte/store';
import type { LicenseInfo, SupportTicket } from '$types';

// Initial license information
const initialLicense: LicenseInfo = {
	licenseKey: 'CMMS-POC-2024-UNLIMITED-1234567890',
	companyName: 'Demo Company Ltd.',
	expiryDate: '2025-12-31',
	maxUsers: null, // unlimited
	supportEmail: 'support@cmms-poc.com',
	supportPhone: '+1-800-CMMS-SUPPORT',
	slaResponseTime: '24 hours',
	supportChannel: 'Email, Phone, Support Portal',
	isActive: true,
	activatedAt: '2024-01-01T00:00:00Z'
};

// Initial support tickets
const initialTickets: SupportTicket[] = [
	{
		id: 'TKT001',
		ticketNumber: 'SUPP-2024-001',
		subject: 'How to configure SAP Business One integration',
		description:
			'We need assistance setting up the SAP Business One integration. What are the required API credentials and endpoints?',
		status: 'Resolved',
		priority: 'Medium',
		category: 'Integration',
		submittedBy: 'Admin User',
		assignedTo: 'Support Team',
		createdAt: '2024-01-15T09:00:00Z',
		updatedAt: '2024-01-16T14:30:00Z',
		resolvedAt: '2024-01-16T14:30:00Z',
		comments: [
			{
				id: 'CMT001',
				ticketId: 'TKT001',
				author: 'Admin User',
				content:
					'We need assistance setting up the SAP Business One integration. What are the required API credentials and endpoints?',
				isInternal: false,
				createdAt: '2024-01-15T09:00:00Z'
			},
			{
				id: 'CMT002',
				ticketId: 'TKT001',
				author: 'Support Team',
				content:
					'Thank you for contacting us. Please refer to the SAP Integration Guide in the documentation. You will need your SAP B1 Service Layer URL and API token.',
				isInternal: false,
				createdAt: '2024-01-15T14:00:00Z'
			},
			{
				id: 'CMT003',
				ticketId: 'TKT001',
				author: 'Admin User',
				content: 'Thank you! That was very helpful.',
				isInternal: false,
				createdAt: '2024-01-16T10:00:00Z'
			}
		]
	},
	{
		id: 'TKT002',
		ticketNumber: 'SUPP-2024-002',
		subject: 'Unable to export reports to CSV',
		description:
			'When I try to export the maintenance report to CSV, nothing happens. Browser console shows no errors.',
		status: 'In Progress',
		priority: 'High',
		category: 'Technical Issue',
		submittedBy: 'Admin User',
		assignedTo: 'Technical Team',
		createdAt: '2024-02-10T11:30:00Z',
		updatedAt: '2024-02-12T09:00:00Z',
		comments: [
			{
				id: 'CMT004',
				ticketId: 'TKT002',
				author: 'Admin User',
				content:
					'When I try to export the maintenance report to CSV, nothing happens. Browser console shows no errors.',
				isInternal: false,
				createdAt: '2024-02-10T11:30:00Z'
			},
			{
				id: 'CMT005',
				ticketId: 'TKT002',
				author: 'Technical Team',
				content:
					'We are investigating this issue. Can you please provide the browser version you are using?',
				isInternal: false,
				createdAt: '2024-02-11T10:00:00Z'
			},
			{
				id: 'CMT006',
				ticketId: 'TKT002',
				author: 'Admin User',
				content: 'I am using Chrome version 121.0.6167.160',
				isInternal: false,
				createdAt: '2024-02-11T14:00:00Z'
			},
			{
				id: 'CMT007',
				ticketId: 'TKT002',
				author: 'Technical Team',
				content:
					'Internal note: Issue reproduced. Appears to be related to download permissions. Testing fix.',
				isInternal: true,
				createdAt: '2024-02-12T09:00:00Z'
			}
		]
	},
	{
		id: 'TKT003',
		ticketNumber: 'SUPP-2024-003',
		subject: 'Feature request: Bulk work order creation',
		description:
			'It would be great to have a feature to create multiple work orders at once from a CSV template.',
		status: 'Open',
		priority: 'Low',
		category: 'Feature Request',
		submittedBy: 'Admin User',
		createdAt: '2024-02-13T15:00:00Z',
		updatedAt: '2024-02-13T15:00:00Z',
		comments: [
			{
				id: 'CMT008',
				ticketId: 'TKT003',
				author: 'Admin User',
				content:
					'It would be great to have a feature to create multiple work orders at once from a CSV template.',
				isInternal: false,
				createdAt: '2024-02-13T15:00:00Z'
			}
		]
	}
];

// Create writable stores
const licenseStore = writable<LicenseInfo>(initialLicense);
const ticketsStore = writable<SupportTicket[]>(initialTickets);

// Helper functions for license
export const license = {
	subscribe: licenseStore.subscribe,

	get: (): LicenseInfo => {
		let info: LicenseInfo = initialLicense;
		licenseStore.subscribe((value) => (info = value))();
		return info;
	},

	update: (updates: Partial<LicenseInfo>): LicenseInfo => {
		let updatedLicense: LicenseInfo = initialLicense;

		licenseStore.update((current) => {
			updatedLicense = { ...current, ...updates };
			return updatedLicense;
		});

		return updatedLicense;
	},

	isExpired: (): boolean => {
		const info = license.get();
		return new Date(info.expiryDate) < new Date();
	},

	daysUntilExpiry: (): number => {
		const info = license.get();
		const expiry = new Date(info.expiryDate);
		const now = new Date();
		const diff = expiry.getTime() - now.getTime();
		return Math.ceil(diff / (1000 * 60 * 60 * 24));
	}
};

// Helper functions for support tickets
export const supportTickets = {
	subscribe: ticketsStore.subscribe,

	getAll: (): SupportTicket[] => {
		let tickets: SupportTicket[] = [];
		ticketsStore.subscribe((value) => (tickets = value))();
		return tickets;
	},

	getById: (id: string): SupportTicket | undefined => {
		let tickets: SupportTicket[] = [];
		ticketsStore.subscribe((value) => (tickets = value))();
		return tickets.find((t) => t.id === id);
	},

	create: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): SupportTicket => {
		const ticketCount = supportTickets.getAll().length + 1;
		const newTicket: SupportTicket = {
			...ticket,
			id: `TKT${String(ticketCount).padStart(3, '0')}`,
			ticketNumber: `SUPP-2024-${String(ticketCount).padStart(3, '0')}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			comments: ticket.comments || []
		};

		// Add initial comment
		if (ticket.description) {
			newTicket.comments.push({
				id: `CMT${String(Date.now()).slice(-6)}`,
				ticketId: newTicket.id,
				author: ticket.submittedBy,
				content: ticket.description,
				isInternal: false,
				createdAt: newTicket.createdAt
			});
		}

		ticketsStore.update((tickets) => [...tickets, newTicket]);
		return newTicket;
	},

	update: (id: string, updates: Partial<SupportTicket>): SupportTicket | undefined => {
		let updatedTicket: SupportTicket | undefined;

		ticketsStore.update((tickets) => {
			const index = tickets.findIndex((t) => t.id === id);
			if (index !== -1) {
				updatedTicket = {
					...tickets[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				tickets[index] = updatedTicket;
			}
			return tickets;
		});

		return updatedTicket;
	},

	addComment: (ticketId: string, comment: Omit<SupportTicket['comments'][0], 'id' | 'ticketId' | 'createdAt'>): boolean => {
		let success = false;

		ticketsStore.update((tickets) => {
			const index = tickets.findIndex((t) => t.id === ticketId);
			if (index !== -1) {
				const newComment = {
					id: `CMT${String(Date.now()).slice(-6)}`,
					ticketId,
					...comment,
					createdAt: new Date().toISOString()
				};

				tickets[index].comments.push(newComment);
				tickets[index].updatedAt = new Date().toISOString();
				success = true;
			}
			return tickets;
		});

		return success;
	},

	filterByStatus: (status: string): SupportTicket[] => {
		const tickets = supportTickets.getAll();
		return tickets.filter((t) => t.status === status);
	}
};
