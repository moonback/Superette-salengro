# ⚡ NeuroStock — Inventaire PWA nouvelle génération
<img src="public/header.png" alt="NeuroStock" />

[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Live%20API-yellow)](https://ai.google.dev/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848f)](https://www.electronjs.org/)

Application **mobile-first & desktop** de gestion d'inventaire pour points de vente.  
Pensée pour le scan code-barres, la synchronisation temps réel et le pilotage vocal via un assistant IA intégré.

---

## 🎉 Nouveautés — Juillet 2026

### � Historique des mouvements de stock

Chaque produit dispose maintenant d'un **journal complet de ses mouvements** :

- Accès depuis la fiche produit → section **"Historique des mouvements"**
- Affiche les 20 derniers mouvements : delta coloré (+/-), stock résultant, source et horodatage
- **Traçabilité par source** : Caisse (POS), Scanner, Manuel, Assistant IA, Import
- Logging automatique à chaque opération (scan, POS, assistant, ajustement manuel)
- Stocké dans Supabase (`stock_movements`) — requiert l'exécution de [`stock-mouvement.sql`](stock-mouvement.sql)

---

## 🚀 Pourquoi NeuroStock ?

- ⚡ **Scan en 1 geste** — compatibilité douchettes USB/Bluetooth + caméra
- 🎙️ **Assistant vocal "Lina"** — reconnaissance vocale et réponse audio temps réel avec Gemini Live
- 🧠 **Recherche sémantique** — vectorisation des produits via embeddings OpenRouter
- 📴 **Mode hors-ligne robuste** — stockage local + file d'attente de synchronisation
- 📊 **Dashboard analytics** — filtres dynamiques, alertes stock bas, tri intelligent
- 📋 **Historique des mouvements** — traçabilité complète par produit
- 🧾 **Exports** — CSV et PDF prêts pour la comptabilité

---

## ✨ Fonctionnalités

### 📱 Interface mobile-first & desktop
- Design tactile avec tap targets optimisés, retours haptiques et glassmorphism
- Navigation basse fixe (mobile) + sidebar rétractable (desktop ≥ 1024px)
- 5 onglets : **Scanner**, **Stock**, **Catégories**, **Caisse**, **Analyse**

### 🔍 Scans intelligents
- **Scans matériels** : capture globale du clavier (douchette USB/BT) sans focus requis
- **Scan caméra** : défilement continu sans confirmation manuelle
- **Routage après scan** : un produit existant ouvre directement le modal d'ajustement
- Affichage des derniers scans en grille avec contrôles ±1 directs

### 📦 Gestion d'inventaire avancée
- Création manuelle, modal quantité, fiche produit détaillée
- Prix d'achat et de vente par référence, calcul de marge automatique
- Auto-catégorisation via OpenFoodFacts + règles locales
- Filtres par catégorie, état du stock (rupture / faible / en stock), tri multi-critères
- Pagination adaptative (20 articles mobile / 36 desktop)

### 🧾 Caisse / Opérations (POS)
- Mode **Retrait** (vente) / **Ajout** (livraison) avec raccourcis clavier `+` / `-`
- Multiplicateur de quantité (ex : `12*` avant scan = ×12)
- **Journal de session fusionné** : une ligne par produit, delta cumulé, remontée automatique
- Bilan financier temps réel : CA ventes + valeur achats
- Annulation individuelle (Undo) et clôture de session

### 📋 Historique des mouvements par produit
- **20 derniers mouvements** dans la fiche produit (section "Historique des mouvements")
- Chaque ligne : icône entrée/sortie, delta coloré, stock résultant, badge source, date/heure
- Sources tracées : `pos` · `scan` · `manual` · `assistant` · `import`
- Chargement asynchrone non-bloquant avec état de chargement
- Fallback propre si la table n'existe pas encore

### 🎙️ Assistant vocal Gemini "Lina"
- Audio temps réel (PCM 16 kHz, duplex) via Gemini Live
- Bouton flottant + drawer avec contrôles : ouvrir / réduire / couper micro / arrêter
- **18 tools disponibles** : recherche produit, MAJ stock, CRUD catégories, export CSV, recherche sémantique, dashboard, liste ruptures/stock faible, modification de prix en batch, inventaire par catégorie…
- Confirmation explicite pour les actions sensibles
- Annonce vocale automatique lors des scans

### 🧠 Recherche sémantique
- Génération d'embeddings stockés en IndexedDB pour chaque produit
- Recherche par similarité vectorielle via OpenRouter
- Fallback automatique sans clé API (hash local)

### ☁️ Synchronisation & résilience
- **Supabase** : appels REST sécurisés, RLS activé sur toutes les tables
- **Offline-first** : IndexedDB + file d'opérations différées avec flush automatique au retour en ligne
- **Realtime** : souscription live, résolution de conflits `lastUpdated` (last-write-wins)

---

## 🛠️ Stack technique

| Couche | Outils |
|---|---|
| Frontend | React 19, TypeScript 5.8, Vite 6 |
| UI | Tailwind CSS v4, Lucide React, Motion (Framer) |
| Desktop | Electron |
| Backend | Supabase (PostgreSQL + Storage + Realtime) |
| IA | Google Gemini Live (assistant vocal), OpenRouter (embeddings) |
| Données externes | OpenFoodFacts API v2 |
| Hors-ligne | IndexedDB, localStorage |
| Build | Vite, esbuild |
| Distribution | PWA (manifest.json) + Electron installer |

---

## ⚙️ Installation & configuration

### 1. Base de données Supabase

Exécutez dans l'éditeur SQL Supabase dans cet ordre :

```bash
# 1. Schéma principal (inventory_items, categories, bucket product-photos)
supabase-schema.sql

# 2. Table des mouvements de stock
stock-mouvement.sql
```

Le fichier `stock-mouvement.sql` crée la table `stock_movements` et configure le RLS :

```sql
create table stock_movements (
  id             uuid primary key default gen_random_uuid(),
  barcode        text not null,
  delta          integer not null,
  quantity_after integer not null,
  source         text,           -- 'pos' | 'scan' | 'manual' | 'assistant' | 'import'
  note           text,
  created_at     bigint not null  -- timestamp ms
);
-- Index + politique RLS pour les utilisateurs authentifiés
```

### 2. Variables d'environnement

Créez `.env` à la racine :

```env
# Supabase (obligatoires)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-api-anonyme

# Gemini (obligatoire pour l'assistant vocal)
VITE_GEMINI_API_KEY=votre-cle-api-gemini
VITE_GEMINI_LIVE_MODEL=gemini-2.0-flash-exp

# OpenRouter (optionnel — améliore la recherche sémantique)
VITE_OPENROUTER_API_KEY=votre-cle-openrouter
VITE_OPENROUTER_EMBED_MODEL=openai/text-embedding-3-large
VITE_OPENROUTER_EMBED_DIMENSIONS=3072
```

### 3. Lancer en développement

```bash
npm install
npm run dev        # Vite — http://localhost:3000
npm run electron   # Mode desktop Electron (si configuré)
```

---

## 📦 Scripts utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build optimisé production |
| `npm run preview` | Prévisualiser le build |
| `tsc --noEmit` | Vérification TypeScript |

---

## 🧠 Guide rapide — Assistant vocal "Lina"

```
# Stock
"Mets le stock du Coca à 24"
"Retire 3 bouteilles de Fanta"
"Ajoute 50 unités de sucre"

# Prix (batch)
"Mets le Coca à 1.80, le Fanta à 1.60 et le Sprite à 1.70"

# Inventaire
"Fais l'inventaire des boissons"
"Quels produits sont en rupture ?"
"Liste les snacks avec moins de 5 unités"

# Navigation
"Va sur le dashboard"
"Ouvre la fiche du Coca"
```

---

## 📁 Structure du projet

```
src/
├── App.tsx                        # Root state, orchestration, sync
├── types.ts                       # InventoryItem, StockMovement, CategoryItem…
├── components/
│   ├── app/
│   │   ├── AppNavigation.tsx      # Nav mobile + sidebar desktop
│   │   ├── ScanTab.tsx            # Scan caméra + derniers scans
│   │   ├── StockTab.tsx           # Inventaire + filtres + pagination
│   │   ├── POSTab.tsx             # Caisse, journal fusionné, bilan session
│   │   ├── DashboardTab.tsx       # KPIs, top 5, répartition catégories
│   │   ├── SettingsTab.tsx        # Caméra, nom assistant, vectorisation
│   │   ├── CategoryFilterModal.tsx
│   │   └── SyncNotice.tsx
│   ├── GeminiAssistant/           # Drawer, LiveSession, AudioManager, tools
│   ├── ProductDetailsModal.tsx    # Fiche produit + historique mouvements
│   └── *.tsx                      # Modals, toasts, exports
├── lib/
│   ├── supabaseInventory.ts       # CRUD inventory_items
│   ├── supabaseMovements.ts       # CRUD stock_movements (nouveau)
│   ├── supabaseCategories.ts      # CRUD categories
│   ├── supabaseSettings.ts        # Clé/valeur paramètres
│   ├── supabaseAuth.ts            # Sessions
│   ├── supabaseRest.ts            # Client REST bas niveau
│   ├── inventorySync.ts           # CRUD + file hors-ligne + logging mouvements
│   ├── offlineDb.ts               # IndexedDB schema
│   ├── embeddingService.ts        # OpenRouter + fallback local
│   ├── autoCategorization.ts      # Suggestions OFF
│   ├── haptics.ts                 # Retours haptiques
│   └── api.ts                     # OpenFoodFacts v0/v2
├── hooks/
│   ├── useHardwareScanner.ts      # Capture douchette globale
│   ├── useSupabaseRealtime.ts     # Souscriptions live
│   ├── useOfflineSync.ts          # Flush file différé
│   ├── useEmbeddingGenerator.ts   # Vectorisation batch
│   └── useGeminiAssistant.ts      # UX assistant vocal
└── providers/
    └── GeminiAssistantProvider.tsx
```

---

## 🔐 Sécurité

- **RLS Supabase** activé sur toutes les tables (`inventory_items`, `categories`, `stock_movements`)
- **Variables d'environnement** : aucune clé hardcodée, toutes via `VITE_*`
- **Confirmation** requise pour suppressions et modifications critiques
- **IndexedDB** : jamais exposé dans les messages d'erreur

---

## 🛣️ Roadmap

- [x] Scan code-barres + OpenFoodFacts
- [x] Assistant vocal Lina (Gemini Live) avec 18 tools
- [x] Recherche sémantique + embeddings
- [x] Mode hors-ligne + file de sync
- [x] Exports CSV et PDF
- [x] Gestion des catégories
- [x] PWA + Electron desktop
- [x] Dashboard analytics
- [x] Fonctionnalités Multi-Actions vocales (batch prix, inventaire catégorie, ruptures)
- [x] **Journal POS fusionné** — opérations groupées par produit
- [x] **Historique des mouvements par produit** — traçabilité complète avec source
- [ ] Multi-utilisateur + rôles (admin / employé)
- [ ] Import/export Excel
- [ ] Thème sombre
- [ ] Alertes proactives de Lina (stock bas automatique)
- [ ] Seuil d'alerte personnalisable par produit

---

_Dernière mise à jour : Juillet 2026_  
_Version : 1.1.0_
