# Patrimonio - Family Wealth & Cash Flow Management Platform

Una piattaforma web moderna, reattiva e completa per il monitoraggio, l'analisi e la gestione del patrimonio personale e familiare, degli investimenti, del mercato immobiliare con contratti di locazione, dei redditi da lavoro e del cash flow mensile/annuale.

---

## ✨ Funzionalità Principali

### 1. 🏛️ Overview & Patrimonio Consolidato
- **Dashboard Esecutiva**: Vista d'insieme del patrimonio lordo e netto dopo le imposte, saldo di liquidità e stima entrate/uscite ricorrenti.
- **Filtro Famiglia & Soggetti**: Switch istantaneo tra la vista consolidata dell'intero nucleo familiare e i singoli profili personali o holding familiari.
- **Grafico di Allocazione & Trend**: Evoluzione del patrimonio netto nel tempo e breakdown per classe di attivo (Azioni, Obbligazioni, Immobili, Liquidità, Private Equity, Oro/Beni).
- **Prossime Entrate & Alert**: Monitoraggio automatico di cedole, dividendi, canoni di affitto e scadenze dei depositi.

### 2. 📈 Investimenti & Gestione Liquidità
- **Portafoglio Titoli**: Monitoraggio di Azioni, ETF, Obbligazioni (con cedole fisse o variabili), Criptovalute e Beni da Collezione.
- **Liquidità & Conti Correnti**:
  - Inserimento di **Conti Correnti ordinari** (con **0% di ritenuta fiscale**).
  - Gestione di **Conti Deposito Liberi e Vincolati** (con calcolo interessi e ritenuta al 26%).
  - Monitoraggio di **BOT e Strumenti Monetari** (con ritenuta agevolata al 12,5%).
- **Calcolo Rendimento Lordo e Netto**: Visualizzazione in tempo reale degli interessi annui maturati.

### 3. 🏢 Immobili & Contratti di Locazione
- **Gestione Fabbricati & Immobili**: Tracciamento del valore stimato, rivalutazione, costi di acquisto, rendita catastale e spese ricorrenti (condominio, IMU, assicurazioni).
- **Contratti di Affitto**: Gestione canoni, giorni di incasso, deposito cauzionale e regime fiscale (Cedolare Secca o Ordinario).
- **Switch Visione Mensile / Annuale**: Possibilità di alternare il calcolo di canoni, spese e resa netta su base mensile (`€/mese`) o annuale (`€/anno`).

### 4. 💼 Sezione Reddito
- **Tracciamento Entrate da Lavoro**: Gestione di stipendi, pensioni, compensi professionali e fatturato da consulenza.
- **Modalità Netto / Lordo**:
  - Inserimento diretto dell'**Importo Netto Percepito** con **0% di aliquota fiscale applicata**.
  - Inserimento dell'**Importo Lordo** con selezione delle mensilità (12, 13 o 14 mensilità) e stima delle ritenute IRPEF.

### 5. 💧 Cash Flow
- **Evoluzione Mensile dei Flussi**: Grafico interattivo delle entrate, delle uscite e del saldo netto mese per mese.
- **Indicatori Sintetici**: Totale Entrate, Totale Uscite, Saldo Netto e Media Mensile.
- **Switch Lordo / Netto**: Analisi dei flussi al lordo o al netto della fiscalità applicata.

### 6. 📅 Calendario Finanziario
- **Timeline di Liquidità**: Mappa temporale di tutti i flussi in entrata e uscita previsti (cedole, dividendi, affitti, scadenze dei vincoli, stipendi).
- **Conferma Incassi**: Possibilità di contrassegnare come incassati i pagamenti previsti.

### 7. ⚖️ Report Fiscale
- **Riepilogo Imposte**: Dettaglio delle imposte dovute o versate su rendite finanziarie, cedolari secche, interessi bancari e redditi.
- **Pianificazione Fiscale**: Prospetto annuale per la dichiarazione dei redditi.

---

## 🛠️ Stack Tecnologico

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Stile & Design**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animazioni**: [Motion](https://motion.dev/)
- **Grafici**: [Recharts](https://recharts.org/)
- **Icone**: [Lucide React](https://lucide.dev/)

---

## 🚀 Guida all'Avvio Locale

### Prerequisiti
- [Node.js](https://nodejs.org/) (versione 18 o superiore consigliata)
- `npm`, `yarn` o `pnpm`

### 1. Clonare il repository
```bash
git clone https://github.com/tuo-username/patrimonio-family-wealth.git
cd patrimonio-family-wealth
```

### 2. Installare le dipendenze
```bash
npm install
```

### 3. Avviare il server di sviluppo
```bash
npm run dev
```
L'applicazione sarà accessibile all'indirizzo `http://localhost:3000` (o sulla porta indicata nel terminale).

### 4. Compilazione per la produzione
```bash
npm run build
```
I file compilati e ottimizzati per la produzione verranno generati nella cartella `dist/`.

---

## 📂 Struttura del Progetto

```
├── public/                 # File statici e favicon
├── src/
│   ├── components/
│   │   ├── accounts/       # Gestione conti e liquidità
│   │   ├── alternatives/   # Private equity e beni rifugio
│   │   ├── calendar/       # Calendario finanziario e scadenze
│   │   ├── cashflow/       # Analisi cash flow mensile/annuale
│   │   ├── companies/      # Partecipazioni aziendali
│   │   ├── dashboard/      # Panoramica e statistiche patrimonio
│   │   ├── income/         # Gestione stipendi e redditi da lavoro
│   │   ├── investments/    # Portafoglio investimenti e liquidità
│   │   ├── layout/         # Header, navigazione e selettore profilo
│   │   ├── modals/         # Modali di inserimento e modifica
│   │   ├── realestate/     # Immobili e contratti di locazione
│   │   └── taxes/          # Report e calcolo imposte
│   ├── context/            # WealthContext e stato globale
│   ├── data/               # Dati iniziali e preset dimostrativi
│   ├── types/              # Definizioni TypeScript
│   ├── utils/              # Funzioni di calcolo, valuta e formattazione
│   ├── App.tsx             # Componente principale
│   ├── main.tsx            # Entry point React
│   └── index.css           # Configurazione Tailwind CSS
├── index.html              # HTML entry point con meta tag
├── metadata.json           # Metadati dell'applicazione
├── package.json            # Dipendenze e script
├── tsconfig.json           # Configurazione TypeScript
└── vite.config.ts          # Configurazione Vite
```

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT.
