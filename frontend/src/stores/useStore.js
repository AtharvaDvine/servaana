import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      token: null,
      restaurant: null,
      isAuthenticated: false,

      // App state
      activeOrders: [],
      currentOrder: null,
      showMenuPopup: false,
      showBillPopup: false,
      selectedTable: null,

      // Actions
      login: (token, restaurant) => set({
        token,
        restaurant,
        isAuthenticated: true
      }),

      logout: () => set({
        token: null,
        restaurant: null,
        isAuthenticated: false,
        activeOrders: [],
        currentOrder: null
      }),

      setRestaurant: (restaurant) => set({ restaurant }),

      setActiveOrders: (orders) => set({ activeOrders: orders }),

      addOrder: (order) => set((state) => ({
        activeOrders: [...state.activeOrders, order]
      })),

      completeOrder: (orderId) => set((state) => ({
        activeOrders: state.activeOrders.filter(order => order._id !== orderId)
      })),

      openMenuPopup: (table) => set({
        selectedTable: table,
        showMenuPopup: true,
        currentOrder: { items: [], total: 0 }
      }),

      closeMenuPopup: () => set({
        showMenuPopup: false,
        selectedTable: null,
        currentOrder: null
      }),

      openBillPopup: (table) => set({
        selectedTable: table,
        showBillPopup: true
      }),

      closeBillPopup: () => set({
        showBillPopup: false,
        selectedTable: null
      }),

      updateCurrentOrder: (items, total) => set({
        currentOrder: { items, total }
      })
    }),
    {
      name: 'restaurant-pos-storage',
      partialize: (state) => ({
        token: state.token,
        restaurant: state.restaurant,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useStore;