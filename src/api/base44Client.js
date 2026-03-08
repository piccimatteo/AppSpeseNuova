import { auth } from './firebase.js';
import { signOut } from 'firebase/auth';
import { firestoreExpenses, firestoreGoals } from './firebaseData.js';

// Helper to get current user ID
function getCurrentUserId() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.uid;
}

// Wrap a Firestore entity so callers don't need to pass userId explicitly
function wrapEntity(entity) {
  return {
    list(sortField) {
      const uid = getCurrentUserId();
      return entity.list(sortField, uid);
    },
    create(data) {
      const uid = getCurrentUserId();
      return entity.create(data, uid);
    },
    bulkCreate(dataArray) {
      const uid = getCurrentUserId();
      return entity.bulkCreate(dataArray, uid);
    },
    update(id, data) {
      const uid = getCurrentUserId();
      return entity.update(id, data, uid);
    },
    delete(id) {
      const uid = getCurrentUserId();
      return entity.delete(id, uid);
    },
    deleteAll() {
      const uid = getCurrentUserId();
      return entity.deleteAll(uid);
    },
  };
}

export const base44 = {
  entities: {
    Expense: wrapEntity(firestoreExpenses),
    Goal: wrapEntity(firestoreGoals),
  },
  auth: {
    async logout() {
      await signOut(auth);
    },
    async deleteAccount() {
      const uid = getCurrentUserId();
      await firestoreExpenses.deleteAll(uid);
      await firestoreGoals.deleteAll(uid);
      await signOut(auth);
    },
    async me() {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      return { id: user.uid, email: user.email, name: user.displayName || user.email };
    },
    isLoggedIn() {
      return !!auth.currentUser;
    },
    getUser() {
      const user = auth.currentUser;
      if (!user) return null;
      return { id: user.uid, email: user.email, name: user.displayName || user.email };
    },
  },
};
