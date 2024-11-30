import { MiningData } from '../types';

// Mining data for each token
export const MINING_DATA: Record<string, MiningData> = {
  "GLYPH": { preminted: 10, minted: 4.93, difficulty: 150 },
  "GOAT": { preminted: 15, minted: 84.61, difficulty: 100 },
  "RISI": { preminted: 5, minted: 10.90, difficulty: 10 },
  "π": { preminted: 0, minted: 0.12, difficulty: 1 },
  "RADCHAD": { preminted: 0, minted: 2.53, difficulty: 1 },
  "P2P": { preminted: 10, minted: 4.70, difficulty: 1 },
  "WOJAK": { preminted: 20, minted: 31.47, difficulty: 1 },
  "Me me": { preminted: 0, minted: 0.73, difficulty: 3 },
  "DAD": { preminted: 5, minted: 6.90, difficulty: 1 },
  "SIR": { preminted: 10, minted: 13.65, difficulty: 1 },
  "POW": { preminted: 0, minted: 5.38, difficulty: 1 },
  "PEPE": { preminted: 0, minted: 0.57, difficulty: 1 },
  "COPIUM": { preminted: 50, minted: 48.83, difficulty: 1000 },
  "KEKW": { preminted: 0, minted: 3.47, difficulty: 50 },
  "PILIM": { preminted: 0, minted: 0.77, difficulty: 25 },
  "ENTITY": { preminted: 0, minted: 5.84, difficulty: 10 },
  "BTC": { preminted: 10, minted: 4.11, difficulty: 349 },
  "NEP": { preminted: 20, minted: 16.60, difficulty: 40 },
  "R6": { preminted: 30, minted: 27.66, difficulty: 6 },
  "BPM": { preminted: 40, minted: 17.37, difficulty: 888 },
  "DEEZ": { preminted: 0, minted: 0.25, difficulty: 10 },
  "OP_CAT": { preminted: 0, minted: 2.35, difficulty: 7 },
  "UȻME": { preminted: 0, minted: 0.00, difficulty: 16 },
  "TYS": { preminted: 0, minted: 0.12, difficulty: 400 },
  "KAKL": { preminted: 0, minted: 1.03, difficulty: 50 },
  "RZBT": { preminted: 30, minted: 36.56, difficulty: 20 },
  "忍者": { preminted: 0, minted: 0.07, difficulty: 226 },
  "BITQ": { preminted: 0, minted: 0.00, difficulty: 400 },
  "PIZZA": { preminted: 0, minted: 1.00, difficulty: 50 },
  "LAMBO": { preminted: 0, minted: 0.05, difficulty: 25 },
  "LAURA": { preminted: 0, minted: 0.00, difficulty: 69 },
  "BOI": { preminted: 20, minted: 24.00, difficulty: 7 },
  "BNET": { preminted: 0, minted: 0.94, difficulty: 150 },
  "DPR": { preminted: 5, minted: 10.82, difficulty: 10 },
  "RXDASIC": { preminted: 0, minted: 1.29, difficulty: 10 },
  "RANTX": { preminted: 0, minted: 0.06, difficulty: 218 },
  "DJANGO": { preminted: 10, minted: 8.24, difficulty: 100 },
  "RGB": { preminted: 0, minted: 0.03, difficulty: 50 },
  "GRAVITY": { preminted: 0, minted: 2.76, difficulty: 10 },
  "KATA": { preminted: 0, minted: 3.02, difficulty: 85 },
  "NEOX": { preminted: 0, minted: 0.03, difficulty: 699 }
};

export const getMiningData = (symbol: string): MiningData => {
  return MINING_DATA[symbol] || { preminted: 0, minted: 0, difficulty: 1 };
};