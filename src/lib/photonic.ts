export interface PhotonicWallet {
  connect(): Promise<{ success: boolean; address: string }>;
  sign(tx: string): Promise<{ success: boolean; signature: string }>;
  getBalance(address: string): Promise<{ success: boolean; balance: number }>;
}

declare global {
  interface Window {
    photonic?: PhotonicWallet;
  }
}