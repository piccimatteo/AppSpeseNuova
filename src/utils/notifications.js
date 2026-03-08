/**
 * notifications.js - Web Notifications API helpers
 *
 * Handles permission requests and goal deadline notifications.
 */

import { base44 } from '@/api/base44Client';

/**
 * Request browser notification permission from the user.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

/**
 * Show a browser notification.
 */
function showNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
    });
  } catch {
    // Silently fail if notifications are unavailable
  }
}

/**
 * Check goal deadlines and trigger notifications for approaching deadlines.
 * - On the day of the deadline
 * - 1 day before
 * - 3 days before
 */
export async function checkGoalDeadlines() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!base44.auth.isLoggedIn()) return;

  let goals;
  try {
    goals = await base44.entities.Goal.list();
  } catch {
    return;
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  for (const goal of goals) {
    if (goal.status === 'completato' || !goal.deadline) continue;

    const deadline = new Date(goal.deadline);
    const diffMs = deadline - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const notifKey = `notif_${goal.id}_${todayStr}`;
    if (sessionStorage.getItem(notifKey)) continue;

    let message = null;
    if (diffDays < 0) {
      message = `La scadenza per "${goal.title}" è già passata!`;
    } else if (diffDays === 0) {
      message = `Oggi è la scadenza per il tuo obiettivo "${goal.title}"!`;
    } else if (diffDays === 1) {
      message = `Domani scade l'obiettivo "${goal.title}". Sei pronto?`;
    } else if (diffDays === 3) {
      message = `L'obiettivo "${goal.title}" scade tra 3 giorni.`;
    }

    if (message) {
      showNotification('MPfinTraker — Obiettivo in scadenza', message);
      sessionStorage.setItem(notifKey, '1');
    }
  }
}
