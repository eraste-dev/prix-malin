import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (container === null) throw new Error("Élément #root introuvable");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// L'écran de lancement de index.html disparaît une fois la première image de l'app dessinée.
requestAnimationFrame(() => document.getElementById("splash")?.remove());
