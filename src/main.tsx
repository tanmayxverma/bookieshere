import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
<<<<<<< HEAD
import { SpeedInsights } from "@vercel/speed-insights/react";
=======
import { SpeedInsights } from "@vercel/speed-insights/react"
>>>>>>> e023794 (Update site branding metadata)
import App from "./App.tsx";
import "./index.css";

// Apply saved Lite Mode preference before render (avoids flash of heavy UI)
try {
  if (localStorage.getItem("bookie_lite_mode") === "true") {
    document.documentElement.classList.add("lite-mode");
  }
} catch { /* ignore */ }

<<<<<<< HEAD
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
    <SpeedInsights />
  </>
);
=======
createRoot(document.getElementById("root")!).render(<App />);
<>
  <App />
  <Analytics />
  <SpeedInsights />
</>
>>>>>>> e023794 (Update site branding metadata)
