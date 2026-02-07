import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Home() {
  const { user, loading } = useAuth();

  // Don't show content while loading or if logged in
  if (loading || user) {
    return <></>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 text-center">
        A few words are worth a thousand pictures.
      </h1>
      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-300"
        >
          Join the community
        </Link>
      </div>
    </div>
  );
}

export default Home;
