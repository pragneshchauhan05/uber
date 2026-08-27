import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import UserContext from "./Context/UserContext.jsx";
import CaptainContext from "./Context/CaptainContext.jsx";
import SocketProvider from "./Context/SocketContext.jsx";

// Filter noise logs & PWA beforeinstallprompt banner warnings from browser console
const filterNoise = () => {
  const noisySubstrings = [
    "beforeinstallpromptevent.preventDefault()",
    "Floto Widget",
    "Floto Design QA",
    "FloatingWidget",
  ];

  ["log", "warn", "info"].forEach((level) => {
    const original = console[level];
    if (!original) return;
    console[level] = (...args) => {
      if (
        args.length > 0 &&
        typeof args[0] === "string" &&
        noisySubstrings.some((str) => args[0].includes(str))
      ) {
        return;
      }
      original.apply(console, args);
    };
  });
};

filterNoise();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CaptainContext>
      <UserContext>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </UserContext>
    </CaptainContext>
  </StrictMode>,
);

