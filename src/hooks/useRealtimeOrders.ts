```typescript
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export const useRealtimeOrders = (onUpdate: () => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Trigger page shake animation
          document.body.classList.add('animate-shake');
          setTimeout(() => {
            document.body.classList.remove('animate-shake');
          }, 1500);
          
          // Update orders
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [onUpdate]);
};
```