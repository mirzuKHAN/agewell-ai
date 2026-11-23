import type { FinancialInputs, FinancialYear } from '../types';

const BASE_NEW_INSTITUTIONS = [8, 12, 20, 25, 30];
const OPERATING_EXPENSES = [3_000_000, 3_400_000, 3_800_000, 4_200_000, 4_600_000];
const CAPITAL_EXPENDITURE = [300_000, 200_000, 200_000, 200_000, 200_000];
const roundToThousands = (value: number) => Math.round(value / 1_000) * 1_000;

export const DEFAULT_FINANCIAL_INPUTS: FinancialInputs = {
  acquisitionMultiplier: 1,
  servicingMultiplier: 1,
  siteFee: 1_500,
  residentFee: 60,
  residentsPerSite: 75,
};

export function calculateFinancialForecast(inputs: FinancialInputs): FinancialYear[] {
  let yearEndInstitutions = 0;
  let openingCash = 9_000_000;
  const annualRecurringRevenuePerSite =
    (inputs.siteFee + inputs.residentsPerSite * inputs.residentFee) * 12;

  return BASE_NEW_INSTITUTIONS.map((plannedNew, index) => {
    const newInstitutions = Math.max(0, Math.round(plannedNew * inputs.acquisitionMultiplier));
    const previousYearEnd = yearEndInstitutions;
    yearEndInstitutions += newInstitutions;
    // The original proposal uses the midpoint of opening and closing customer counts.
    const averageActiveInstitutions = (previousYearEnd + yearEndInstitutions) / 2;

    const subscriptionRevenue = averageActiveInstitutions * annualRecurringRevenuePerSite;
    const implementationRevenue = newInstitutions * 20_000;
    const hardwareRevenue = newInstitutions * 15_000;
    const totalRevenue = roundToThousands(subscriptionRevenue + implementationRevenue + hardwareRevenue);
    // The proposal presents its HK$ figures rounded to the nearest thousand.
    const servicingCosts = roundToThousands(averageActiveInstitutions * 15_000 * inputs.servicingMultiplier);
    const hardwareCosts = roundToThousands(newInstitutions * 10_000);
    const grossProfit = roundToThousands(totalRevenue - servicingCosts - hardwareCosts);
    const operatingExpenses = OPERATING_EXPENSES[index];
    const operatingProfit = roundToThousands(grossProfit - operatingExpenses);
    const capitalExpenditure = CAPITAL_EXPENDITURE[index];
    const netCashFlow = roundToThousands(operatingProfit - capitalExpenditure);
    const closingCash = roundToThousands(openingCash + netCashFlow);

    const row: FinancialYear = {
      year: 2027 + index,
      newInstitutions,
      yearEndInstitutions,
      averageActiveInstitutions,
      subscriptionRevenue,
      implementationRevenue,
      hardwareRevenue,
      totalRevenue,
      servicingCosts,
      hardwareCosts,
      grossProfit,
      operatingExpenses,
      operatingProfit,
      capitalExpenditure,
      netCashFlow,
      openingCash,
      closingCash,
    };

    openingCash = closingCash;
    return row;
  });
}

export function formatHKD(value: number, compact = false): string {
  if (compact) {
    const millions = value / 1_000_000;
    return `HK$${millions.toFixed(2)}m`;
  }
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(value);
}
