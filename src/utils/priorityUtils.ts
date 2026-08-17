import { PriorityLevel } from '../types';

export const getPriorityScore = (priority: PriorityLevel): number => {
  switch (priority) {
    case 'critica': return 40;
    case 'alta': return 30;
    case 'media': return 20;
    case 'baja': return 10;
    default: return 0;
  }
};

export const getOperationalPriorityScore = (
  entity: { priority: PriorityLevel; dueDate?: string; slaDueDate?: string; status: string; isFocused?: boolean; isBlocked?: boolean }
): number => {
  let score = getPriorityScore(entity.priority);
  
  // Status modifiers
  if (['completada', 'resuelta', 'cerrada', 'cancelada', 'finalizado'].includes(entity.status)) {
    return 0; // No priority if closed
  }

  // Focus modifiers
  if (entity.isFocused) score += 15;
  if (entity.isBlocked) score += 5; // Needs attention to unblock

  // Date modifiers (SLA or Due Date)
  const targetDate = entity.slaDueDate || entity.dueDate;
  if (targetDate) {
    const today = new Date().toISOString().split('T')[0];
    if (targetDate < today) {
      score += 25; // Overdue
    } else if (targetDate === today) {
      score += 10; // Due today
    }
  }

  return score;
};
