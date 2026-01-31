
import { Buffer } from 'buffer';
import process from 'process';
(window as any).Buffer = Buffer;
(window as any).process = process;
(window as any).global = window;

import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
