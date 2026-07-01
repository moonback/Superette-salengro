# 🌙 Thème Sombre - NeuroStock

## ✅ Implémentation complète du thème sombre

### 📋 Ce qui a été fait

#### 1. **ThemeProvider** (`src/providers/ThemeProvider.tsx`)
- Context React pour gérer le thème globalement
- Support de 3 modes : `light`, `dark`, `auto`
- Détection automatique du thème système
- Persistance dans `localStorage` et synchronisation avec Supabase
- Application automatique des classes CSS `dark` sur `<html>` et `<body>`

#### 2. **Variables CSS** (`src/index.css`)
Nouvelles variables ajoutées :
```css
--color-dark-bg: #0f0e0d;           /* Fond principal sombre */
--color-dark-bg-elevated: #1a1816;  /* Cartes/surfaces élevées */
--color-dark-bg-hover: #252321;     /* État hover */
--color-dark-text: #e8e6e3;         /* Texte principal */
--color-dark-text-muted: #a8a29e;   /* Texte secondaire */
--color-dark-border: rgba(255, 255, 255, 0.08); /* Bordures */
```

#### 3. **Styles CSS mis à jour**
- ✅ Fond de page et grain de papier
- ✅ Classes `.surface-card` (cartes)
- ✅ Classes `.glass-panel` (navigation, header)
- ✅ Classes `.glass-card` (modales)
- ✅ Classes `.glass-input` (inputs)
- ✅ Classes `.sidebar-nav-item` (navigation desktop)
- ✅ Classes `.skeleton` et `.shimmer-overlay` (loading)

#### 4. **Composant Settings** (`src/components/app/SettingsTab.tsx`)
- ✅ Ajout du sélecteur de thème avec 3 options
- ✅ Icônes adaptées (Sun, Moon, Monitor)
- ✅ Design cohérent avec le reste de l'app
- ✅ Tous les éléments supportent le mode sombre

#### 5. **Intégration** (`src/main.tsx`)
- ✅ ThemeProvider enveloppe toute l'application
- ✅ Chargement au démarrage

#### 6. **Meta tags** (`index.html`)
- ✅ Support des deux valeurs de `theme-color`

#### 7. **Utilitaires** (`src/lib/themeUtils.ts`)
- Classes prédéfinies pour faciliter l'utilisation du thème sombre
- Helper `cn()` pour combiner des classes conditionnellement

---

## 🎨 Comment utiliser le thème sombre

### Pour l'utilisateur

1. **Ouvrir les paramètres**
   - Aller dans l'onglet "Paramètres" (⚙️)

2. **Choisir le thème**
   - **Clair** : Thème clair en permanence
   - **Sombre** : Thème sombre en permanence
   - **Auto** : Suit le thème système de l'appareil

3. **Le thème est sauvegardé automatiquement**
   - Stocké localement (localStorage)
   - Synchronisé avec Supabase

### Pour les développeurs

#### Utiliser les classes Tailwind
```tsx
// Exemple de base
<div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
  Contenu
</div>

// Avec les utilitaires
import { themeClasses } from '../lib/themeUtils';

<div className={themeClasses.card}>
  <h2 className={themeClasses.text.primary}>Titre</h2>
  <p className={themeClasses.text.secondary}>Description</p>
</div>
```

#### Accéder au thème dans les composants
```tsx
import { useTheme } from '../providers/ThemeProvider';

function MonComposant() {
  const { theme, effectiveTheme, setTheme, isDark } = useTheme();

  return (
    <div>
      <p>Thème actuel : {theme}</p>
      <p>Thème effectif : {effectiveTheme}</p>
      <p>Mode sombre : {isDark ? 'Oui' : 'Non'}</p>
      
      <button onClick={() => setTheme('dark')}>
        Activer le mode sombre
      </button>
    </div>
  );
}
```

---

## 🔧 Composants à mettre à jour

Pour que tous les composants supportent le thème sombre, ajouter les classes `dark:` aux éléments suivants :

### Pattern général
```tsx
// Avant
className="bg-white text-stone-900 border-stone-200"

// Après
className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700"
```

### Liste des composants principaux à vérifier :
- [ ] `Header.tsx`
- [ ] `AppNavigation.tsx`
- [ ] `ScanTab.tsx`
- [ ] `StockTab.tsx`
- [ ] `CategoryFilterModal.tsx`
- [ ] `ProductDetailsModal.tsx`
- [ ] `QuantityModal.tsx`
- [ ] `ManualProductModal.tsx`
- [ ] `InventoryGrid.tsx`
- [ ] `ExportModal.tsx`
- [ ] `CategoriesManager.tsx`
- [ ] `Toast.tsx`
- [ ] Tous les composants `GeminiAssistant/`

---

## 🎯 Classes CSS principales

### Texte
```css
.dark .text-stone-900 → text-stone-100
.dark .text-stone-600 → text-stone-400
.dark .text-stone-400 → text-stone-500
```

### Fond
```css
.dark .bg-white → bg-stone-900
.dark .bg-stone-50 → bg-stone-800
.dark .bg-stone-100 → bg-stone-700
```

### Bordures
```css
.dark .border-stone-200 → border-stone-700
.dark .border-stone-300 → border-stone-600
```

### Boutons
```css
.dark .bg-indigo-600 → bg-indigo-700
.dark .hover:bg-indigo-500 → hover:bg-indigo-600
```

---

## 📱 Test

### Tester l'implémentation

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Aller dans les paramètres**
   - Cliquer sur l'onglet "Paramètres"

3. **Tester les 3 modes**
   - Cliquer sur "Clair" → L'interface doit être claire
   - Cliquer sur "Sombre" → L'interface doit être sombre
   - Cliquer sur "Auto" → L'interface suit le thème système

4. **Vérifier la persistance**
   - Rafraîchir la page → Le thème doit être conservé
   - Fermer et rouvrir l'app → Le thème doit être conservé

5. **Tester sur différents écrans**
   - Mobile
   - Tablette
   - Desktop

---

## 🐛 Debug

### Le thème ne s'applique pas ?

1. Vérifier que `ThemeProvider` enveloppe bien `<App />` dans `main.tsx`
2. Ouvrir la console et vérifier :
   ```javascript
   document.documentElement.classList.contains('dark')
   document.body.classList.contains('dark')
   ```

3. Vérifier localStorage :
   ```javascript
   localStorage.getItem('neurostock_theme')
   ```

### Les styles ne changent pas ?

1. Vérifier que les classes `dark:` sont présentes
2. Inspecter l'élément pour voir si les classes sont appliquées
3. Vérifier que les variables CSS sont bien définies dans `index.css`

---

## 🚀 Prochaines étapes

### Migration progressive des composants

1. **Priorité haute** (composants toujours visibles)
   - [x] SettingsTab
   - [ ] Header
   - [ ] AppNavigation
   - [ ] Toast

2. **Priorité moyenne** (composants fréquents)
   - [ ] ScanTab
   - [ ] StockTab
   - [ ] InventoryGrid
   - [ ] ProductDetailsModal

3. **Priorité basse** (composants occasionnels)
   - [ ] ExportModal
   - [ ] CategoriesManager
   - [ ] ManualProductModal
   - [ ] Composants d'authentification

### Améliorations possibles

- [ ] Transition animée entre thème clair et sombre
- [ ] Prévisualisation des thèmes avant application
- [ ] Thèmes personnalisés (couleurs accent)
- [ ] Mode "économie d'énergie" avec OLED pure black

---

## 📚 Ressources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [React Context API](https://react.dev/reference/react/useContext)

---

_Dernière mise à jour : Juillet 2026_  
_Version : 1.0.0 du thème sombre_
