// dateUtils.ts
export function getTimeOfDay(hour: number): string {
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }