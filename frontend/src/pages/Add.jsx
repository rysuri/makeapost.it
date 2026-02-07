import { useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function Add() {
  const [inputValue, setInputValue] = useState("");
  const [expiration, setExpiration] = useState("7 days");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function handlePost() {
    if (!inputValue.trim()) {
      alert("Please enter some text");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:3000/data/post",
        {
          message: inputValue,
          size: "S",
          expiration: expiration,
        },
        { withCredentials: true },
      );

      console.log("Post created:", data);
      setInputValue("");
      alert("Post created successfully!");
    } catch (error) {
      console.error("Post error:", error.response?.data || error.message);
      alert("Failed to create post");
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    navigate("/");
    return <div className="p-8 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-2xl space-y-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Make a Post
        </h1>

        <div className="space-y-4">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          />

          <select
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
          >
            <option value="1 hour">1 hour</option>
            <option value="7 days">7 days</option>
            <option value="1 year">1 year</option>
          </select>

          <button
            onClick={handlePost}
            className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Post
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 text-center">
          Posting as: {user.name}
        </p>
      </div>
    </div>
  );
}

export default Add;
