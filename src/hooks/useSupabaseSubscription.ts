import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseSubscription = (channels: string[], callback: () => void) => {
  useEffect(() => {
    const subscriptions = channels.map(table => 
      supabase
        .channel(`${table}-changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
        .subscribe()
    );
    
    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [channels, callback]);
};