import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_TOAST = "pwa-update";

/** Le focus est-il dans un champ de saisie ? Une mise à jour ne doit jamais interrompre quelqu'un qui tape. */
function isTypingTarget(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  return element.matches("input, textarea, select, [contenteditable='true']");
}

function useIsTyping(): boolean {
  const [typing, setTyping] = useState(() => isTypingTarget(document.activeElement));
  useEffect(() => {
    const update = () => setTyping(isTypingTarget(document.activeElement));
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);
  return typing;
}

/**
 * Service worker (hors ligne) : annonce « prêt hors ligne » une fois, et propose la mise à jour **sans l'imposer**
 * ni l'afficher pendant une saisie (docs/15 E14). Ne dessine rien lui-même : il passe par les messages d'état.
 */
export function PwaStatus() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();
  const typing = useIsTyping();

  useEffect(() => {
    if (!needRefresh || typing) {
      toast.dismiss(UPDATE_TOAST);
      return;
    }
    toast("Nouvelle version disponible", {
      id: UPDATE_TOAST,
      duration: Number.POSITIVE_INFINITY,
      action: { label: "Mettre à jour", onClick: () => void updateServiceWorker(true) },
    });
  }, [needRefresh, typing, updateServiceWorker]);

  useEffect(() => {
    if (!offlineReady) return;
    toast("L'application fonctionne maintenant sans internet.");
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady]);

  return null;
}
