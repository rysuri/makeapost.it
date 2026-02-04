import { useState } from "react";
import { Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <h1>Home Page</h1>
        <Link to="/operations">Operations Page</Link>

        <div></div>
      </div>
    </>
  );
}

export default App;
