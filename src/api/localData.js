/**
 * localData.js - localStorage-based data service
 *
 * Provides the same CRUD interface as the Base44 SDK entities,
 * but persists data in browser localStorage.
 */

const EXPENSES_KEY = "appspese_expenses";
const GOALS_KEY = "appspese_goals";

// --- Helpers ---

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadItems(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveItems(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

// --- Sample / demo data ---

const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];

function monthAgo(n) {
  const d = new Date(today);
  d.setMonth(d.getMonth() - n);
  return d;
}

function seedExpenses() {
  return [
    {
      id: generateId(),
      description: "Affitto",
      amount: 800,
      category: "rata",
      date: fmt(today),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Netflix",
      amount: 15.99,
      category: "abbonamento",
      date: fmt(today),
      notes: "",
      is_recurring: true,
      is_paid: false,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Spesa alimentare",
      amount: 120.5,
      category: "spesa_ricorrente",
      date: fmt(today),
      notes: "Supermercato",
      is_recurring: false,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Bolletta luce",
      amount: 65.3,
      category: "bolletta",
      date: fmt(today),
      notes: "",
      is_recurring: false,
      is_paid: false,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Cena con amici",
      amount: 45,
      category: "spesa_condivisa",
      date: fmt(today),
      notes: "",
      is_recurring: false,
      is_paid: true,
      shared_with: "Marco",
    },
    {
      id: generateId(),
      description: "Affitto",
      amount: 800,
      category: "rata",
      date: fmt(monthAgo(1)),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Spesa alimentare",
      amount: 98.2,
      category: "spesa_ricorrente",
      date: fmt(monthAgo(1)),
      notes: "",
      is_recurring: false,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Bolletta gas",
      amount: 88,
      category: "bolletta",
      date: fmt(monthAgo(1)),
      notes: "",
      is_recurring: false,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Abbonamento palestra",
      amount: 40,
      category: "abbonamento",
      date: fmt(monthAgo(2)),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Affitto",
      amount: 800,
      category: "rata",
      date: fmt(monthAgo(2)),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Spesa alimentare",
      amount: 110,
      category: "spesa_ricorrente",
      date: fmt(monthAgo(2)),
      notes: "",
      is_recurring: false,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Affitto",
      amount: 800,
      category: "rata",
      date: fmt(monthAgo(3)),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Vacanza mare",
      amount: 350,
      category: "tantum",
      date: fmt(monthAgo(3)),
      notes: "Prenotazione hotel",
      is_recurring: false,
      is_paid: true,
      shared_with: "Sara",
    },
    {
      id: generateId(),
      description: "Affitto",
      amount: 800,
      category: "rata",
      date: fmt(monthAgo(4)),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Spesa alimentare",
      amount: 92,
      category: "spesa_ricorrente",
      date: fmt(monthAgo(4)),
      notes: "",
      is_recurring: false,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Affitto",
      amount: 800,
      category: "rata",
      date: fmt(monthAgo(5)),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
    {
      id: generateId(),
      description: "Conto risparmio",
      amount: 200,
      category: "conto_risparmio",
      date: fmt(monthAgo(5)),
      notes: "",
      is_recurring: true,
      is_paid: true,
      shared_with: "",
    },
  ];
}

function seedGoals() {
  const deadline1 = new Date(today);
  deadline1.setFullYear(deadline1.getFullYear() + 1);

  const deadline2 = new Date(today);
  deadline2.setMonth(deadline2.getMonth() + 8);

  return [
    {
      id: generateId(),
      title: "Fondo emergenza",
      target_amount: 5000,
      current_amount: 1800,
      deadline: fmt(deadline1),
      status: "in_corso",
      color: "#10b981",
      paid_months: [],
    },
    {
      id: generateId(),
      title: "Vacanze estive",
      target_amount: 2000,
      current_amount: 600,
      deadline: fmt(deadline2),
      status: "in_corso",
      color: "#60a5fa",
      paid_months: [],
    },
    {
      id: generateId(),
      title: "Nuovo laptop",
      target_amount: 1500,
      current_amount: 1500,
      deadline: fmt(monthAgo(-2)),
      status: "completato",
      color: "#a78bfa",
      paid_months: [],
    },
  ];
}

// --- Entity factory ---

function createEntity(storageKey, seedFn) {
  // Initialize with seed data if localStorage is empty
  if (loadItems(storageKey) === null) {
    saveItems(storageKey, seedFn());
  }

  return {
    list(sortField) {
      const items = loadItems(storageKey) || [];
      if (!sortField) return Promise.resolve([...items]);
      const desc = sortField.startsWith("-");
      const field = desc ? sortField.slice(1) : sortField;
      const sorted = [...items].sort((a, b) => {
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        if (av < bv) return desc ? 1 : -1;
        if (av > bv) return desc ? -1 : 1;
        return 0;
      });
      return Promise.resolve(sorted);
    },

    create(data) {
      const items = loadItems(storageKey) || [];
      const newItem = { ...data, id: generateId(), created_date: new Date().toISOString() };
      items.push(newItem);
      saveItems(storageKey, items);
      return Promise.resolve(newItem);
    },

    bulkCreate(dataArray) {
      const items = loadItems(storageKey) || [];
      const created = dataArray.map((data) => ({
        ...data,
        id: generateId(),
        created_date: new Date().toISOString(),
      }));
      saveItems(storageKey, [...items, ...created]);
      return Promise.resolve(created);
    },

    update(id, data) {
      const items = loadItems(storageKey) || [];
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return Promise.reject(new Error("Item not found"));
      items[idx] = { ...items[idx], ...data };
      saveItems(storageKey, items);
      return Promise.resolve(items[idx]);
    },

    delete(id) {
      const items = loadItems(storageKey) || [];
      const filtered = items.filter((i) => i.id !== id);
      saveItems(storageKey, filtered);
      return Promise.resolve({ id });
    },

    deleteAll() {
      saveItems(storageKey, []);
      return Promise.resolve();
    },
  };
}

export const localExpenses = createEntity(EXPENSES_KEY, seedExpenses);
export const localGoals = createEntity(GOALS_KEY, seedGoals);

export function clearAllData() {
  localStorage.removeItem(EXPENSES_KEY);
  localStorage.removeItem(GOALS_KEY);
}
