export interface Restaurant {
  id: string;
  name: string;
  loyaltyReward: string; // Récompense pour X tampons
  stampsRequiredForReward: number; // Nombre de tampons pour la récompense
  referralReward: string; // Récompense pour le parrain
  googleLink: string;
  stampsGiven: number;
  referralsCount: number;
  pin: string;
  pinEditable: boolean;
  qrCodeValue: string | null;
  qrCodeExpiry: number | null; // Timestamp
  cardImageUrl?: string;
}

export interface ClientCard {
  stamps: number;
  referralCode: string;
}

export interface PendingReferralReward {
  id: string; // unique id for the reward
  restoId: string;
  reward: string;
}

export interface Client {
  id:string;
  name: string;
  phone: string;
  cards: { [restoId: string]: ClientCard };
  referrer: {
    restoId: string;
    code: string;
    reward: string; // La récompense à donner au parrain
  } | null;
  pendingReferralRewards?: PendingReferralReward[];
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
