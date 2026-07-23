import { addDays, differenceInDays, format } from 'date-fns';

export function getDaysInterval(revisionCount: number): number {
  if (revisionCount <= 1) return 7;   // 1 week
  if (revisionCount === 2) return 14;  // 2 weeks
  if (revisionCount === 3) return 28;  // 4 weeks
  return 56;                           // 8 weeks
}

export function getNextRevisionDueDate(lastRevisedAt: string | Date, revisionCount: number): Date {
  const baseDate = new Date(lastRevisedAt);
  const days = getDaysInterval(revisionCount);
  return addDays(baseDate, days);
}

export function getRevisionStatus(lastRevisedAt: string | Date, revisionCount: number): {
  isDue: boolean;
  dueDate: Date;
  daysRemaining: number;
  displayText: string;
} {
  const dueDate = getNextRevisionDueDate(lastRevisedAt, revisionCount);
  const now = new Date();
  const diffDays = differenceInDays(dueDate, now);

  if (diffDays <= 0) {
    return {
      isDue: true,
      dueDate,
      daysRemaining: diffDays,
      displayText: 'Due Now!',
    };
  }

  return {
    isDue: false,
    dueDate,
    daysRemaining: diffDays,
    displayText: `Due in ${diffDays}d (${format(dueDate, 'MMM d')})`,
  };
}
