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
  referrerInfo?: { // Information sur qui a parrainé ce client pour CETTE carte
    code: string;
    reward: string;
    isActivated: boolean; // Pour savoir si la récompense parrain a été donnée
  } | null;
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
  // L'ancien `referrer` est maintenant dans ClientCard.
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
