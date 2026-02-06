import "./App.css";

import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Operations from "./pages/Operations.jsx";
import Add from "./pages/Add.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import ErrorBoundary from "./pages/ErrorBoundary.jsx";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50 bg-white p-10 max-w-7xl mx-auto w-full">
        <NavBar />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/operations/add" element={<Add />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="*" element={<ErrorBoundary />} />
      </Routes>
      <div className="mt-auto p-10 max-w-7xl mx-auto w-full">
        <Footer />
      </div>
    </div>
  );
}

export default App;
