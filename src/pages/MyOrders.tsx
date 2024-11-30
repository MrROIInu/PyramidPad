import React, { useState, useEffect } from 'react';
import { OrderList } from '../components/OrderList';
import { useOrders } from '../hooks/useOrders';
import { WalletAddressInput } from '../components/wallet/WalletAddressInput';
import { useWalletManager } from '../hooks/useWalletManager';

export const MyOrders: React.FC = () => {
  const { orders, onClaim, onCancel } = useOrders();
  const {
    walletAddress,
    isWalletChecked,
    isWalletValid,
    copied,
    handleWalletChange,
    checkWallet,
    copyFeeWallet
  } = useWalletManager();

  const [filteredOrders, setFilteredOrders] = useState(orders);

  useEffect(() => {
    if (walletAddress && isWalletValid) {
      setFilteredOrders(orders.filter(order => order.wallet_address === walletAddress));
    } else {
      setFilteredOrders([]);
    }
  }, [orders, walletAddress, isWalletValid]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8">
        My Orders
      </h1>

      <div className="mb-8">
        <WalletAddressInput
          walletAddress={walletAddress}
          isWalletChecked={isWalletChecked}
          isWalletValid={isWalletValid}
          copied={copied}
          onWalletChange={handleWalletChange}
          onCopyFeeWallet={copyFeeWallet}
        />
      </div>

      {isWalletValid && (
        <OrderList
          orders={filteredOrders}
          onClaim={onClaim}
          onCancel={onCancel}
          showCancelButton={true}
          userWalletAddress={walletAddress}
        />
      )}
    </div>
  );
};