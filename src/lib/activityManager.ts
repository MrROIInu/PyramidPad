import { supabase } from './supabase';
import { BehaviorSubject } from 'rxjs';

export interface ActivityUpdate {
  id: string;
  type: 'new_order' | 'claim';
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  timestamp: string;
}

class ActivityManager {
  private activitySubject = new BehaviorSubject<ActivityUpdate[]>([]);
  private maxActivities = 10;

  constructor() {
    this.initializeSubscription();
  }

  private initializeSubscription() {
    supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT' || 
             (payload.eventType === 'UPDATE' && payload.new.claimed)) {
            this.handleActivityUpdate(payload);
          }
        }
      )
      .subscribe();
  }

  private handleActivityUpdate(payload: any) {
    const newActivity: ActivityUpdate = {
      id: `${payload.new.id}-${Date.now()}`,
      type: payload.eventType === 'INSERT' ? 'new_order' : 'claim',
      fromToken: payload.new.from_token,
      toToken: payload.new.to_token,
      fromAmount: payload.new.from_amount,
      toAmount: payload.new.to_amount,
      timestamp: new Date().toISOString()
    };

    const currentActivities = this.activitySubject.value;
    const updatedActivities = [newActivity, ...currentActivities]
      .slice(0, this.maxActivities);

    this.activitySubject.next(updatedActivities);

    // Trigger page shake animation
    document.body.classList.add('animate-shake');
    setTimeout(() => {
      document.body.classList.remove('animate-shake');
    }, 2500);
  }

  public subscribe(callback: (activities: ActivityUpdate[]) => void) {
    return this.activitySubject.subscribe(callback);
  }

  public getActivities() {
    return this.activitySubject.value;
  }
}

export const activityManager = new ActivityManager();