# 📦 Boutique · Inventaire PWA

Application PWA mobile-first de gestion d'inventaire pour boutique, pensée pour le scan rapide, la synchronisation temps réel avec Supabase et, désormais, le pilotage vocal via un assistant Gemini.

---

## ✨ Fonctionnalités principales

### 📱 Interface mobile-first
- **Design sombre et lisible :** interface tactile optimisée pour smartphone avec navigation basse, composants compacts et retours visuels rapides.
- **Statistiques instantanées :** aperçu du nombre de références, du stock total et des alertes de stock faible.
- **Parcours orienté boutique :** scan, édition, filtres et export restent accessibles en quelques gestes.

### 🔍 Gestion d'inventaire et scans
- **Compatibilité douchettes USB / Bluetooth :** capture globale des scans sans imposer le focus sur un champ précis.
- **Routage après scan :** un produit scanné peut déclencher un ajustement rapide du stock ou l'ouverture de sa fiche d'édition.
- **Création et modification produit :** ajout manuel, mise à jour des quantités, catégories et métadonnées.
- **Export CSV :** extraction rapide de l'inventaire pour exploitation externe.

### 🎯 Filtres et pilotage du stock
- **Filtres dynamiques :** catégories défilables, tri et états de stock.
- **Vue orientée action :** repérage rapide des ruptures et des faibles niveaux de stock.
- **Synchronisation cloud :** données partagées via Supabase avec prise en charge des états hors ligne.

### 🎙️ Assistant vocal Gemini
- **Assistant intégré à l'application :** un tiroir vocal permet d'ouvrir, minimiser, couper le micro ou arrêter la session.
- **Audio temps réel :** microphone en entrée PCM 16 kHz et restitution vocale Gemini Live.
- **Réponses en français :** le prompt système configure l'assistant "Julien" pour répondre brièvement en français.
- **Actions métier via tools :** l'assistant peut rechercher un produit, mettre à jour un stock, créer ou renommer une catégorie, supprimer un produit et lancer un export CSV.
- **Sécurité des actions sensibles :** les opérations destructives ou critiques passent par un flux de confirmation avant validation.

### 🌐 Expérience PWA
- **Installable mobile et desktop :** comportement proche d'une application native via `manifest.json`.
- **Fonctionnement résilient :** cache et synchronisation différée pour continuer à travailler en cas de réseau instable.

---

## 🛠️ Stack technique

- **Frontend :** React 19, TypeScript, Vite
- **UI :** Tailwind CSS v4, Lucide React, Motion
- **Backend / données :** Supabase
- **IA générative :** Google Gemini via `@google/genai`
- **Distribution :** Progressive Web App (PWA)

---

## ⚙️ Configuration

### 1. Supabase

1. Créez un projet sur [Supabase](https://supabase.com/).
2. Exécutez le script [`supabase-schema.sql`](file:///c:/Users/Mayss/Documents/GitHub/Superette-salengro/supabase-schema.sql) dans l'éditeur SQL Supabase pour créer les tables et règles de sécurité nécessaires.

### 2. Variables d'environnement

Créez un fichier `.env` à la racine du projet et renseignez au minimum :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-api-anonyme
VITE_GEMINI_API_KEY=votre-cle-api-gemini
VITE_GEMINI_LIVE_MODEL=votre-modele-gemini-live
```

Notes :
- `VITE_GEMINI_API_KEY` est requis pour activer l'assistant vocal.
- `VITE_GEMINI_LIVE_MODEL` peut etre adapte selon le modele Gemini Live cible.
- Le navigateur demandera l'autorisation d'acceder au microphone lors de l'ouverture de l'assistant.

### 3. Installation et lancement

```bash
npm install
npm run dev
```

L'application est ensuite accessible en local sur `http://localhost:3000`.

---

## 🧠 Usage de l'assistant Gemini

1. Ouvrir l'assistant depuis la navigation de l'application.
2. Autoriser l'acces au microphone.
3. Parler naturellement en francais pour demander une action sur l'inventaire.
4. Confirmer les actions sensibles lorsque l'interface le demande.

Exemples de demandes :
- "Mets le stock du code-barres 1234567890123 a 8."
- "Cree une categorie boissons."
- "Renomme la categorie epicerie en epicerie salee."
- "Exporte l'inventaire en CSV."

---

## 📦 Commandes utiles

- **Developpement :** `npm run dev`
- **Build production :** `npm run build`
- **Verification TypeScript :** `npm run lint`
