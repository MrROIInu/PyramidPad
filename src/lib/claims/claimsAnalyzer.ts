import { supabase } from '../supabase';
import { Order } from '../../types';

interface TokenActivity {
  buys: number;
  sells: number;
  netVolume: number;
  priceChange: number;
}

export const analyzeTokenActivity = async (symbol: string): Promise<TokenActivity> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('claimed', true)
    .gte('claimed_at', today.toISOString())
    .or(`from_token.eq.${symbol},to_token.eq.${symbol}`);

  if (error) {
    console.error('Error analyzing token activity:', error);
    return { buys: 0, sells: 0, netVolume: 0, priceChange: 0 };
  }

  const activity = (orders || []).reduce((acc, order) => {
    if (order.to_token === symbol) {
      acc.buys++;
      acc.netVolume += order.to_amount;
    } else {
      acc.sells++;
      acc.netVolume -= order.from_amount;
    }
    return acc;
  }, { buys: 0, sells: 0, netVolume: 0 } as Omit<TokenActivity, 'priceChange'>);

  // Calculate price change based on net volume
  const priceChange = (activity.netVolume > 0 ? 1 : -1) * 
    Math.abs(activity.netVolume) * 0.0001; // 0.01% per net volume unit

  return {
    ...activity,
    priceChange
  };
};