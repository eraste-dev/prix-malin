import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { BottomNav } from "./components/BottomNav";
import { IntegrityBanners } from "./components/IntegrityBanners";
import { PwaStatus } from "./components/PwaStatus";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AccueilPage } from "./pages/AccueilPage";
import { ActivitePage } from "./pages/ActivitePage";
import { CalculerPage } from "./pages/CalculerPage";
import { ComprendrePage } from "./pages/ComprendrePage";
import { ExamplePage } from "./pages/ExamplePage";
import { MesPrixPage } from "./pages/MesPrixPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ReglagesPage } from "./pages/ReglagesPage";
import type { StorageAdapter } from "./lib/storage";
import { StoreProvider, useSettings } from "./lib/storeContext";
import { ThemeProvider, useThemeContext } from "./lib/themeContext";

/** Cadre commun des pages : colonne de contenu et barre de navigation flottante. */
function Layout() {
  const { effective } = useThemeContext();
  return (
    <>
      {/* Lien d'évitement : un bouton, car une ancre « #contenu » changerait l'adresse du routeur (ADR-0014). */}
      <button
        type="button"
        onClick={() => document.getElementById("contenu")?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-5 focus:py-3 focus:text-background"
      >
        Aller au contenu
      </button>
      <main id="contenu" tabIndex={-1} className="mx-auto grid max-w-xl gap-12 px-5 pt-6 pb-32 outline-none">
        <IntegrityBanners />
        <Outlet />
      </main>
      <BottomNav />
      <PwaStatus />
      {/* Messages d'état discrets (« Prix enregistré »), 16 px comme le reste (NFR-07). */}
      <Toaster position="top-center" theme={effective} toastOptions={{ style: { fontSize: "1rem" } }} />
    </>
  );
}

/** Premier lancement : la présentation d'abord (docs/14) ; ensuite, l'accueil. */
function HomeGate() {
  const needsOnboarding = useSettings((state) => state.needsOnboarding());
  return needsOnboarding ? <Navigate to="/bienvenue" replace /> : <AccueilPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="bienvenue" element={<OnboardingPage />} />
      <Route element={<Layout />}>
        <Route index element={<HomeGate />} />
        <Route path="calculer" element={<CalculerPage />} />
        <Route path="exemple" element={<ExamplePage />} />
        <Route path="prix" element={<MesPrixPage />} />
        <Route path="activite" element={<ActivitePage />} />
        <Route path="comprendre" element={<ComprendrePage />} />
        <Route path="comprendre/:slug" element={<ComprendrePage />} />
        <Route path="reglages" element={<ReglagesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

interface AppProps {
  /** Le stockage des données ; par défaut `localStorage` (les tests passent un stockage en mémoire). */
  readonly storage?: StorageAdapter | undefined;
}

export function App({ storage }: AppProps) {
  return (
    <StoreProvider storage={storage}>
      <ThemeProvider>
        <HashRouter>
          <AppErrorBoundary>
            <AppRoutes />
          </AppErrorBoundary>
        </HashRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}
