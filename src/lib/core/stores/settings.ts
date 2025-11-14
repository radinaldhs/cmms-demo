import { writable } from 'svelte/store';
import type { CompanyProfile, MaintenancePolicy } from '$types';

// Initial company profile
const initialCompany: CompanyProfile = {
	name: 'Demo Company Ltd.',
	address: '123 Industrial Park Road',
	city: 'Jakarta',
	country: 'Indonesia',
	phone: '+62 21 1234 5678',
	email: 'info@democompany.com',
	website: 'https://www.democompany.com',
	taxId: 'TAX-123456789',
	industry: 'Manufacturing'
};

// Initial maintenance policies
const initialPolicies: MaintenancePolicy[] = [
	{
		id: 'POL001',
		name: 'Standard Preventive Maintenance',
		description:
			'Default policy for preventive maintenance scheduling. Applies to all assets unless specific policy is assigned.',
		defaultIntervalDays: 90,
		requireApproval: false,
		notifyBeforeDays: 7,
		escalateOverdueDays: 3,
		isActive: true
	},
	{
		id: 'POL002',
		name: 'Critical Equipment Policy',
		description:
			'Policy for critical equipment requiring more frequent maintenance and immediate escalation.',
		defaultIntervalDays: 30,
		requireApproval: true,
		notifyBeforeDays: 14,
		escalateOverdueDays: 1,
		isActive: true
	},
	{
		id: 'POL003',
		name: 'Fleet Vehicle Maintenance',
		description: 'Maintenance policy specific to fleet vehicles based on both time and mileage.',
		defaultIntervalDays: 180,
		requireApproval: false,
		notifyBeforeDays: 10,
		escalateOverdueDays: 7,
		isActive: true
	}
];

// Create writable stores
const companyStore = writable<CompanyProfile>(initialCompany);
const policiesStore = writable<MaintenancePolicy[]>(initialPolicies);

// Helper functions for company profile
export const companyProfile = {
	subscribe: companyStore.subscribe,

	get: (): CompanyProfile => {
		let profile: CompanyProfile = initialCompany;
		companyStore.subscribe((value) => (profile = value))();
		return profile;
	},

	update: (updates: Partial<CompanyProfile>): CompanyProfile => {
		let updatedProfile: CompanyProfile = initialCompany;

		companyStore.update((current) => {
			updatedProfile = { ...current, ...updates };
			return updatedProfile;
		});

		return updatedProfile;
	}
};

// Helper functions for maintenance policies
export const maintenancePolicies = {
	subscribe: policiesStore.subscribe,

	getAll: (): MaintenancePolicy[] => {
		let policies: MaintenancePolicy[] = [];
		policiesStore.subscribe((value) => (policies = value))();
		return policies;
	},

	getById: (id: string): MaintenancePolicy | undefined => {
		let policies: MaintenancePolicy[] = [];
		policiesStore.subscribe((value) => (policies = value))();
		return policies.find((p) => p.id === id);
	},

	getActive: (): MaintenancePolicy[] => {
		const policies = maintenancePolicies.getAll();
		return policies.filter((p) => p.isActive);
	},

	create: (policy: Omit<MaintenancePolicy, 'id'>): MaintenancePolicy => {
		const newPolicy: MaintenancePolicy = {
			...policy,
			id: `POL${String(Date.now()).slice(-6)}`
		};

		policiesStore.update((policies) => [...policies, newPolicy]);
		return newPolicy;
	},

	update: (id: string, updates: Partial<MaintenancePolicy>): MaintenancePolicy | undefined => {
		let updatedPolicy: MaintenancePolicy | undefined;

		policiesStore.update((policies) => {
			const index = policies.findIndex((p) => p.id === id);
			if (index !== -1) {
				updatedPolicy = {
					...policies[index],
					...updates
				};
				policies[index] = updatedPolicy;
			}
			return policies;
		});

		return updatedPolicy;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		policiesStore.update((policies) => {
			const initialLength = policies.length;
			const filtered = policies.filter((p) => p.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	}
};
