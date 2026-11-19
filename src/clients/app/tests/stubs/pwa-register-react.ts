/**
 * Double de `virtual:pwa-register/react` pour les tests (le vrai module est fabriqué par vite-plugin-pwa au build).
 * Un test règle `pwa` avant de rendre l'app pour simuler « nouvelle version » ou « prêt hors ligne ».
 */
export const pwa = {
  needRefresh: false,
  offlineReady: false,
  updateServiceWorker: async (_reload?: boolean): Promise<void> => undefined,
};

type Setter = (value: boolean) => void;

export function useRegisterSW(): {
  needRefresh: [boolean, Setter];
  offlineReady: [boolean, Setter];
  updateServiceWorker: (reload?: boolean) => Promise<void>;
} {
  return {
    needRefresh: [pwa.needRefresh, () => undefined],
    offlineReady: [pwa.offlineReady, () => undefined],
    updateServiceWorker: (reload) => pwa.updateServiceWorker(reload),
  };
}
