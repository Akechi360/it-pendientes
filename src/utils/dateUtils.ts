export const normalizeDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const formatDate = (dateString: string | null | undefined, includeTime = false): string => {
  const date = normalizeDate(dateString);
  if (!date) return 'Sin fecha';
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('es-ES', options);
};

export const getDaysDifference = (dateString: string | null | undefined): number | null => {
  const date = normalizeDate(dateString);
  if (!date) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dateString: string | null | undefined): boolean => {
  const diff = getDaysDifference(dateString);
  return diff !== null && diff < 0;
};
