import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Navbar() {
  const { user, loading } = useAuth();

  return (
    <div className="flex justify-between items-center bg-white/80 backdrop-blur-md text-black p-4 shadow-lg border border-white/20">
      <Link to="/" className="px-4 py-2">
        <img
          src="/logo-bw.png"
          alt="Make A Post"
          className="h-8 w-auto object-contain flex-shrink-0"
        />
      </Link>

      <div className="flex gap-4">
        <Link to="/operations" className="px-4 py-2">
          Operations
        </Link>
        {!loading && (
          <>
            {!user ? (
              <Link to="/login" className="px-4 py-2">
                Login
              </Link>
            ) : (
              <>
                <Link to="/dashboard" className="px-4 py-2">
                  Dashboard
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
