import ReactDOM from "react-dom/client";
import App from "./App";

// Renderiza a aplicação
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Registra o service worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado com sucesso:", registration);
      })
      .catch((error) => {
        console.error("Falha ao registrar Service Worker:", error);
      });
  });
}
