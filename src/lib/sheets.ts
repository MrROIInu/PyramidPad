import { Order } from '../types';

const SHEET_ID = 'your-sheet-id';
const SHEET_NAME = 'Orders';

export async function fetchOrders(): Promise<Order[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    const jsonString = text.substring(47).slice(0, -2);
    const json = JSON.parse(jsonString);
    
    return json.table.rows.map((row: any) => ({
      id: row.c[0].v,
      fromToken: row.c[1].v,
      toToken: row.c[2].v,
      fromAmount: row.c[3].v,
      toAmount: row.c[4].v,
      swapTx: row.c[5].v,
      claimed: row.c[6].v === 'TRUE',
      created_at: row.c[7].v,
      claim_count: row.c[8]?.v || 0
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}