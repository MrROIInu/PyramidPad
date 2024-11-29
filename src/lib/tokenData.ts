import { MiningData } from '../types';

// Mining data for each token
export const MINING_DATA: Record<string, MiningData> = {
  "GLYPH": { mined: 4.93, difficulty: 150 },
  "GOAT": { mined: 84.61, difficulty: 100 },
  "RISI": { mined: 10.90, difficulty: 10 },
  "π": { mined: 0.12, difficulty: 1 },
  "RADCHAD": { mined: 2.53, difficulty: 1 },
  "P2P": { mined: 4.70, difficulty: 1 },
  "WOJAK": { mined: 31.47, difficulty: 1 },
  "Me me": { mined: 0.73, difficulty: 3 },
  "DAD": { mined: 6.90, difficulty: 1 },
  "SIR": { mined: 13.65, difficulty: 1 },
  "POW": { mined: 5.38, difficulty: 1 },
  "PEPE": { mined: 0.57, difficulty: 1 },
  "COPIUM": { mined: 48.83, difficulty: 1000 },
  "KEKW": { mined: 3.47, difficulty: 50 },
  "PILIM": { mined: 0.77, difficulty: 25 },
  "ENTITY": { mined: 5.84, difficulty: 10 },
  "BTC": { mined: 4.11, difficulty: 349 },
  "NEP": { mined: 16.60, difficulty: 40 },
  "R6": { mined: 27.66, difficulty: 6 },
  "BPM": { mined: 17.37, difficulty: 888 },
  "DEEZ": { mined: 0.25, difficulty: 10 },
  "OP_CAT": { mined: 2.35, difficulty: 7 },
  "UȻME": { mined: 0.00, difficulty: 16 },
  "TYS": { mined: 0.12, difficulty: 400 },
  "KAKL": { mined: 1.03, difficulty: 50 },
  "RZBT": { mined: 36.56, difficulty: 20 },
  "忍者": { mined: 0.07, difficulty: 226 },
  "BITQ": { mined: 0.00, difficulty: 400 },
  "PIZZA": { mined: 1.00, difficulty: 50 },
  "LAMBO": { mined: 0.05, difficulty: 25 },
  "LAURA": { mined: 0.00, difficulty: 69 },
  "BOI": { mined: 24.00, difficulty: 7 },
  "BNET": { mined: 0.94, difficulty: 150 },
  "DPR": { mined: 10.82, difficulty: 10 },
  "RXDASIC": { mined: 1.29, difficulty: 10 },
  "RANTX": { mined: 0.06, difficulty: 218 },
  "DJANGO": { mined: 8.24, difficulty: 100 },
  "RGB": { mined: 0.03, difficulty: 50 },
  "GRAVITY": { mined: 2.76, difficulty: 10 },
  "KATA": { mined: 3.02, difficulty: 85 },
  "NEOX": { mined: 0.03, difficulty: 699 }
};

export const getMiningData = (symbol: string): MiningData => {
  return MINING_DATA[symbol] || { mined: 0, difficulty: 1 };
};