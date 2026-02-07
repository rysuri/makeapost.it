import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Navbar() {
  const { user, loading } = useAuth();

  return (
    <div className="flex justify-between items-center bg-white text-black p-4 shadow-md">
      <Link to="/" className="px-4 py-2">
        makeapost
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
