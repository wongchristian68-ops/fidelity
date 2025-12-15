
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  limit,
  orderBy,
  updateDoc,
  deleteField,
} from 'firebase/firestore';
import type { Restaurant, Client, Review } from './types';

const isClient = typeof window !== 'undefined';

function getDb() {
  if (!isClient) {
    throw new Error("Firestore can only be accessed on the client.");
  }
  return getFirestore();
}

// --- Restaurants ---
export async function getRestaurants(): Promise<{ [id: string]: Restaurant }> {
  const db = getDb();
  const snapshot = await getDocs(collection(db, 'restaurants'));
  const restaurants: { [id: string]: Restaurant } = {};
  snapshot.forEach((doc) => {
    restaurants[doc.id] = doc.data() as Restaurant;
  });
  return restaurants;
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const db = getDb();
  const docRef = doc(db, 'restaurants', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Restaurant) : null;
}

export async function saveRestaurant(id: string, data: Restaurant): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'restaurants', id);
  await setDoc(docRef, data, { merge: true });
}

export async function deleteRestaurant(id: string): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);

  // Delete the restaurant document
  const restaurantRef = doc(db, 'restaurants', id);
  batch.delete(restaurantRef);

  // Remove restaurant cards from all clients
  const clientsSnapshot = await getDocs(collection(db, 'clients'));
  clientsSnapshot.forEach((clientDoc) => {
    const clientRef = doc(db, 'clients', clientDoc.id);
    batch.update(clientRef, {
      [`cards.${id}`]: deleteField(),
    });
  });

  await batch.commit();
}

export async function resetRestaurantStats(id: string): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'restaurants', id);
    await updateDoc(docRef, {
        stampsGiven: 0,
        referralsCount: 0,
        rewardsGiven: 0,
    });
}

// --- Clients ---
export async function getClients(): Promise<{ [id: string]: Client }> {
  const db = getDb();
  const snapshot = await getDocs(collection(db, 'clients'));
  const clients: { [id: string]: Client } = {};
  snapshot.forEach((doc) => {
    clients[doc.id] = doc.data() as Client;
  });
  return clients;
}

export async function getClient(id: string): Promise<Client | null> {
  const db = getDb();
  const docRef = doc(db, 'clients', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Client) : null;
}

export async function saveClient(id: string, data: Client): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'clients', id);
  await setDoc(docRef, data, { merge: true });
}

export async function deleteClient(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, 'clients', id));
}

// --- Reviews (Simulated) ---
const FAKE_REVIEWS: { [restoId: string]: Review[] } = {
  'resto_le_délicieux': [
    { id: 'rev1', author: 'John D.', rating: 5, text: "Absolutely fantastic! The food was delicious and the service was top-notch. Will definitely come back.", language: 'English', timestamp: Date.now() - 1000 * 3600 * 2, aiResponse: '' },
    { id: 'rev2', author: 'Marie L.', rating: 4, text: "Très bonne expérience, les plats sont savoureux et le cadre est agréable. Juste un peu d'attente.", language: 'French', timestamp: Date.now() - 1000 * 3600 * 8, aiResponse: '' },
    { id: 'rev3', author: 'Lí Wěi', rating: 5, text: "非常棒的餐厅！食物很美味，环境也很好。我一定会推荐给我的朋友。", language: 'Mandarin Chinese', timestamp: Date.now() - 1000 * 3600 * 24 * 2, aiResponse: '' },
  ],
  // Add more fake reviews for other restaurants if needed for testing
};

export function getRecentReviews(restoId: string): Review[] {
    const reviews = get<Review[]>('reviews') || [];
    const restoReviews = FAKE_REVIEWS[restoId] || [];
    const savedResponses = reviews.filter(r => r.id.startsWith(restoId));
    
    return restoReviews.map(rr => {
        const saved = savedResponses.find(sr => sr.id === `${restoId}_${rr.id}`);
        return saved ? {...rr, aiResponse: saved.aiResponse} : rr;
    });
}

export function saveReviewResponse(restoId: string, reviewId: string, response: string): void {
  // This is a mock save. In a real app, this would update a database.
  // We'll use localStorage to persist the response for the demo
   const reviews = get<Review[]>('reviews') || [];
   const reviewIndex = reviews.findIndex(r => r.id === `${restoId}_${reviewId}`);
    if (reviewIndex !== -1) {
        reviews[reviewIndex].aiResponse = response;
    } else {
        const originalReview = FAKE_REVIEWS[restoId]?.find(r => r.id === reviewId);
        if (originalReview) {
            reviews.push({ ...originalReview, id: `${restoId}_${reviewId}`, aiResponse: response });
        }
    }
    set('reviews', reviews);
}


// --- Generic DB Functions (localStorage for non-Firestore data) ---
function get<T>(key: string): T | null {
  if (!isClient) return null;
  return JSON.parse(localStorage.getItem(key) || 'null');
}

function set<T>(key: string, value: T): void {
  if (!isClient) return;
  localStorage.setItem(key, JSON.stringify(value));
}
