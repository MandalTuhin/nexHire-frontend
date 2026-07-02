export interface HiringCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  allocatedAmount: number;
}

export interface BudgetAllocation {
  id: string;
  cycleId: string;
  hrId: string;
  hrName: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}
