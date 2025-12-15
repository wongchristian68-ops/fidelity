export interface Restaurant {
  id: string;
  name: string;
  email: string;
  loyaltyReward: string; // Récompense pour X tampons
  stampsRequiredForReward: number; // Nombre de tampons pour la récompense
  referralReward: string; // Récompense pour le parrain
  googleLink: string;
  stampsGiven: number;
  rewardsGiven: number; // Ajout du compteur de récompenses données
  referralsCount: number;
  qrCodeValue: string | null;
  qrCodeExpiry: number | null; // Timestamp
  cardImageUrl?: string;
}

export type RestaurantUpdate = Partial<Omit<Restaurant, 'id' | 'email'>>;


export interface ClientCard {
  stamps: number;
  referralCode: string;
  scannedCodes?: string[]; // Ajout pour suivre les QR codes scannés
  referrerInfo?: { // Information sur qui a parrainé ce client pour CETTE carte
    code: string;
    reward: string;
    isActivated: boolean; // Flag to check if the referrer has been rewarded
    referrerId: string;
    referrerName: string;
  } | null;
}

export interface PendingReferralReward {
  id: string; // unique id for the reward
  restoId: string;
  reward: string;
  referredClientName: string; // Nom du client qui a été parrainé
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

export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5
  text: string;
  language: string;
  timestamp: number;
  aiResponse?: string;
}
