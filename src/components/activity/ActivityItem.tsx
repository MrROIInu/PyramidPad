import React from 'react';

interface ActivityItemProps {
  message: string;
  isNew: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ message, isNew }) => {
  return (
    <div 
      className={`${
        isNew ? 'bg-yellow-600 text-white' : 'text-yellow-600/80'
      } py-1 px-2 rounded transition-colors duration-300`}
    >
      {message}
    </div>
  );
};