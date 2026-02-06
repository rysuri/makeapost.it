import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    navigate("/");
    return <div>Not authenticated</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-2xl space-y-4">
      <h1 className="text-2xl font-bold">Welcome {user.name}</h1>

      <img
        src={user.picture}
        alt={user.name}
        className="w-24 h-24 rounded-full"
      />

      <div className="space-y-1 text-sm">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Member since:</strong> {user.created_at}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
