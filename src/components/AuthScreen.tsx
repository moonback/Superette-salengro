import { useState, FormEvent } from "react";
import { Store, Loader2, Mail, Lock, ArrowRight, AlertTriangle, Power } from "lucide-react";
import { quitApp } from "../lib/electronUtils";
import { motion, AnimatePresence } from "motion/react";
import { signIn, signUp, UserSession } from "../lib/supabaseAuth";

interface AuthScreenProps {
  onAuthSuccess: (session: UserSession) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const session = await signIn(trimmedEmail, password);
        onAuthSuccess(session);
      } else {
        const session = await signUp(trimmedEmail, password);
        setSuccessMessage("Inscription réussie ! Vous êtes connecté.");
        setTimeout(() => {
          onAuthSuccess(session);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-5 overflow-hidden bg-[#faf9f6] dark:bg-[#0f0e0d]">
      {/* Quit button */}
      <button
        type="button"
        onClick={() => quitApp()}
        aria-label="Quitter l'application"
        title="Quitter l'application"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200/60 dark:border-stone-700/60 text-stone-400 dark:text-stone-500 hover:text-red-500 hover:bg-red-50/80 dark:hover:bg-red-950/80 hover:border-red-200/60 dark:hover:border-red-700/60 shadow-sm transition-all duration-200 text-xs font-bold select-none cursor-pointer"
      >
        <Power className="w-4 h-4 stroke-[2.5]" />
        <span>Quitter</span>
      </button>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
      <motion.div
        animate={{ scale: [1, 1.1, 0.95, 1], x: [0, 20, -10, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-200/30 dark:bg-indigo-900/20 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 0.9, 1.1, 1], x: [0, -15, 25, 0], y: [0, 20, -25, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-violet-200/20 dark:bg-violet-900/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
            className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mx-auto"
          >
            <Store className="h-8 w-8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">NeuroStock</h1>
            <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500 font-semibold leading-relaxed">
              Connectez-vous pour accéder à votre inventaire
            </p>
          </motion.div>
        </div>

        {/* Auth Panel */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.45 }}
          className="rounded-3xl border border-stone-200/50 dark:border-stone-700/50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md p-6.5 shadow-xl shadow-stone-900/4"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mb-1">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h2>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2.5 rounded-xl border border-rose-200 dark:border-rose-700/60 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-3 text-xs text-rose-600 dark:text-rose-400"
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-3 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse" />
                  <span className="font-semibold">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 glass-input rounded-2xl text-sm font-semibold text-stone-900 dark:text-stone-100 outline-none transition"
                    placeholder="nom@neurostock.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 glass-input rounded-2xl text-sm font-semibold text-stone-900 dark:text-stone-100 outline-none transition"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 transition cursor-pointer select-none mt-4.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{isLogin ? "Se connecter" : "S'inscrire"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
