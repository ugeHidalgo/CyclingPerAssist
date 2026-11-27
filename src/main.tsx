import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./styles/theme.css";
import { router } from "./app/router.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Missing application root element with id "root".');
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
