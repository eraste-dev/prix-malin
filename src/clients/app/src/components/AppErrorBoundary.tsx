import type { ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

/** Écran de secours (E14) : un message simple, aucune trace technique, les données sont intactes. */
function Fallback({ resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();
  return (
    <main className="mx-auto grid min-h-dvh max-w-xl content-center gap-6 px-5">
      <div role="alert" className="grid gap-4">
        <h1 className="text-4xl leading-tight font-light">Quelque chose s'est mal passé</h1>
        <p className="text-xl text-muted-foreground">Vos données sont intactes. Vous pouvez reprendre depuis l'accueil.</p>
        <Button
          type="button"
          onClick={() => {
            resetErrorBoundary();
            void navigate("/");
          }}
          className="h-14 w-fit rounded-full px-8 text-lg"
        >
          Revenir à l'accueil
        </Button>
      </div>
    </main>
  );
}

export function AppErrorBoundary({ children }: { readonly children: ReactNode }) {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
}
