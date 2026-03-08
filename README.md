# MPfinTraker – App Spese Personali

Applicazione standalone per la gestione delle spese personali e degli obiettivi finanziari. Funziona completamente nel browser, senza alcuna dipendenza da servizi esterni: tutti i dati sono salvati nel **localStorage** del browser.

## Tecnologie

- **React 18** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Recharts** per i grafici
- **React Query** per la gestione dello stato server
- **React Router** per la navigazione
- **Framer Motion** per le animazioni

## Avvio locale

### Prerequisiti

- Node.js >= 18
- npm >= 9

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

- **Dashboard** – Panoramica delle finanze del mese, grafici degli ultimi 6 mesi, riepilogo per categoria e obiettivi attivi
- **Uscite** – Gestione completa delle spese: aggiunta, modifica, eliminazione, filtro per mese/categoria, esportazione CSV
- **Obiettivi** – Obiettivi di risparmio con progresso, quota mensile e scadenza
- **Report** – Analisi andamento, confronto mensile e dettaglio per categoria (ultimi 12 mesi)
- **Impostazioni** – Reset completo dei dati

## Dati demo

Al primo avvio l'app carica automaticamente dei **dati di esempio** (spese degli ultimi 6 mesi e 3 obiettivi di risparmio) così puoi esplorare subito tutte le funzionalità.

## Persistenza dei dati

I dati sono salvati nelle seguenti chiavi localStorage:

| Chiave | Contenuto |
|--------|-----------|
| `appspese_expenses` | Lista delle spese |
| `appspese_goals` | Lista degli obiettivi |
| `appspese_session` | Sessione utente locale |

> ⚠️ I dati sono specifici del browser e del dominio. Il backup manuale tramite esportazione CSV è consigliato per preservare le spese.
