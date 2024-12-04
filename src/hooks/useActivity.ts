import { useState, useEffect } from 'react';
import { activityManager, ActivityUpdate } from '../lib/activityManager';

export const useActivity = () => {
  const [activities, setActivities] = useState<ActivityUpdate[]>(
    activityManager.getActivities()
  );

  useEffect(() => {
    const subscription = activityManager.subscribe(setActivities);
    return () => subscription.unsubscribe();
  }, []);

  return activities;
};