import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import Operations from "./components/Operations.jsx";
import Add from "./components/Add.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/operations", element: <Operations /> },
  { path: "/operations/add", element: <Add /> },
  { path: "*", element: <ErrorBoundary /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
