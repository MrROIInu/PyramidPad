import { MiningData } from '../types';

// Mining data for each token with both preminted and minted as percentages
export const MINING_DATA: Record<string, MiningData> = {
  "RADCAT": { preminted: 0, minted: 100, difficulty: 0 },
  "PILIM": { preminted: 0, minted: 0.77, difficulty: 25 },
  "FUGAZI": { preminted: 10, minted: 100, difficulty: 1 },
  "GLYPH": { preminted: 10, minted: 4.93, difficulty: 150 },
  "RAD": { preminted: 0, minted: 100, difficulty: 1 },
  "KEKW": { preminted: 0, minted: 3.47, difficulty: 50 },
  "PEPE": { preminted: 0, minted: 0.57, difficulty: 1 },
  "DOGE": { preminted: 0, minted: 100, difficulty: 1 },
  "φῶς": { preminted: 9.2, minted: 100, difficulty: 1 },
  "NEP": { preminted: 0, minted: 16.60, difficulty: 40 },
  "DJANGO": { preminted: 10, minted: 8.24, difficulty: 100 },
  "BTC": { preminted: 10, minted: 4.11, difficulty: 349 },
  "SERPENTX": { preminted: 50, minted: 100, difficulty: 1 },
  "COPIUM": { preminted: 50, minted: 48.83, difficulty: 1000 },
  "RADMALLOW": { preminted: 0, minted: 100, difficulty: 1 },
  "MERI": { preminted: 0, minted: 100, difficulty: 1 },
  "SPIN": { preminted: 47, minted: 100, difficulty: 1 },
  "DIABLO": { preminted: 0, minted: 100, difficulty: 1 },
  "HOPIUM": { preminted: 0, minted: 100, difficulty: 1 },
  "RGB": { preminted: 52, minted: 0.03, difficulty: 50 },
  "ENTITY": { preminted: 7.2, minted: 5.84, difficulty: 10 },
  "RANTX": { preminted: 0, minted: 0.06, difficulty: 218 },
  "RXDASIC": { preminted: 7.2, minted: 1.23, difficulty: 10 },
  "DPR": { preminted: 5, minted: 10.82, difficulty: 10 },
  "BNET": { preminted: 0, minted: 0.94, difficulty: 150 },
  "LAURA": { preminted: 9.9, minted: 0, difficulty: 69 },
  "BPM": { preminted: 40, minted: 17.37, difficulty: 888 },
  "LAMBO": { preminted: 0, minted: 0.05, difficulty: 25 },
  "PIZZA": { preminted: 0, minted: 1.00, difficulty: 50 },
  "BITQ": { preminted: 0, minted: 0, difficulty: 400 },
  "R6": { preminted: 0, minted: 27.66, difficulty: 6 },
  "TYS": { preminted: 0, minted: 0.12, difficulty: 400 },
  "忍者": { preminted: 0, minted: 0.07, difficulty: 226 },
  "BOI": { preminted: 0, minted: 24.00, difficulty: 7 },
  "DEEZ": { preminted: 0, minted: 0.25, difficulty: 10 },
  "RZBT": { preminted: 0, minted: 36.56, difficulty: 20 },
  "KAKL": { preminted: 10, minted: 1.03, difficulty: 50 },
  "OP_CAT": { preminted: 0, minted: 2.35, difficulty: 7 },
  "UȻME": { preminted: 0, minted: 0, difficulty: 16 },
  "GOAT": { preminted: 1, minted: 84.61, difficulty: 100 },
  "XD": { preminted: 100, minted: 100, difficulty: 0 },
  "GRAVITY": { preminted: 10, minted: 2.50, difficulty: 10 },
  "POW": { preminted: 0, minted: 5.38, difficulty: 1 },
  "NEOX": { preminted: 47.14, minted: 0.01, difficulty: 699 },
  "GODZ": { preminted: 0, minted: 0, difficulty: 1 },
  "WOJAK": { preminted: 0, minted: 31.47, difficulty: 1 },
  "Me me": { preminted: 0, minted: 0.73, difficulty: 3 },
  "DAD": { preminted: 5, minted: 6.90, difficulty: 1 },
  "RISI": { preminted: 25.81, minted: 10.90, difficulty: 10 },
  "SIR": { preminted: 0, minted: 13.65, difficulty: 1 },
  "HAT": { preminted: 0, minted: 100, difficulty: 1 },
  "π": { preminted: 0, minted: 0.12, difficulty: 1 },
  "P2P": { preminted: 0, minted: 4.70, difficulty: 1 },
  "RADCHAD": { preminted: 0, minted: 2.53, difficulty: 1 }
};

export const getMiningData = (symbol: string): MiningData => {
  return MINING_DATA[symbol] || { preminted: 0, minted: 0, difficulty: 1 };
};