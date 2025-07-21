import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDateRange(range: string) {
  const today = new Date();
  const startDate = new Date();
  
  switch (range) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      startDate.setDate(today.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "last7days":
      startDate.setDate(today.getDate() - 7);
      break;
    case "last30days":
      startDate.setDate(today.getDate() - 30);
      break;
    case "thisMonth":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "lastMonth":
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  };
}
