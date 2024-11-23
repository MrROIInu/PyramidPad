// Previous imports remain the same...

export const OrderBookDemo: React.FC = () => {
  // Previous state declarations remain the same...

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([\w\d]+)/);
    if (match) {
      const [, amount, fromSymbol, toAmt, toSymbol, tx] = match;
      
      // Check if the pair matches RXD/DOGE in either direction
      if ((fromSymbol === 'RXD' && toSymbol === 'DOGE') || (fromSymbol === 'DOGE' && toSymbol === 'RXD')) {
        const shouldSwitchDirection = fromSymbol === 'DOGE';
        
        // Switch direction if needed
        if (shouldSwitchDirection !== !isRxdToDoge) {
          setIsRxdToDoge(!shouldSwitchDirection);
        }
        
        // Set amounts based on direction
        if (shouldSwitchDirection) {
          setFromAmount(toAmt); // DOGE amount becomes from amount
          setToAmount(amount); // RXD amount becomes to amount
        } else {
          setFromAmount(amount); // RXD amount becomes from amount
          setToAmount(toAmt); // DOGE amount becomes to amount
        }
        
        setTransactionId(tx);
        setTradeRatio(calculateTradeRatio(
          parseFloat(shouldSwitchDirection ? toAmt : amount),
          parseFloat(shouldSwitchDirection ? amount : toAmt)
        ));
      }
    } else {
      // Try to extract just the TX
      const txMatch = text.match(/📋([\w\d]+)/);
      if (txMatch) {
        setTransactionId(txMatch[1]);
      }
    }
  };

  // Rest of the component remains the same...
};