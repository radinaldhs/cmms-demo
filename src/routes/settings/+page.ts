import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	// Fetch all settings data via API
	const [companyRes, policiesRes, sapRes, usersRes, rolesRes, permissionsRes] = await Promise.all([
		fetch('/api/settings/company'),
		fetch('/api/settings/policies'),
		fetch('/api/settings/sap'),
		fetch('/api/settings/users'),
		fetch('/api/settings/roles'),
		fetch('/api/settings/roles?type=permissions')
	]);

	const [company, policies, sapSettings, users, roles, permissions] = await Promise.all([
		companyRes.json(),
		policiesRes.json(),
		sapRes.json(),
		usersRes.json(),
		rolesRes.json(),
		permissionsRes.json()
	]);

	return {
		company,
		policies,
		sapSettings,
		users,
		roles,
		permissions
	};
};
