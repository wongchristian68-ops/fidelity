import type { Restaurant, Client } from './types';

const isClient = typeof window !== 'undefined';

// --- Generic DB Functions ---
function get<T>(key: string): T | null {
  if (!isClient) return null;
  return JSON.parse(localStorage.getItem(key) || 'null');
}

function set<T>(key: string, value: T): void {
  if (!isClient) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Restaurants ---
export function getRestaurants(): { [id: string]: Restaurant } {
  return get<{ [id: string]: Restaurant }>('restaurants') || {};
}

export function getRestaurant(id: string): Restaurant | null {
  const restaurants = getRestaurants();
  return restaurants[id] || null;
}

export function saveRestaurant(id: string, data: Restaurant): void {
  const restaurants = getRestaurants();
  restaurants[id] = data;
  set('restaurants', restaurants);
}

// --- Clients ---
export function getClients(): { [id: string]: Client } {
  return get<{ [id: string]: Client }>('clients') || {};
}

export function getClient(id: string): Client | null {
  const clients = getClients();
  return clients[id] || null;
}

export function saveClient(id: string, data: Client): void {
  const clients = getClients();
  clients[id] = data;
  set('clients', clients);
}
