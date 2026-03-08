import { localExpenses, localGoals, clearAllData } from './localData.js';

// Local auth helpers
const SESSION_KEY = "appspese_session";

export const base44 = {
  entities: {
    Expense: localExpenses,
    Goal: localGoals,
  },
  auth: {
    logout() {
      localStorage.removeItem(SESSION_KEY);
      window.location.reload();
    },
    async deleteAccount() {
      clearAllData();
      localStorage.removeItem(SESSION_KEY);
      window.location.reload();
    },
    async me() {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) throw new Error("Not authenticated");
      return JSON.parse(raw);
    },
    login(username) {
      const user = { id: "local-user", username, name: username };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    },
    isLoggedIn() {
      return !!localStorage.getItem(SESSION_KEY);
    },
    getUser() {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    },
  },
};
