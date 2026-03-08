/**
 * firebaseData.js - Firestore-based data service
 *
 * Provides the same CRUD interface as localData.js,
 * but persists data in Cloud Firestore under users/{userId}/collection.
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase.js';

// --- Entity factory ---

function createFirestoreEntity(collectionName) {
  function getColRef(userId) {
    return collection(db, 'users', userId, collectionName);
  }

  return {
    async list(sortField, userId) {
      if (!userId) return [];
      const colRef = getColRef(userId);
      let q;
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = desc ? sortField.slice(1) : sortField;
        try {
          q = query(colRef, orderBy(field, desc ? 'desc' : 'asc'));
        } catch {
          q = query(colRef);
        }
      } else {
        q = query(colRef);
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async create(data, userId) {
      if (!userId) throw new Error('Not authenticated');
      const colRef = getColRef(userId);
      const docRef = await addDoc(colRef, {
        ...data,
        created_date: new Date().toISOString(),
      });
      return { id: docRef.id, ...data, created_date: new Date().toISOString() };
    },

    async bulkCreate(dataArray, userId) {
      if (!userId) throw new Error('Not authenticated');
      const colRef = getColRef(userId);
      const batch = writeBatch(db);
      const created = [];
      for (const data of dataArray) {
        const docRef = doc(colRef);
        const item = { ...data, created_date: new Date().toISOString() };
        batch.set(docRef, item);
        created.push({ id: docRef.id, ...item });
      }
      await batch.commit();
      return created;
    },

    async update(id, data, userId) {
      if (!userId) throw new Error('Not authenticated');
      const docRef = doc(db, 'users', userId, collectionName, id);
      await updateDoc(docRef, data);
      return { id, ...data };
    },

    async delete(id, userId) {
      if (!userId) throw new Error('Not authenticated');
      const docRef = doc(db, 'users', userId, collectionName, id);
      await deleteDoc(docRef);
      return { id };
    },

    async deleteAll(userId) {
      if (!userId) throw new Error('Not authenticated');
      const colRef = getColRef(userId);
      const snapshot = await getDocs(colRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    },
  };
}

export const firestoreExpenses = createFirestoreEntity('expenses');
export const firestoreGoals = createFirestoreEntity('goals');
