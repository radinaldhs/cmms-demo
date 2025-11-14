<script lang="ts">
	import { Card, Button, Input, Label, Textarea, Badge, Dialog } from '$components/ui';
	import {
		Building,
		Upload,
		TestTube,
		Plus,
		Pencil,
		Trash2,
		Users,
		Shield,
		CheckCircle,
		XCircle,
		AlertCircle,
		Loader2
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import type {
		CompanyProfile,
		MaintenancePolicy,
		IntegrationSettings,
		User,
		Role,
		Permission,
		CSVImportResult
	} from '$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state('company');

	// Company Profile state
	let companyForm = $state<CompanyProfile>({ ...data.company });
	let isSavingCompany = $state(false);

	// Policies state
	let editingPolicy: MaintenancePolicy | null = $state(null);
	let isEditingPolicy = $state(false);
	let isDeletingPolicy = $state(false);
	let policyToDelete: MaintenancePolicy | null = $state(null);

	// SAP Configuration state
	let sapForm = $state<IntegrationSettings>({ ...data.sapSettings });
	let isSavingSAP = $state(false);
	let isTestingConnection = $state(false);

	// CSV Import state
	let csvInput = $state('');
	let isValidating = $state(false);
	let isImporting = $state(false);
	let importResult: CSVImportResult | null = $state(null);

	// User Management state
	let users = $state<User[]>([...data.users]);
	let roles = $state<Role[]>([...data.roles]);
	let permissions = $state<Permission[]>([...data.permissions]);
	let editingUser: User | null = $state(null);
	let isEditingUser = $state(false);
	let isDeletingUser = $state(false);
	let userToDelete: User | null = $state(null);
	let userManagementView = $state<'users' | 'roles'>('users');

	// Role Management state
	let editingRole: Role | null = $state(null);
	let isEditingRole = $state(false);
	let isDeletingRole = $state(false);
	let roleToDelete: Role | null = $state(null);

	// Company Profile functions
	async function saveCompanyProfile() {
		isSavingCompany = true;
		try {
			const response = await fetch('/api/settings/company', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(companyForm)
			});

			if (response.ok) {
				const updated = await response.json();
				companyForm = updated;
				toast.success('Company profile updated successfully');
			} else {
				toast.error('Failed to update company profile');
			}
		} catch (error) {
			toast.error('Error updating company profile');
		} finally {
			isSavingCompany = false;
		}
	}

	function cancelCompanyEdit() {
		companyForm = { ...data.company };
	}

	// Policies functions
	function openEditPolicy(policy: MaintenancePolicy) {
		editingPolicy = { ...policy };
		isEditingPolicy = true;
	}

	function openNewPolicy() {
		editingPolicy = {
			id: '',
			name: '',
			description: '',
			defaultIntervalDays: 90,
			requireApproval: false,
			notifyBeforeDays: 7,
			escalateOverdueDays: 3,
			isActive: true
		};
		isEditingPolicy = true;
	}

	async function savePolicy() {
		if (!editingPolicy) return;

		try {
			const isNew = !editingPolicy.id;
			const response = await fetch('/api/settings/policies', {
				method: isNew ? 'POST' : 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingPolicy)
			});

			if (response.ok) {
				const saved = await response.json();
				if (isNew) {
					data.policies = [...data.policies, saved];
				} else {
					data.policies = data.policies.map((p: MaintenancePolicy) => (p.id === saved.id ? saved : p));
				}
				toast.success(`Policy ${isNew ? 'created' : 'updated'} successfully`);
				isEditingPolicy = false;
				editingPolicy = null;
			} else {
				toast.error(`Failed to ${isNew ? 'create' : 'update'} policy`);
			}
		} catch (error) {
			toast.error('Error saving policy');
		}
	}

	function confirmDeletePolicy(policy: MaintenancePolicy) {
		policyToDelete = policy;
		isDeletingPolicy = true;
	}

	async function deletePolicy() {
		if (!policyToDelete) return;

		try {
			const response = await fetch(`/api/settings/policies?id=${policyToDelete.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				data.policies = data.policies.filter((p: MaintenancePolicy) => p.id !== policyToDelete?.id);
				toast.success('Policy deleted successfully');
				isDeletingPolicy = false;
				policyToDelete = null;
			} else {
				toast.error('Failed to delete policy');
			}
		} catch (error) {
			toast.error('Error deleting policy');
		}
	}

	// SAP Configuration functions
	async function saveSAPConfiguration() {
		isSavingSAP = true;
		try {
			const response = await fetch('/api/settings/sap', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(sapForm)
			});

			if (response.ok) {
				const updated = await response.json();
				sapForm = updated;
				toast.success('SAP configuration saved successfully');
			} else {
				toast.error('Failed to save SAP configuration');
			}
		} catch (error) {
			toast.error('Error saving SAP configuration');
		} finally {
			isSavingSAP = false;
		}
	}

	async function testSAPConnection() {
		isTestingConnection = true;
		try {
			const response = await fetch('/api/settings/sap', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'test' })
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.message || 'Connection test failed');
			}
		} catch (error) {
			toast.error('Error testing connection');
		} finally {
			isTestingConnection = false;
		}
	}

	// CSV Import functions
	async function validateCSV() {
		if (!csvInput.trim()) {
			toast.error('Please paste CSV data first');
			return;
		}

		isValidating = true;
		importResult = null;

		try {
			const response = await fetch('/api/settings/import', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ csvData: csvInput, action: 'validate' })
			});

			if (response.ok) {
				const result: CSVImportResult = await response.json();
				importResult = result;

				if (result.success) {
					toast.success(`Validation passed! ${result.imported} rows ready to import`);
				} else {
					toast.warning(
						`Validation completed with ${result.failed} errors. Check details below.`
					);
				}
			} else {
				const error = await response.json();
				toast.error(error.error || 'Validation failed');
			}
		} catch (error) {
			toast.error('Error validating CSV');
		} finally {
			isValidating = false;
		}
	}

	async function importCSV() {
		if (!csvInput.trim()) {
			toast.error('Please paste CSV data first');
			return;
		}

		isImporting = true;

		try {
			const response = await fetch('/api/settings/import', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ csvData: csvInput, action: 'import' })
			});

			if (response.ok) {
				const result: CSVImportResult = await response.json();
				importResult = result;

				if (result.success && result.imported > 0) {
					toast.success(`Successfully imported ${result.imported} assets!`);
					csvInput = '';
					importResult = null;
				} else if (result.failed > 0) {
					toast.error(`Import completed with ${result.failed} errors`);
				}
			} else {
				const error = await response.json();
				toast.error(error.error || 'Import failed');
			}
		} catch (error) {
			toast.error('Error importing CSV');
		} finally {
			isImporting = false;
		}
	}

	// User Management functions
	function openEditUser(user: User) {
		editingUser = { ...user };
		isEditingUser = true;
	}

	function openNewUser() {
		editingUser = {
			id: '',
			username: '',
			email: '',
			firstName: '',
			lastName: '',
			roleId: roles[0]?.id || '',
			status: 'Active',
			phone: '',
			department: '',
			createdAt: '',
			updatedAt: ''
		};
		isEditingUser = true;
	}

	async function saveUser() {
		if (!editingUser) return;

		// Validation
		if (
			!editingUser.username ||
			!editingUser.email ||
			!editingUser.firstName ||
			!editingUser.lastName ||
			!editingUser.roleId
		) {
			toast.error('Please fill in all required fields');
			return;
		}

		try {
			const isNew = !editingUser.id;

			// Add role name for display
			const role = roles.find((r) => r.id === editingUser?.roleId);
			if (role) {
				editingUser.roleName = role.name;
			}

			const response = await fetch('/api/settings/users', {
				method: isNew ? 'POST' : 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingUser)
			});

			if (response.ok) {
				const saved = await response.json();
				if (isNew) {
					users = [...users, saved];
				} else {
					users = users.map((u) => (u.id === saved.id ? saved : u));
				}
				toast.success(`User ${isNew ? 'created' : 'updated'} successfully`);
				isEditingUser = false;
				editingUser = null;
			} else {
				const error = await response.json();
				toast.error(error.error || `Failed to ${isNew ? 'create' : 'update'} user`);
			}
		} catch (error) {
			toast.error('Error saving user');
		}
	}

	function confirmDeleteUser(user: User) {
		userToDelete = user;
		isDeletingUser = true;
	}

	async function deleteUser() {
		if (!userToDelete) return;

		try {
			const response = await fetch(`/api/settings/users?id=${userToDelete.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				users = users.filter((u) => u.id !== userToDelete?.id);
				toast.success('User deleted successfully');
				isDeletingUser = false;
				userToDelete = null;
			} else {
				toast.error('Failed to delete user');
			}
		} catch (error) {
			toast.error('Error deleting user');
		}
	}

	// Role Management functions
	function openEditRole(role: Role) {
		editingRole = { ...role };
		isEditingRole = true;
	}

	function openNewRole() {
		editingRole = {
			id: '',
			name: '',
			description: '',
			permissions: [],
			isSystemRole: false,
			userCount: 0,
			createdAt: '',
			updatedAt: ''
		};
		isEditingRole = true;
	}

	async function saveRole() {
		if (!editingRole) return;

		// Validation
		if (!editingRole.name || !editingRole.description) {
			toast.error('Please fill in all required fields');
			return;
		}

		try {
			const isNew = !editingRole.id;
			const response = await fetch('/api/settings/roles', {
				method: isNew ? 'POST' : 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingRole)
			});

			if (response.ok) {
				const saved = await response.json();
				if (isNew) {
					roles = [...roles, saved];
				} else {
					roles = roles.map((r) => (r.id === saved.id ? saved : r));
				}
				toast.success(`Role ${isNew ? 'created' : 'updated'} successfully`);
				isEditingRole = false;
				editingRole = null;
			} else {
				const error = await response.json();
				toast.error(error.error || `Failed to ${isNew ? 'create' : 'update'} role`);
			}
		} catch (error) {
			toast.error('Error saving role');
		}
	}

	function confirmDeleteRole(role: Role) {
		roleToDelete = role;
		isDeletingRole = true;
	}

	async function deleteRole() {
		if (!roleToDelete) return;

		try {
			const response = await fetch(`/api/settings/roles?id=${roleToDelete.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				roles = roles.filter((r) => r.id !== roleToDelete?.id);
				toast.success('Role deleted successfully');
				isDeletingRole = false;
				roleToDelete = null;
			} else {
				const error = await response.json();
				toast.error(error.error || 'Failed to delete role');
			}
		} catch (error) {
			toast.error('Error deleting role');
		}
	}

	function togglePermission(permissionId: string) {
		if (!editingRole) return;

		if (editingRole.permissions.includes(permissionId)) {
			editingRole.permissions = editingRole.permissions.filter((p) => p !== permissionId);
		} else {
			editingRole.permissions = [...editingRole.permissions, permissionId];
		}
	}

	// Group permissions by module
	const permissionsByModule = $derived(() => {
		const grouped: Record<string, Permission[]> = {};
		permissions.forEach((p) => {
			if (!grouped[p.module]) {
				grouped[p.module] = [];
			}
			grouped[p.module].push(p);
		});
		return grouped;
	});

	function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' {
		switch (status) {
			case 'Active':
				return 'success';
			case 'Inactive':
				return 'destructive';
			case 'Pending':
				return 'warning';
			default:
				return 'default';
		}
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Settings</h1>
		<p class="text-sm text-slate-600 sm:text-base">Manage system configuration and preferences</p>
	</div>

	<div class="border-b border-slate-200">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => (activeTab = 'company')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'company'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Company Profile
			</button>
			<button
				onclick={() => (activeTab = 'policies')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'policies'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Maintenance Policies
			</button>
			<button
				onclick={() => (activeTab = 'sap')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'sap'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				SAP Configuration
			</button>
			<button
				onclick={() => (activeTab = 'import')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'import'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				CSV Import
			</button>
			<button
				onclick={() => (activeTab = 'users')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'users'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Role & User Management
			</button>
		</nav>
	</div>

	<!-- Company Profile Tab -->
	{#if activeTab === 'company'}
		<Card class="p-6">
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-full bg-blue-100 p-3">
					<Building class="h-6 w-6 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold text-slate-900">Company Information</h3>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); saveCompanyProfile(); }}>
				<div class="grid gap-6 md:grid-cols-2">
					<div>
						<Label>Company Name *</Label>
						<Input bind:value={companyForm.name} required class="mt-2" />
					</div>
					<div>
						<Label>Industry *</Label>
						<Input bind:value={companyForm.industry} required class="mt-2" />
					</div>
					<div>
						<Label>Email *</Label>
						<Input type="email" bind:value={companyForm.email} required class="mt-2" />
					</div>
					<div>
						<Label>Phone *</Label>
						<Input bind:value={companyForm.phone} required class="mt-2" />
					</div>
					<div class="md:col-span-2">
						<Label>Address *</Label>
						<Input bind:value={companyForm.address} required class="mt-2" />
					</div>
					<div>
						<Label>City *</Label>
						<Input bind:value={companyForm.city} required class="mt-2" />
					</div>
					<div>
						<Label>Country *</Label>
						<Input bind:value={companyForm.country} required class="mt-2" />
					</div>
					<div>
						<Label>Website</Label>
						<Input bind:value={companyForm.website} type="url" class="mt-2" />
					</div>
					<div>
						<Label>Tax ID</Label>
						<Input bind:value={companyForm.taxId} class="mt-2" />
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
					<Button type="button" variant="outline" onclick={cancelCompanyEdit}>Cancel</Button>
					<Button type="submit" disabled={isSavingCompany}>
						{#if isSavingCompany}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Save Changes
					</Button>
				</div>
			</form>
		</Card>
	{/if}

	<!-- Maintenance Policies Tab -->
	{#if activeTab === 'policies'}
		<div class="space-y-4">
			<div class="flex justify-end">
				<Button onclick={openNewPolicy}>
					<Plus class="mr-2 h-4 w-4" />
					Add Policy
				</Button>
			</div>

			{#each data.policies as policy}
				<Card class="p-6">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h4 class="font-semibold text-slate-900">{policy.name}</h4>
								{#if policy.isActive}
									<Badge variant="success">Active</Badge>
								{:else}
									<Badge variant="destructive">Inactive</Badge>
								{/if}
							</div>
							<p class="mb-4 text-sm text-slate-600">{policy.description}</p>
							<div class="grid gap-4 md:grid-cols-4">
								<div>
									<span class="text-xs text-slate-500">Default Interval</span>
									<p class="text-sm font-medium">{policy.defaultIntervalDays} days</p>
								</div>
								<div>
									<span class="text-xs text-slate-500">Notify Before</span>
									<p class="text-sm font-medium">{policy.notifyBeforeDays} days</p>
								</div>
								<div>
									<span class="text-xs text-slate-500">Escalate Overdue</span>
									<p class="text-sm font-medium">{policy.escalateOverdueDays} days</p>
								</div>
								<div>
									<span class="text-xs text-slate-500">Require Approval</span>
									<p class="text-sm font-medium">{policy.requireApproval ? 'Yes' : 'No'}</p>
								</div>
							</div>
						</div>
						<div class="flex gap-2">
							<Button variant="ghost" size="sm" onclick={() => openEditPolicy(policy)}>
								<Pencil class="h-4 w-4" />
							</Button>
							<Button variant="ghost" size="sm" onclick={() => confirmDeletePolicy(policy)}>
								<Trash2 class="h-4 w-4 text-red-600" />
							</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}

	<!-- SAP Configuration Tab -->
	{#if activeTab === 'sap'}
		<Card class="p-6">
			<h3 class="mb-6 text-lg font-semibold text-slate-900">SAP Business One Configuration</h3>
			<form onsubmit={(e) => { e.preventDefault(); saveSAPConfiguration(); }}>
				<div class="space-y-4">
					<div>
						<Label>API URL *</Label>
						<Input bind:value={sapForm.apiUrl} required class="mt-2" />
					</div>
					<div>
						<Label>API Token *</Label>
						<Input type="password" bind:value={sapForm.apiToken} required class="mt-2" />
					</div>
					<div>
						<Label>Sync Interval (minutes) *</Label>
						<Input
							type="number"
							bind:value={sapForm.syncIntervalMinutes}
							min="1"
							required
							class="mt-2"
						/>
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							bind:checked={sapForm.autoSyncEnabled}
							class="h-4 w-4 rounded border-gray-300"
						/>
						<Label>Enable Auto-Sync</Label>
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							bind:checked={sapForm.isEnabled}
							class="h-4 w-4 rounded border-gray-300"
						/>
						<Label>Integration Enabled</Label>
					</div>
				</div>
				<div class="mt-6 flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onclick={testSAPConnection}
						disabled={isTestingConnection}
					>
						{#if isTestingConnection}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{:else}
							<TestTube class="mr-2 h-4 w-4" />
						{/if}
						Test Connection
					</Button>
					<Button type="submit" disabled={isSavingSAP}>
						{#if isSavingSAP}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Save Configuration
					</Button>
				</div>
			</form>
		</Card>
	{/if}

	<!-- CSV Import Tab -->
	{#if activeTab === 'import'}
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">CSV Import</h3>
			<p class="mb-4 text-sm text-slate-600">
				Paste CSV data below (up to 50,000 rows). Expected columns: code, name, category,
				location, purchaseCost, purchaseDate (YYYY-MM-DD)
			</p>
			<Textarea
				bind:value={csvInput}
				placeholder="Paste CSV here..."
				class="min-h-[200px] font-mono text-sm"
			/>

			{#if importResult}
				<div class="mt-4 rounded-lg border p-4 {importResult.success ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}">
					<div class="flex items-center gap-2 mb-2">
						{#if importResult.success}
							<CheckCircle class="h-5 w-5 text-green-600" />
							<h4 class="font-semibold text-green-900">Validation Passed</h4>
						{:else}
							<AlertCircle class="h-5 w-5 text-yellow-600" />
							<h4 class="font-semibold text-yellow-900">Validation Errors Found</h4>
						{/if}
					</div>
					<p class="text-sm {importResult.success ? 'text-green-700' : 'text-yellow-700'}">
						{importResult.imported} rows valid, {importResult.failed} rows with errors
					</p>

					{#if importResult.errors.length > 0}
						<div class="mt-3 max-h-40 overflow-y-auto">
							<h5 class="text-sm font-semibold text-slate-900 mb-2">Errors:</h5>
							{#each importResult.errors.slice(0, 10) as error}
								<p class="text-xs text-slate-700">
									Row {error.row}, {error.field}: {error.message}
								</p>
							{/each}
							{#if importResult.errors.length > 10}
								<p class="text-xs text-slate-600 mt-2">
									... and {importResult.errors.length - 10} more errors
								</p>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<div class="mt-4 flex justify-end gap-3">
				<Button variant="outline" onclick={validateCSV} disabled={isValidating}>
					{#if isValidating}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Validate
				</Button>
				<Button onclick={importCSV} disabled={isImporting || (importResult && !importResult.success)}>
					{#if isImporting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<Upload class="mr-2 h-4 w-4" />
					{/if}
					Import Data
				</Button>
			</div>
		</Card>
	{/if}

	<!-- Role & User Management Tab -->
	{#if activeTab === 'users'}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div class="flex gap-2">
					<Button
						variant={userManagementView === 'users' ? 'default' : 'outline'}
						onclick={() => (userManagementView = 'users')}
					>
						<Users class="mr-2 h-4 w-4" />
						Users ({users.length})
					</Button>
					<Button
						variant={userManagementView === 'roles' ? 'default' : 'outline'}
						onclick={() => (userManagementView = 'roles')}
					>
						<Shield class="mr-2 h-4 w-4" />
						Roles ({roles.length})
					</Button>
				</div>
				<Button onclick={userManagementView === 'users' ? openNewUser : openNewRole}>
					<Plus class="mr-2 h-4 w-4" />
					Add {userManagementView === 'users' ? 'User' : 'Role'}
				</Button>
			</div>

			<!-- Users View -->
			{#if userManagementView === 'users'}
				<Card class="overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-slate-50 border-b">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
										User
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
										Email
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
										Role
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
										Department
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
										Status
									</th>
									<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200">
								{#each users as user}
									<tr class="hover:bg-slate-50">
										<td class="px-6 py-4 whitespace-nowrap">
											<div>
												<div class="text-sm font-medium text-slate-900">
													{user.firstName}
													{user.lastName}
												</div>
												<div class="text-xs text-slate-500">@{user.username}</div>
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
											{user.email}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm">
											<Badge>{user.roleName}</Badge>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
											{user.department || '-'}
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<Badge variant={getStatusBadgeVariant(user.status)}>
												{user.status}
											</Badge>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-right text-sm">
											<Button variant="ghost" size="sm" onclick={() => openEditUser(user)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="sm" onclick={() => confirmDeleteUser(user)}>
												<Trash2 class="h-4 w-4 text-red-600" />
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card>
			{/if}

			<!-- Roles View -->
			{#if userManagementView === 'roles'}
				<div class="grid gap-4">
					{#each roles as role}
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="flex items-center gap-3 mb-2">
										<h4 class="font-semibold text-slate-900">{role.name}</h4>
										{#if role.isSystemRole}
											<Badge variant="default">System Role</Badge>
										{/if}
										<Badge variant="outline">{role.userCount} users</Badge>
									</div>
									<p class="text-sm text-slate-600 mb-3">{role.description}</p>
									<div class="flex flex-wrap gap-1">
										{#each role.permissions.slice(0, 5) as permId}
											{@const perm = permissions.find((p) => p.id === permId)}
											{#if perm}
												<Badge variant="secondary" class="text-xs">{perm.name}</Badge>
											{/if}
										{/each}
										{#if role.permissions.length > 5}
											<Badge variant="secondary" class="text-xs">
												+{role.permissions.length - 5} more
											</Badge>
										{/if}
									</div>
								</div>
								<div class="flex gap-2">
									<Button variant="ghost" size="sm" onclick={() => openEditRole(role)}>
										<Pencil class="h-4 w-4" />
									</Button>
									{#if !role.isSystemRole}
										<Button variant="ghost" size="sm" onclick={() => confirmDeleteRole(role)}>
											<Trash2 class="h-4 w-4 text-red-600" />
										</Button>
									{/if}
								</div>
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Edit Policy Dialog -->
<Dialog
	bind:open={isEditingPolicy}
	title="{editingPolicy?.id ? 'Edit' : 'Create'} Maintenance Policy"
	description="Configure the maintenance policy settings and intervals."
	class="max-w-2xl">
	{#if editingPolicy}
		<form onsubmit={(e) => { e.preventDefault(); savePolicy(); }} class="space-y-4">
				<div>
					<Label>Policy Name *</Label>
					<Input bind:value={editingPolicy.name} required class="mt-2" />
				</div>
				<div>
					<Label>Description *</Label>
					<Textarea bind:value={editingPolicy.description} required class="mt-2" />
				</div>
				<div class="grid gap-4 md:grid-cols-3">
					<div>
						<Label>Default Interval (days) *</Label>
						<Input
							type="number"
							bind:value={editingPolicy.defaultIntervalDays}
							min="1"
							required
							class="mt-2"
						/>
					</div>
					<div>
						<Label>Notify Before (days) *</Label>
						<Input
							type="number"
							bind:value={editingPolicy.notifyBeforeDays}
							min="0"
							required
							class="mt-2"
						/>
					</div>
					<div>
						<Label>Escalate Overdue (days) *</Label>
						<Input
							type="number"
							bind:value={editingPolicy.escalateOverdueDays}
							min="0"
							required
							class="mt-2"
						/>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={editingPolicy.requireApproval}
						class="h-4 w-4 rounded border-gray-300"
					/>
					<Label>Require Approval</Label>
				</div>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={editingPolicy.isActive}
						class="h-4 w-4 rounded border-gray-300"
					/>
					<Label>Active</Label>
				</div>
				<div class="flex justify-end gap-3 mt-6">
					<Button type="button" variant="outline" onclick={() => (isEditingPolicy = false)}>
						Cancel
					</Button>
					<Button type="submit">Save Policy</Button>
				</div>
		</form>
	{/if}
</Dialog>

<!-- Delete Policy Confirmation -->
<Dialog
	bind:open={isDeletingPolicy}
	title="Delete Policy"
	description="Are you sure you want to delete the policy '{policyToDelete?.name}'? This action cannot be undone.">
	<div class="flex justify-end gap-3 mt-4">
		<Button variant="outline" onclick={() => (isDeletingPolicy = false)}>Cancel</Button>
		<Button variant="destructive" onclick={deletePolicy}>Delete</Button>
	</div>
</Dialog>

<!-- Edit User Dialog -->
<Dialog
	bind:open={isEditingUser}
	title="{editingUser?.id ? 'Edit' : 'Create'} User"
	description="Fill in the user information below."
	class="max-w-2xl">
	{#if editingUser}
		<form onsubmit={(e) => { e.preventDefault(); saveUser(); }} class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<Label>First Name *</Label>
						<Input bind:value={editingUser.firstName} required class="mt-2" />
					</div>
					<div>
						<Label>Last Name *</Label>
						<Input bind:value={editingUser.lastName} required class="mt-2" />
					</div>
					<div>
						<Label>Username *</Label>
						<Input bind:value={editingUser.username} required class="mt-2" />
					</div>
					<div>
						<Label>Email *</Label>
						<Input type="email" bind:value={editingUser.email} required class="mt-2" />
					</div>
					<div>
						<Label>Phone</Label>
						<Input bind:value={editingUser.phone} class="mt-2" />
					</div>
					<div>
						<Label>Department</Label>
						<Input bind:value={editingUser.department} class="mt-2" />
					</div>
					<div>
						<Label>Role *</Label>
						<select bind:value={editingUser.roleId} required class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2">
							{#each roles as role}
								<option value={role.id}>{role.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<Label>Status *</Label>
						<select bind:value={editingUser.status} required class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2">
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
							<option value="Pending">Pending</option>
						</select>
					</div>
				</div>
				<div class="flex justify-end gap-3 mt-6">
					<Button type="button" variant="outline" onclick={() => (isEditingUser = false)}>
						Cancel
					</Button>
					<Button type="submit">Save User</Button>
			</div>
		</form>
	{/if}
</Dialog>

<!-- Delete User Confirmation -->
<Dialog
	bind:open={isDeletingUser}
	title="Delete User"
	description="Are you sure you want to delete user '{userToDelete?.firstName} {userToDelete?.lastName}'? This action cannot be undone.">
	<div class="flex justify-end gap-3 mt-4">
		<Button variant="outline" onclick={() => (isDeletingUser = false)}>Cancel</Button>
		<Button variant="destructive" onclick={deleteUser}>Delete</Button>
	</div>
</Dialog>

<!-- Edit Role Dialog -->
<Dialog
	bind:open={isEditingRole}
	title="{editingRole?.id ? 'Edit' : 'Create'} Role"
	description="Configure the role and assign permissions."
	class="max-w-3xl">
	{#if editingRole}
		<form onsubmit={(e) => { e.preventDefault(); saveRole(); }} class="space-y-4">
				<div>
					<Label>Role Name *</Label>
					<Input bind:value={editingRole.name} required class="mt-2" disabled={editingRole.isSystemRole} />
				</div>
				<div>
					<Label>Description *</Label>
					<Textarea bind:value={editingRole.description} required class="mt-2" disabled={editingRole.isSystemRole} />
				</div>
				<div>
					<Label class="mb-3 block">Permissions</Label>
					<div class="space-y-4 max-h-96 overflow-y-auto rounded-lg border p-4">
						{#each Object.entries(permissionsByModule()) as [module, perms]}
							<div>
								<h4 class="font-semibold text-sm text-slate-900 mb-2 capitalize">
									{module.replace('-', ' ')}
								</h4>
								<div class="space-y-2">
									{#each perms as perm}
										<label class="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={editingRole.permissions.includes(perm.id)}
												onchange={() => togglePermission(perm.id)}
												disabled={editingRole.isSystemRole}
												class="h-4 w-4 rounded border-gray-300"
											/>
											<span class="text-sm text-slate-700">{perm.name}</span>
											<span class="text-xs text-slate-500">- {perm.description}</span>
										</label>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="flex justify-end gap-3 mt-6">
					<Button type="button" variant="outline" onclick={() => (isEditingRole = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={editingRole.isSystemRole}>
						Save Role
					</Button>
			</div>
		</form>
	{/if}
</Dialog>

<!-- Delete Role Confirmation -->
<Dialog
	bind:open={isDeletingRole}
	title="Delete Role"
	description="Are you sure you want to delete the role '{roleToDelete?.name}'? This action cannot be undone.">
	<div class="flex justify-end gap-3 mt-4">
		<Button variant="outline" onclick={() => (isDeletingRole = false)}>Cancel</Button>
		<Button variant="destructive" onclick={deleteRole}>Delete</Button>
	</div>
</Dialog>
