import { workOrders } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const allWorkOrders = workOrders.getAll();

	// Calculate metrics
	const totalWorkOrders = allWorkOrders.length;
	const plannedWorkOrders = allWorkOrders.filter((wo) => wo.status === 'Planned').length;
	const inProgressWorkOrders = allWorkOrders.filter((wo) => wo.status === 'In Progress').length;
	const overdueWorkOrders = workOrders.getOverdue().length;

	return {
		metrics: {
			total: totalWorkOrders,
			planned: plannedWorkOrders,
			inProgress: inProgressWorkOrders,
			overdue: overdueWorkOrders
		}
	};
};
