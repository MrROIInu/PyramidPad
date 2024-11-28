export const calculateAge = (launchDate: Date): string => {
  const days = Math.floor((Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
  return `${days}d`;
};