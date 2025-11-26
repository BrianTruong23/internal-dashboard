// Store management data model

export interface Store {
  id: string;
  name: string;
  userId: string;
  url?: string;
  category?: string;
  createdAt: Date;
  lastActive?: Date;
}

let stores: Store[] = [
  {
    id: "1",
    name: "Fashion Boutique",
    userId: "1",
    url: "https://fashionboutique.com",
    category: "Fashion",
    createdAt: new Date("2024-01-15"),
    lastActive: new Date("2024-11-20"),
  },
  {
    id: "2",
    name: "Tech Gadgets Store",
    userId: "1",
    url: "https://techgadgets.com",
    category: "Electronics",
    createdAt: new Date("2024-02-20"),
    lastActive: new Date("2024-11-25"),
  },
  {
    id: "3",
    name: "Organic Foods Market",
    userId: "2",
    url: "https://organicfoods.com",
    category: "Food & Beverage",
    createdAt: new Date("2024-03-10"),
    lastActive: new Date("2024-11-22"),
  },
];

// Add a mock user for demo
const mockUsers = [
  { id: "2", email: "john@example.com", name: "John Merchant" },
];

export const storeStorage = {
  getAll: () => stores,
  
  getByUserId: (userId: string) => {
    return stores.filter((store) => store.userId === userId);
  },
  
  create: (name: string, userId: string, url?: string, category?: string) => {
    const newStore: Store = {
      id: String(stores.length + 1),
      name,
      userId,
      url,
      category,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    
    stores.push(newStore);
    return newStore;
  },
  
  getStats: () => {
    const totalStores = stores.length;
    const activeStores = stores.filter(
      (store) =>
        store.lastActive &&
        new Date().getTime() - store.lastActive.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    
    // Group by creation month for trend
    const storesByMonth: Record<string, number> = {};
    stores.forEach((store) => {
      const monthKey = `${store.createdAt.getFullYear()}-${String(
        store.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      storesByMonth[monthKey] = (storesByMonth[monthKey] || 0) + 1;
    });
    
    return {
      totalStores,
      activeStores,
      storesByMonth,
    };
  },
};

export const getMockUsers = () => mockUsers;
