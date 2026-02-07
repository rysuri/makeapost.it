// App.jsx
import "./App.css";

import { Routes, Route } from "react-router-dom";
import { BoardProvider } from "./BoardContext"; // Named import with {}
import NavBar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Board from "./components/Board.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Operations from "./pages/Operations.jsx";
import Add from "./pages/Add.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import ErrorBoundary from "./pages/ErrorBoundary.jsx";

function App() {
  return (
    <BoardProvider>
      <div className="relative flex flex-col min-h-screen">
        <div className="fixed inset-0 z-0">
          <Board />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
          <div className="sticky top-0 z-50 p-10 max-w-7xl mx-auto w-full">
            <div className="pointer-events-auto select-none">
              <NavBar />
            </div>
          </div>

          <main className="flex-1 flex items-center justify-center">
            <div className="max-w-7xl w-full px-4">
              <div className="pointer-events-auto select-none">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/operations/add" element={<Add />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route path="*" element={<ErrorBoundary />} />
                </Routes>
              </div>
            </div>
          </main>

          <div className="mt-auto p-10 max-w-7xl mx-auto w-full">
            <div className="pointer-events-auto select-none">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </BoardProvider>
  );
}

export default App;
