export interface Restaurant {
  id: string;
  name: string;
  loyaltyReward: string; // Récompense pour 10 tampons
  referralBonusStamps: number; // Tampons bonus pour le parrain
  googleLink: string;
  stampsGiven: number;
  referralsCount: number;
  pin: string;
  pinEditable: boolean;
  qrCodeValue: string | null;
  qrCodeExpiry: number | null; // Timestamp
}

export interface ClientCard {
  stamps: number;
  referralCode: string;
}

export interface Client {
  id:string;
  name: string;
  phone: string;
  cards: { [restoId: string]: ClientCard };
  referrer: {
    restoId: string;
    code: string;
  } | null;
}

export type UserRole = 'resto' | 'client';

export interface Session {
    id: string;
    role: UserRole;
    name: string;
}

// The data structure for the QR code
export interface StampQrCode {
  type: 'stamp';
  restoId: string;
  value: string;
}
