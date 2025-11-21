export interface Restaurant {
  id: string;
  name: string;
  reward: string;
  googleLink: string;
  stampsGiven: number;
  referralsCount: number;
  pin: string;
  pinEditable: boolean;
}

export interface Client {
  id:string;
  name: string;
  phone: string;
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
