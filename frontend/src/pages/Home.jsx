import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useEffect } from "react";
function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = "Home · makeapost";
  }, []);
  // Don't show content while loading or if logged in
  if (loading || user) {
    return <></>;
  }

  return (
    <div>
      <h1
        className="text-2xl font-semibold text-slate-800 text-center shadow-white animate-[fadeInDown_0.5s_ease-out]"
        style={{ textShadow: "0 0 10px rgb(255, 255, 255)" }}
      >
        A few words are worth a thousand pictures.
      </h1>
      <div
        className="mt-8 text-center animate-[fadeInUp_0.5s_ease-out]"
        style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
      >
        <Link
          to="/login"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-300"
        >
          Join the community
        </Link>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
