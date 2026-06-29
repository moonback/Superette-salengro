import { useEffect, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, Scan, Package, Wifi, Bot, CheckCircle2 } from "lucide-react";

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

interface Step {
  title: string;
  description: string;
  icon: ReactNode;
}

const STORAGE_PREFIX = "neurostock_onboarding_done_";

export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const done = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (done) onComplete();
  }, [userId, onComplete]);

  const steps: Step[] = [
    {
      title: "Bienvenue sur NeuroStock",
      description:
        "Gérez votre inventaire simplement : scannez, suivez et synchronisez vos stocks en temps réel.",
      icon: <CheckCircle2 className="h-9 w-9 text-indigo-600 animate-float" />,
    },
    {
      title: "Scannez vos produits",
      description:
        "Utilisez le scanner physique ou l'appareil photo pour ajouter des produits en un instant.",
      icon: <Scan className="h-9 w-9 text-indigo-600 animate-float" />,
    },
    {
      title: "Suivez votre stock",
      description:
        "Visualisez les quantités, les alertes de stock bas et classifiez par catégories.",
      icon: <Package className="h-9 w-9 text-indigo-600 animate-float" />,
    },
    {
      title: "Synchronisation",
      description:
        "Toutes les modifications sont synchronisées automatiquement quand vous êtes en ligne.",
      icon: <Wifi className="h-9 w-9 text-indigo-600 animate-float" />,
    },
    {
      title: "Assistant vocal",
      description:
        "Posez des questions à l'assistant pour mettre à jour le stock ou chercher un produit.",
      icon: <Bot className="h-9 w-9 text-indigo-600 animate-float" />,
    },
  ];

  const next = () => {
    setDirection(1);
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const skip = () => finish();

  const finish = () => {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, "1");
    onComplete();
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 p-5 backdrop-blur-md">
      {/* Outer Click dismiss wrapper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={skip}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative w-full max-w-sm rounded-[2.2rem] border border-stone-200/50 bg-white p-6.5 shadow-2xl z-10"
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={skip}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 transition cursor-pointer"
          aria-label="Fermer l'onboarding"
        >
          <X className="h-4 w-4" />
        </motion.button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <motion.div
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 shadow-inner"
              >
                {current.icon}
              </motion.div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">{current.title}</h2>
              <p className="text-xs text-stone-450 font-semibold leading-relaxed px-2">{current.description}</p>
            </div>

            {/* Dots dynamic layout capsules */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {steps.map((_, idx) => {
                const isActive = idx === step;
                return (
                  <motion.span
                    key={idx}
                    animate={{
                      width: isActive ? 18 : 6,
                      backgroundColor: isActive ? "#4f46e5" : "#e5e5e0",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="h-1.5 rounded-full block"
                  />
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={next}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 transition cursor-pointer select-none"
            >
              {step < steps.length - 1 ? (
                <>
                  <span>Continuer</span>
                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                </>
              ) : (
                <span>Commencer</span>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
