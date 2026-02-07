import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./AuthContext.jsx";
import { BoardProvider } from "./BoardContext.jsx";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <BrowserRouter>
        <BoardProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BoardProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
