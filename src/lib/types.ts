export interface Restaurant {
  id: string;
  name: string;
  reward: string;
  googleLink: string;
  stampsGiven: number;
  referralsCount: number;
}

export interface Client {
  id:string;
  name: string;
  cards: { [restoId: string]: number };
  referralCode: string;
  referrer: string | null;
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
}
