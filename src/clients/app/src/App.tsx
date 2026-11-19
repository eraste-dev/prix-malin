import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { BottomNav } from "./components/BottomNav";
import { CalculerPage } from "./pages/CalculerPage";
import { ReglagesPage } from "./pages/ReglagesPage";
import type { StorageAdapter } from "./lib/storage";
import { StoreProvider } from "./lib/storeContext";
import { ThemeProvider, useThemeContext } from "./lib/themeContext";

/** Cadre commun des pages : colonne de contenu et barre de navigation flottante. */
function Layout() {
  const { effective } = useThemeContext();
  return (
    <>
      <main className="mx-auto grid max-w-xl gap-12 px-5 pt-6 pb-32">
        <Outlet />
      </main>
      <BottomNav />
      {/* Messages d'état discrets (« Prix enregistré »), 16 px comme le reste (NFR-07). */}
      <Toaster position="top-center" theme={effective} toastOptions={{ style: { fontSize: "1rem" } }} />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/calculer" replace />} />
        <Route path="calculer" element={<CalculerPage />} />
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
          <AppRoutes />
        </HashRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}
