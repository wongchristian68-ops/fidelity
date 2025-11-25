import type { Restaurant, Client, Review } from './types';

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
    restaurant.rewardsGiven = 0;
    saveRestaurant(id, restaurant);
  }
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
  return FAKE_REVIEWS[restoId] || [];
}

export function saveReviewResponse(restoId: string, reviewId: string, response: string): void {
  // This is a mock save. In a real app, this would update a database.
  if (FAKE_REVIEWS[restoId]) {
    const reviewIndex = FAKE_REVIEWS[restoId].findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
      FAKE_REVIEWS[restoId][reviewIndex].aiResponse = response;
      console.log(`Saved response for review ${reviewId}`);
    }
  }
}
