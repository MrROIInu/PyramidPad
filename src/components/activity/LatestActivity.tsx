import React from 'react';
import { Activity } from 'lucide-react';
import { useActivity } from '../../hooks/useActivity';
import { ActivityItem } from './ActivityItem';

export const LatestActivity = () => {
  const activities = useActivity();

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Latest Activity</h3>
      </div>

      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isNew={false}
            />
          ))
        ) : (
          <p className="text-yellow-600/80">Waiting for activity...</p>
        )}
      </div>
    </div>
  );
};