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

export function deleteRestaurant(id: string): void {
  const restaurants = getRestaurants();
  delete restaurants[id];
  set('restaurants', restaurants);

  // Also remove restaurant cards from all clients
  const clients = getClients();
  Object.keys(clients).forEach(clientId => {
    if (clients[clientId].cards[id]) {
      delete clients[clientId].cards[id];
    }
  });
  set('clients', clients);
}

export function resetRestaurantStats(id: string): void {
  const restaurant = getRestaurant(id);
  if (restaurant) {
    restaurant.stampsGiven = 0;
    restaurant.referralsCount = 0;
    saveRestaurant(id, restaurant);
  }

  // Also remove restaurant cards from all clients
  const clients = getClients();
  Object.keys(clients).forEach(clientId => {
    const client = clients[clientId];
    if (client.cards[id]) {
      delete client.cards[id];
    }
    // Also remove pending rewards related to this restaurant
    if (client.pendingReferralRewards) {
      client.pendingReferralRewards = client.pendingReferralRewards.filter(
        reward => reward.restoId !== id
      );
    }
    saveClient(clientId, client);
  });
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

export function deleteClient(id: string): void {
  const clients = getClients();
  delete clients[id];
  set('clients', clients);
}
