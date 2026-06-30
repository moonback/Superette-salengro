import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Scan,
  Zap,
  Package,
  Tags,
  Bot,
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  Brain,
  Wifi,
  WifiOff,
  CloudUpload,
  Barcode,
  Camera,
  Keyboard,
  Plus,
  Minus,
  Edit3,
  Trash2,
  FileText,
  ChevronDown,
  ChevronRight,
  Star,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

type HelpSection = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badge?: string;
  features: HelpFeature[];
};

type HelpFeature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tip?: string;
};

const HELP_SECTIONS: HelpSection[] = [
  {
    id: "scan",
    icon: Scan,
    title: "Onglet Scanner",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    badge: "Principal",
    features: [
      {
        icon: Barcode,
        title: "Scanner par code-barres (douchette)",
        description:
          "Connectez une douchette USB ou Bluetooth. Scannez un produit pour le retrouver instantanément dans votre inventaire ou l'ajouter s'il est nouveau. La douchette fonctionne depuis n'importe quel onglet.",
        tip: "La douchette est toujours active — inutile d'être sur l'onglet Scanner.",
      },
      {
        icon: Camera,
        title: "Scanner par caméra",
        description:
          "Utilisez l'appareil photo de votre téléphone pour scanner un code-barres. Activez le mode caméra via le bouton de bascule dans l'onglet Scanner.",
        tip: "Mode caméra idéal pour les appareils sans douchette hardware.",
      },
      {
        icon: Keyboard,
        title: "Saisie manuelle de code-barres",
        description:
          "Tapez directement le code-barres d'un produit si vous ne pouvez pas le scanner. Utilisez le champ de saisie manuelle affiché dans l'onglet.",
      },
      {
        icon: Plus,
        title: "Ajout d'un nouveau produit",
        description:
          "Quand un code-barres est inconnu, l'app cherche le produit sur OpenFoodFacts automatiquement. Si trouvé, vous choisissez la quantité. Si introuvable, un formulaire manuel s'ouvre pour saisir les infos (nom, marque, catégorie, prix).",
      },
      {
        icon: Edit3,
        title: "Modifier un produit existant",
        description:
          "En scannant un produit déjà en inventaire, un menu s'ouvre proposant deux actions : ajuster le stock ou modifier les informations produit (nom, marque, catégorie, prix d'achat/vente).",
      },
    ],
  },
  {
    id: "autoScan",
    icon: Zap,
    title: "Scan Automatique",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badge: "Rapide",
    features: [
      {
        icon: Zap,
        title: "Mode batch (scan en rafale)",
        description:
          "Activez le scan automatique pour traiter des dizaines de produits sans confirmation. Chaque scan ajoute ou retire automatiquement 1 unité du stock sans ouvrir aucun modal.",
        tip: "Parfait pour les réceptions de livraison ou les inventaires rapides.",
      },
      {
        icon: Plus,
        title: "Mode Ajout (+1 par scan)",
        description:
          "Chaque scan ajoute +1 à la quantité du produit en stock. Si le produit est nouveau et reconnu sur OpenFoodFacts, il est créé automatiquement avec une quantité de 1.",
      },
      {
        icon: Minus,
        title: "Mode Retrait (−1 par scan)",
        description:
          "Chaque scan retire 1 unité du stock. Une alerte vibrante s'affiche si le stock est déjà à 0. Le stock ne peut pas passer en négatif.",
      },
    ],
  },
  {
    id: "stock",
    icon: Package,
    title: "Onglet Stock",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    features: [
      {
        icon: Search,
        title: "Recherche produits",
        description:
          "Recherchez par nom, marque, catégorie ou code-barres. La recherche est instantanée et insensible à la casse.",
      },
      {
        icon: Filter,
        title: "Filtres de stock",
        description:
          "Filtrez l'inventaire par état : \"Tous\", \"Stock faible\" (≤ 5 unités), \"Rupture\" (0 unité) ou \"En stock\" (> 5 unités). Combinez avec la recherche pour des résultats précis.",
        tip: "Le compteur de rupture est affiché en rouge dans le header.",
      },
      {
        icon: Tags,
        title: "Filtre par catégorie",
        description:
          "Ouvrez le sélecteur de catégories pour n'afficher que les produits d'une catégorie donnée. Le nombre de produits par catégorie est affiché.",
      },
      {
        icon: SortAsc,
        title: "Tri de l'inventaire",
        description:
          "Triez par : date de mise à jour (récent d'abord), nom alphabétique, quantité croissante ou décroissante.",
      },
      {
        icon: Plus,
        title: "Ajustement rapide des quantités",
        description:
          "Appuyez sur les boutons + et − directement sur la carte produit pour modifier le stock d'une unité à la fois, sans ouvrir de modal.",
      },
      {
        icon: Edit3,
        title: "Édition produit depuis le stock",
        description:
          "Touchez une carte produit pour accéder à ses détails : modifier les informations, ajuster le stock avec saisie libre, ou supprimer l'article.",
      },
      {
        icon: Trash2,
        title: "Suppression de produit",
        description:
          "Supprimez un produit de l'inventaire depuis ses détails ou la carte. Une confirmation est demandée pour éviter les accidents.",
      },
      {
        icon: FileText,
        title: "Statistiques financières",
        description:
          "En bas de l'onglet Stock, visualisez la valeur totale d'achat, la valeur de vente potentielle et la marge brute de tout votre inventaire (si prix renseignés).",
      },
    ],
  },
  {
    id: "categories",
    icon: Tags,
    title: "Gestion des Catégories",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    features: [
      {
        icon: Tags,
        title: "Créer une catégorie",
        description:
          "Ajoutez vos propres catégories personnalisées avec un nom et un emoji/icône. Ces catégories apparaissent dans les filtres et lors de l'ajout de produits.",
      },
      {
        icon: Edit3,
        title: "Renommer une catégorie",
        description:
          "Modifiez le nom ou l'icône d'une catégorie existante. Tous les produits associés sont automatiquement mis à jour.",
      },
      {
        icon: Trash2,
        title: "Supprimer une catégorie",
        description:
          "Supprimez une catégorie inutilisée. Si des produits y sont associés, ils perdront leur catégorie.",
      },
      {
        icon: Brain,
        title: "Catégorisation automatique",
        description:
          "Lors du scan, l'app suggère automatiquement une catégorie en analysant le nom du produit et les données OpenFoodFacts. Vous pouvez accepter ou changer la suggestion.",
        tip: "Plus vous avez de catégories définies, meilleure est la suggestion automatique.",
      },
    ],
  },
  {
    id: "assistant",
    icon: Bot,
    title: "Assistant Lina (IA Vocale)",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badge: "IA",
    features: [
      {
        icon: Bot,
        title: "Ouvrir Lina",
        description:
          "Touchez l'icône \"Lina\" dans la barre de navigation. Lina est un assistant vocal alimenté par l'IA Gemini, spécialement configuré pour la gestion d'inventaire.",
      },
      {
        icon: Search,
        title: "Recherche vocale de produits",
        description:
          "Demandez \"Où est le Nutella ?\" ou \"Quel est le stock de lait ?\". Lina trouve le produit dans votre inventaire et vous donne les informations en temps réel.",
      },
      {
        icon: Edit3,
        title: "Mise à jour vocale du stock",
        description:
          "Dites \"Mets le stock de Coca-Cola à 24\" ou \"Retire 5 yaourts\". Lina met à jour l'inventaire directement via commande vocale.",
      },
      {
        icon: Plus,
        title: "Création vocale de produit",
        description:
          "Créez un nouveau produit par la voix en donnant son nom, sa marque et sa quantité. Lina cherche sur OpenFoodFacts et crée le produit automatiquement.",
      },
      {
        icon: Tags,
        title: "Gestion des catégories par la voix",
        description:
          "Créez ou renommez des catégories par la voix : \"Crée une catégorie Boissons\" ou \"Renomme Épicerie en Épicerie sèche\".",
      },
      {
        icon: Brain,
        title: "Recherche sémantique (IA)",
        description:
          "Lina peut faire des recherches sémantiques sur votre inventaire, trouvant des produits même avec des descriptions approximatives ou des synonymes.",
      },
      {
        icon: Download,
        title: "Export par la voix",
        description:
          "Demandez \"Exporte mon inventaire en CSV\" pour déclencher l'export directement depuis Lina.",
      },
    ],
  },
  {
    id: "sync",
    icon: CloudUpload,
    title: "Synchronisation & Hors-ligne",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    features: [
      {
        icon: Wifi,
        title: "Synchronisation en temps réel",
        description:
          "L'inventaire est synchronisé en temps réel via Supabase. Toute modification sur un appareil apparaît instantanément sur tous les autres appareils connectés.",
      },
      {
        icon: WifiOff,
        title: "Mode hors-ligne",
        description:
          "L'app continue de fonctionner sans connexion internet. Les modifications sont sauvegardées localement et synchronisées automatiquement dès le retour en ligne.",
        tip: "Une bannière orange/rouge indique l'état hors-ligne et le nombre d'opérations en attente.",
      },
      {
        icon: CloudUpload,
        title: "Synchronisation manuelle",
        description:
          "Si des opérations sont en attente, un bouton de synchronisation (nuage) apparaît dans le header. Touchez-le pour forcer la synchro immédiatement.",
      },
    ],
  },
  {
    id: "export",
    icon: Download,
    title: "Export & Import",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    features: [
      {
        icon: FileText,
        title: "Export CSV",
        description:
          "Exportez tout l'inventaire en fichier CSV (Code-barres, Nom, Marque, Catégorie, Quantité). Téléchargé automatiquement avec la date du jour dans le nom de fichier.",
      },
      {
        icon: FileText,
        title: "Export PDF",
        description:
          "Générez un rapport PDF complet de votre inventaire avec mise en forme, tableau produits et statistiques. Idéal pour l'impression ou le partage.",
      },
      {
        icon: Upload,
        title: "Import CSV",
        description:
          "Importez des produits en masse depuis un fichier CSV. L'app vérifie chaque produit sur OpenFoodFacts et synchronise avec la base de données. Une barre de progression suit l'avancement.",
        tip: "Le fichier CSV doit avoir les colonnes : Code-barres, Nom, Marque, Catégorie, Quantité.",
      },
    ],
  },
  {
    id: "embeddings",
    icon: Brain,
    title: "Vectorisation (IA avancée)",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    badge: "Avancé",
    features: [
      {
        icon: Brain,
        title: "Génération d'embeddings",
        description:
          "Les embeddings sont des représentations vectorielles de vos produits permettant la recherche sémantique. Cliquez sur l'icône cerveau dans le header pour lancer la génération pour tous les produits.",
      },
      {
        icon: Zap,
        title: "Recherche sémantique intelligente",
        description:
          "Une fois les embeddings générés, Lina peut faire des recherches intelligentes : \"Trouve quelque chose de sucré\" ou \"Produits laitiers en rupture\" avec des résultats pertinents même sans correspondance exacte.",
      },
      {
        icon: CheckCircle,
        title: "Progression de vectorisation",
        description:
          "Une barre de progression s'affiche dans le header pendant la génération. Vous pouvez mettre en pause et reprendre à tout moment.",
      },
    ],
  },
];

type HelpModalProps = {
  open: boolean;
  onClose: () => void;
};

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("scan");
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
    setExpandedFeature(null);
  };

  const toggleFeature = (key: string) => {
    setExpandedFeature((prev) => (prev === key ? null : key));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white shadow-2xl"
            style={{ maxHeight: "92dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="h-1 w-10 rounded-full bg-stone-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900 leading-tight">
                    Guide des fonctionnalités
                  </h2>
                  <p className="text-[11px] text-stone-400 font-medium">
                    NeuroStock · {HELP_SECTIONS.length} sections · {HELP_SECTIONS.reduce((acc, s) => acc + s.features.length, 0)} fonctionnalités
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-800"
                aria-label="Fermer l'aide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick intro */}
            <div className="px-5 py-3 flex-shrink-0">
              <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-4 py-3 flex items-start gap-3">
                <Star className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-700 leading-relaxed">
                  <span className="font-bold">NeuroStock</span> est votre gestionnaire d'inventaire intelligent pour superette. Scannez, gérez et analysez votre stock en temps réel — même hors-ligne.
                </p>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
              {HELP_SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSection === section.id;

                return (
                  <div
                    key={section.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? `${section.borderColor} ${section.bgColor}/60`
                        : "border-stone-100 bg-stone-50/50"
                    }`}
                  >
                    {/* Section header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors"
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${section.bgColor} ${section.borderColor}`}
                      >
                        <SectionIcon className={`h-4 w-4 ${section.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              isExpanded ? section.color : "text-stone-700"
                            }`}
                          >
                            {section.title}
                          </span>
                          {section.badge && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide ${section.bgColor} ${section.color} border ${section.borderColor}`}
                            >
                              {section.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {section.features.length} fonctionnalité
                          {section.features.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown
                          className={`h-4 w-4 ${
                            isExpanded ? section.color : "text-stone-400"
                          }`}
                        />
                      </motion.div>
                    </button>

                    {/* Features list */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-1.5">
                            {section.features.map((feature, fi) => {
                              const FeatureIcon = feature.icon;
                              const featureKey = `${section.id}-${fi}`;
                              const isFeatureExpanded =
                                expandedFeature === featureKey;

                              return (
                                <div
                                  key={featureKey}
                                  className="rounded-xl bg-white border border-stone-100 overflow-hidden shadow-sm"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleFeature(featureKey)}
                                    className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                                  >
                                    <div
                                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${section.bgColor}`}
                                    >
                                      <FeatureIcon
                                        className={`h-3.5 w-3.5 ${section.color}`}
                                      />
                                    </div>
                                    <span className="flex-1 text-xs font-semibold text-stone-700">
                                      {feature.title}
                                    </span>
                                    <motion.div
                                      animate={{
                                        rotate: isFeatureExpanded ? 90 : 0,
                                      }}
                                      transition={{ duration: 0.15 }}
                                      className="flex-shrink-0"
                                    >
                                      <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
                                    </motion.div>
                                  </button>

                                  <AnimatePresence initial={false}>
                                    {isFeatureExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-3.5 pb-3 space-y-2">
                                          <div className="h-px bg-stone-100" />
                                          <p className="text-xs text-stone-500 leading-relaxed">
                                            {feature.description}
                                          </p>
                                          {feature.tip && (
                                            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                                {feature.tip}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Footer CTA */}
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4 text-violet-200" />
                  <span className="text-xs font-black tracking-wide">
                    Besoin d'aide supplémentaire ?
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200 leading-relaxed">
                  Ouvrez{" "}
                  <span className="font-bold text-white">Lina</span>, votre
                  assistante IA, et posez-lui vos questions directement par la
                  voix ou par texte.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-violet-300 font-semibold">
                  <ArrowRight className="h-3 w-3" />
                  <span>Onglet Lina dans la barre de navigation</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
