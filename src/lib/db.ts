
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
  where,
} from 'firebase/firestore';
import type { Restaurant, Client, RestaurantUpdate } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const restaurantsRef = collection(db, 'restaurants');
  try {
    const snapshot = await getDocs(restaurantsRef);
    const restaurants: { [id: string]: Restaurant } = {};
    snapshot.forEach((doc) => {
      restaurants[doc.id] = doc.data() as Restaurant;
    });
    return restaurants;
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: restaurantsRef.path,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const db = getDb();
  const docRef = doc(db, 'restaurants', id);
  try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Restaurant) : null;
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function saveRestaurant(id: string, data: Restaurant): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'restaurants', id);
  await setDoc(docRef, data, { merge: true }).catch((error) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'write',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}

export async function updateRestaurant(id: string, data: RestaurantUpdate): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'restaurants', id);
  await updateDoc(docRef, data).catch((error) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}


export async function deleteRestaurant(id: string): Promise<void> {
  const db = getDb();
  const restaurantRef = doc(db, 'restaurants', id);
  
  await deleteDoc(restaurantRef).catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: restaurantRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
  });
}

export async function resetRestaurantStats(id: string): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'restaurants', id);
    const data = {
        stampsGiven: 0,
        referralsCount: 0,
        rewardsGiven: 0,
    };
    await updateDoc(docRef, data).catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    });
}

// --- Clients ---
export async function getClients(): Promise<{ [id: string]: Client }> {
  const db = getDb();
  const clientsRef = collection(db, 'clients');
  try {
    const snapshot = await getDocs(clientsRef);
    const clients: { [id: string]: Client } = {};
    snapshot.forEach((doc) => {
      clients[doc.id] = doc.data() as Client;
    });
    return clients;
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: clientsRef.path,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function getClientsWithReferralCode(code: string, restoId: string): Promise<Client[]> {
  const db = getDb();
  const clientsRef = collection(db, 'clients');
  const q = query(clientsRef, where(`cards.${restoId}.referralCode`, "==", code));

  try {
    const snapshot = await getDocs(q);
    const clients: Client[] = [];
    snapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() } as Client);
    });
    return clients;
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: clientsRef.path,
      operation: 'list', // list is correct for queries
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function getClient(id: string): Promise<Client | null> {
  const db = getDb();
  const docRef = doc(db, 'clients', id);
  try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Client) : null;
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function saveClient(id: string, data: Client): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'clients', id);
  await setDoc(docRef, data, { merge: true }).catch((error) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'write',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}

export async function deleteClient(id: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'clients', id);
  await deleteDoc(docRef).catch((error) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}
