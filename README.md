# MPfinTraker – App Spese Personali

Applicazione per la gestione delle spese personali e degli obiettivi finanziari. Sincronizzazione cloud tramite **Firebase Firestore**, autenticazione sicura con **Firebase Auth**, installabile come **PWA** su smartphone e con **notifiche push** per le scadenze degli obiettivi.

## Tecnologie

- **React 18** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Firebase** (Auth + Firestore) per autenticazione e sincronizzazione cloud
- **Recharts** per i grafici
- **React Query** per la gestione dello stato server
- **React Router** per la navigazione
- **Framer Motion** per le animazioni
- **PWA** – installabile su smartphone con Service Worker

## Avvio locale

### Prerequisiti

- Node.js >= 18
- npm >= 9
- Un progetto Firebase con Auth e Firestore abilitati (vedi sezione Firebase Setup)

### Installazione e avvio

```bash
# 1. Installa le dipendenze
npm install

# 2. Avvia il server di sviluppo
npm run dev
```

L'app sarà disponibile all'indirizzo **http://localhost:5173**

### Build di produzione

```bash
npm run build
npm run preview
```

## Funzionalità

- **Autenticazione** – Login/registrazione con email e password o Google
- **Dashboard** – Panoramica delle finanze del mese, grafici degli ultimi 6 mesi, riepilogo per categoria e obiettivi attivi
- **Uscite** – Gestione completa delle spese: aggiunta, modifica, eliminazione, filtro per mese/categoria, esportazione CSV
- **Obiettivi** – Obiettivi di risparmio con progresso, quota mensile e scadenza
- **Report** – Analisi andamento, confronto mensile e dettaglio per categoria (ultimi 12 mesi)
- **Impostazioni** – Logout e reset completo dei dati
- **Notifiche** – Avvisi per le scadenze degli obiettivi (3 giorni prima, 1 giorno prima, il giorno stesso)

## Installazione come PWA su smartphone

1. Apri l'app nel browser del tuo smartphone (Chrome su Android, Safari su iOS)
2. **Android (Chrome):** Tocca i tre puntini in alto a destra → "Aggiungi alla schermata Home"
3. **iOS (Safari):** Tocca l'icona di condivisione → "Aggiungi alla schermata Home"
4. L'app si installerà e funzionerà come una vera app nativa, anche offline

## Firebase Setup

Se vuoi usare il tuo progetto Firebase:

1. Vai su [Firebase Console](https://console.firebase.google.com/) e crea un nuovo progetto
2. Abilita **Authentication** → Sign-in method → Email/Password e Google
3. Abilita **Firestore Database** → crea database in modalità produzione
4. Aggiungi le seguenti regole di sicurezza in Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Vai su **Impostazioni progetto** → Aggiungi app web → copia la configurazione
6. Aggiorna `src/api/firebase.js` con le tue credenziali

## Struttura dei dati Firestore

I dati di ogni utente sono isolati sotto il suo UID:

```
users/
  {userId}/
    expenses/
      {expenseId}: { description, amount, category, date, is_paid, ... }
    goals/
      {goalId}: { title, target_amount, current_amount, deadline, status, ... }
```
