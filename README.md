# ⚡ NeuroStock — Inventaire PWA nouvelle génération
<img src="public/header.png" alt="NeuroStock" />

[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Live%20API-yellow)](https://ai.google.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://web.dev/progressive-web-apps/)

Application **mobile-first** de gestion d'inventaire pour points de vente.  
Pensée pour le scan code-barres, la synchronisation temps réel et le pilotage vocal via un assistant IA intégré.

---

## 🚀 Pourquoi NeuroStock ?

- ⚡ **Scan en 1 geste** — compatibilité douchettes USB/Bluetooth + caméra.
- 🎙️ **Assistant vocal "Lina"** — reconnaissance vocale et réponse audio temps réel avec Gemini Live.
- 🧠 **Recherche sémantique** — vectorisation des produits via embeddings OpenRouter.
- 📴 **Mode hors-ligne robuste** — stockage local + file d'attente de synchronisation.
- 📊 **Vue action** — filtres dynamiques, alertes stock bas, tri intelligent.
- 🧾 **Exports** — CSV et PDF prêts pour la comptabilité.

---



## ✨ Fonctionnalités

### 📱 Interface mobile-first
- Design sombre tactile avec tap targets optimisés, retours haptiques et glassmorphism.
- 4 onglets principaux : **Scanner**, **Auto** (scan automatique), **Stock**, **Catégories**.
- Navigation basse fixe + stats instantanées (# produits, total unités, alertes).

### 🔍 Scans intelligents
- **Scans matériels** : capture globale du clavier (douchette USB/BT) sans focus requis.
- **Scan caméra** : défilement continu sans confirmation manuelle.
- **Routage après scan** : un produit existant ouvre directement le modal d'ajustement / édition.
- **Mode Auto** : chaque scan ajoute (+1) ou retire (−1) automatiquement jusqu'à 0.

### 📦 Gestion d'inventaire avancée
- Création manuelle, modale quantité, détails produit.
- Prix d'achat et de vente par référence.
- Auto-catégorisation via OpenFoodFacts + règles locales.
- Vues compact / détaillé, filtres par catégorie, stock bas/rupture, tri (nom, récent, quantité).
- Suppression et modification inline avec confirmation.

### 🎙️ Assistant vocal Gemini
- Audio temps réel (PCM 16 kHz, duplex) via `Gemini Live`.
- Bouton flottant + drawer avec contrôles : ouvrir / réduire / couper le micro / arrêter .
- **Tools IA** : recherche produit, MAJ stock, crée/renomme/supprime catégorie, export CSV.
- Confirmation explicite pour les actions sensibles (suppression, modifications critiques).

### 🧠 Recherche sémantique
- Génération d'**embeddings** stockés localement (IndexedDB) pour chaque produit.
- Recherche par similarité : préfixe, inclusion, correspondance exacte.
- Fallback automatique sans clé OpenRouter (hash local + couple code-barres/brand).

### ☁️ Synchronisation & résilience
- **Supabase** : appels REST sécurisés via client dédié.
- **RLS** : politiques par table (`inventory_items`, `categories`, `storage`).
- **Offline-first** : `IndexedDB` + file d'opérations différées.
- **Realtime** : souscription live pour conflits `lastUpdated` (last-write-wins).

### 📁 Gestion des catégories
- CRUD complet, émojis, tri alphabétique.
- Suggestions automatiques depuis la base OpenFoodFacts.
- Filtrage modal avec scroll horizontal.

---



## 🛠️ Stack technique

| Couche | Outils |
|---|---|
| Frontend | React 19, TypeScript 5.8, Vite 6 |
| UI | Tailwind CSS v4, Lucide React, Motion |
| Backend | Supabase (PostgreSQL + Storage + Realtime) |
| IA | Google Gemini Live (assistant vocal), OpenRouter (embeddings) |
| Données externes | OpenFoodFacts API v2 |
| Hors-ligne | IndexedDB, localStorage |
| Build | Vite, esbuild |
| Distribution | PWA (manifest.json) |

---



## ⚙️ Installation & configuration minimale

### 1. Base de données Supabase

Exécutez [`supabase-schema.sql`](supabase-schema.sql) dans l'éditeur SQL Supabase :

```sql
-- Tables : inventory_items, categories
-- Bucket : product-photos (public)
-- RLS + politiques publiques
-- Données initiales de catégories
```

### 2. Variables d'environnement

Créez `.env` à la racine :

```env
# Supabase (obligatoires pour la synchro cloud)
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

Notes :
- `VITE_GEMINI_API_KEY` active l'assistant vocal et les tools métiers.
- Sans `VITE_OPENROUTER_API_KEY`, la recherche sémantique utilise un fallback local.
- Le navigateur demande l'accès au microphone au premier lancement de l'assistant.

### 3. Lancer en développement

```bash
npm install
npm run dev
```

Accès local : `http://localhost:3000`

---



## 📦 Scripts utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement Vite sur le port 3000 |
| `npm run build` | Build optimisé pour la production |
| `npm run preview` | Prévisualiser le build localement |
| `tsc --noEmit` | Vérification TypeScript sans compilation |

---



## 🧠 Guide rapide — Assistant vocal

1. Taper sur l'onglet **Lina** dans la navigation basse.
2. Autoriser le microphone.
3. Parler naturellement en français.
4. Confirmer les actions sensibles quand l'interface le demande.

**Exemples :**
```
"Mets le stock du code-barres 1234567890123 à 8."
"Crée une catégorie boissons."
"Renomme la catégorie épicerie en épicerie salée."
"Exporte l'inventaire en CSV."
"Trouve tous les produits avec moins de 2 unités."
```

---



## 📁 Structure du projet

```
src/
├── App.tsx                     # Root state, orchestration, sync offline + realtime
├── components/
│   ├── AuthScreen.tsx          # Connexion / déconnexion
│   ├── Header.tsx              # Brand, stats, sync, export, logout
│   ├── InventoryGrid.tsx       # Vue compact / détail
│   ├── app/
│   │   ├── AppNavigation.tsx   # Nav basse 4 onglets + assistant
│   │   ├── ScanTab.tsx         # Scan caméra + handleScan
│   │   ├── StockTab.tsx        # Liste stock + filtres + tri
│   │   ├── CategoryFilterModal.tsx
│   │   └── SyncNotice.tsx
│   ├── GeminiAssistant/        # Drawer, LiveSession, AudioManager, tools
│   │   ├── tools.ts
│   │   ├── systemPrompt.ts
│   │   └── FunctionDispatcher.ts
│   ├── gestures/
│   │   └── SwipeableModal.tsx
│   └── *.tsx                   # Modals, toasts, exports
├── lib/
│   ├── supabase*.ts            # Clients dédiés (inventory, categories, auth, rest)
│   ├── inventorySync.ts        # CRUD + file hors-ligne
│   ├── offlineDb.ts            # IndexedDB schema
│   ├── embeddingService.ts     # OpenRouter + fallback local
│   ├── autoCategorization.ts   # Suggestions depuis OFF
│   ├── haptics.ts              # Vibrations tactiles
│   ├── api.ts                  # OpenFoodFacts v0/v2
│   └── utils.ts
├── hooks/
│   ├── useHardwareScanner.ts   # Capture douchette globale
│   ├── useSupabaseRealtime.ts  # Souscriptions live
│   ├── useOfflineSync.ts       # Flush file différé
│   ├── useEmbeddingGenerator.ts# Vectorisation batch
│   └── useGeminiAssistant.ts   # UX assistant vocal
└── types.ts
```

---



## 🔐 Sécurité & données

- **RLS Supabase** : politiques par table verrouillant les accès selon le scope.
- **Variables d'environnement** : aucune clé hardcodée ; toutes via `VITE_*`.
- **IndexedDB** : stockage local chiffré par le navigateur, jamais exposé en erreur.
- **Confirmation actions** : suppressions et modifications sensibles passent par un flux utilisateur explicite.

---



## 🧪 Tests & vérification

```bash
# Type-check uniquement (rapide)
tsc --noEmit

# Build complet
npm run build
```

---



## 📄 Licences & mentions

- Dépendances open-source : React, Vite, Tailwind, Supabase, Lucide, Motion, OpenFoodFacts, OpenRouter, Google Gemini.
- Application propriétaire : [`NeuroStock`](https://github.com/moonback/NeuroStock).

---



## 🛣️ Roadmap

- [x] Scan code-barres + OpenFoodFacts
- [x] Assistant vocal avec tools métiers
- [x] Recherche sémantique + embeddings
- [x] Mode hors-ligne + file de sync
- [x] Exports CSV et PDF
- [x] Gestion des catégories
- [x] PWA installable
- [ ] Authentification email/mot de passe native (en cours)
- [ ] Multi-utilisateur + rôles (admin / employé)
- [ ] Import/export Excel
- [ ] Dashboard analytics

---

_Dernière mise à jour : Juin 2026_
