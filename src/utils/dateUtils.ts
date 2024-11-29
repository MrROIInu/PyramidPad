export const calculateAge = (date: string | Date): string => {
  const launchDate = new Date(date);
  const days = Math.floor((Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
  return `${days}d`;
};