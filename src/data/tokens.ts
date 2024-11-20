interface Token {
  symbol: string;
  name: string;
  imageUrl: string;
  totalSupply: number;
}

export const TOKENS: Token[] = [
  {
    symbol: "RXD",
    name: "Radiant",
    imageUrl: "https://static.wixstatic.com/media/c0fd9f_33dd965b95d54dfe9af12ed99fe5c43a~mv2.png",
    totalSupply: 21000000000 // Updated from 120000000 to 21 billion
  },
  // Rest of the tokens remain unchanged
  {
    symbol: "RADCAT",
    name: "RadCat",
    imageUrl: "https://static.wixstatic.com/media/c0fd9f_c2c4b7bf64464273a2cf3e30d08a9692~mv2.png",
    totalSupply: 21000000
  },
  // ... rest of the tokens array
];