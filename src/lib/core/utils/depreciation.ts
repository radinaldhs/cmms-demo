import type { Asset, DepreciationSchedule, AssetFinancials } from '$types';
import { differenceInYears, parseISO } from 'date-fns';

/**
 * Calculate straight-line depreciation for an asset
 * Formula: (Purchase Cost - Residual Value) / Useful Life Years
 */
export function calculateAnnualDepreciation(
	purchaseCost: number,
	residualValue: number,
	usefulLifeYears: number
): number {
	if (usefulLifeYears <= 0) return 0;
	return (purchaseCost - residualValue) / usefulLifeYears;
}

/**
 * Calculate accumulated depreciation up to a specific date
 */
export function calculateAccumulatedDepreciation(
	purchaseDate: string,
	purchaseCost: number,
	residualValue: number,
	usefulLifeYears: number,
	asOfDate: Date = new Date()
): number {
	const purchaseDateObj = parseISO(purchaseDate);
	const yearsPassed = differenceInYears(asOfDate, purchaseDateObj);

	// Cannot depreciate beyond useful life
	const actualYears = Math.min(yearsPassed, usefulLifeYears);
	const annualDepreciation = calculateAnnualDepreciation(
		purchaseCost,
		residualValue,
		usefulLifeYears
	);

	// Calculate partial year depreciation for current year
	const monthsPassed = (asOfDate.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
	const totalYears = Math.min(monthsPassed / 12, usefulLifeYears);

	return Math.min(annualDepreciation * totalYears, purchaseCost - residualValue);
}

/**
 * Calculate current book value
 */
export function calculateBookValue(
	purchaseDate: string,
	purchaseCost: number,
	residualValue: number,
	usefulLifeYears: number
): number {
	const accumulated = calculateAccumulatedDepreciation(
		purchaseDate,
		purchaseCost,
		residualValue,
		usefulLifeYears
	);
	return Math.max(purchaseCost - accumulated, residualValue);
}

/**
 * Generate full depreciation schedule for an asset
 */
export function generateDepreciationSchedule(
	purchaseDate: string,
	purchaseCost: number,
	residualValue: number,
	usefulLifeYears: number
): DepreciationSchedule[] {
	const schedule: DepreciationSchedule[] = [];
	const annualDepreciation = calculateAnnualDepreciation(
		purchaseCost,
		residualValue,
		usefulLifeYears
	);

	let currentValue = purchaseCost;
	const purchaseYear = parseISO(purchaseDate).getFullYear();

	for (let year = 0; year <= usefulLifeYears; year++) {
		const depreciation = year === 0 ? 0 : Math.min(annualDepreciation, currentValue - residualValue);
		const endingValue = Math.max(currentValue - depreciation, residualValue);

		schedule.push({
			year: purchaseYear + year,
			startingValue: currentValue,
			depreciation: depreciation,
			endingValue: endingValue
		});

		currentValue = endingValue;
	}

	return schedule;
}

/**
 * Calculate complete asset financials including maintenance costs
 */
export function calculateAssetFinancials(
	asset: Asset,
	maintenanceCostTotal: number,
	maintenanceCostYTD: number
): AssetFinancials {
	const annualDepreciation = calculateAnnualDepreciation(
		asset.purchaseCost,
		asset.residualValue,
		asset.usefulLifeYears
	);

	const accumulatedDepreciation = calculateAccumulatedDepreciation(
		asset.purchaseDate,
		asset.purchaseCost,
		asset.residualValue,
		asset.usefulLifeYears
	);

	const bookValue = calculateBookValue(
		asset.purchaseDate,
		asset.purchaseCost,
		asset.residualValue,
		asset.usefulLifeYears
	);

	const schedule = generateDepreciationSchedule(
		asset.purchaseDate,
		asset.purchaseCost,
		asset.residualValue,
		asset.usefulLifeYears
	);

	return {
		purchaseCost: asset.purchaseCost,
		accumulatedDepreciation,
		bookValue,
		annualDepreciation,
		depreciationSchedule: schedule,
		maintenanceCostYTD,
		maintenanceCostTotal
	};
}
