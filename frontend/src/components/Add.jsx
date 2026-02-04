import { useState } from "react";
import { Link } from "react-router-dom";

function Add() {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [result, setResult] = useState("");

  const handleAdd = async () => {
    try {
      const response = await fetch("http://localhost:3000/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num1, num2 }),
      });
      const data = await response.json();

      if (!response.ok) {
        setResult(data.error);
        return;
      }

      setResult(data.result);
    } catch (error) {
      setResult("Error connecting to server");
    }
  };

  return (
    <div>
      <Link to="/">Home Page</Link>
      <h1>Add Page</h1>

      <input
        type="number"
        value={num1}
        onChange={(e) => setNum1(e.target.value)}
        placeholder="Enter number to add"
      />
      <input
        type="number"
        value={num2}
        onChange={(e) => setNum2(e.target.value)}
        placeholder="Enter number to add"
      />

      <br />

      <button onClick={handleAdd}>Add</button>

      {result && <h2>Result: {result}</h2>}
    </div>
  );
}

export default Add;
