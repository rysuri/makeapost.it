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
    <div
      className="bg-white p-7 relative m-30 transparent 10%"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 10%, black 20%, black 80%, transparent 90%)",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskImage:
          "linear-gradient(to right, transparent 10%, black 20%, black 80%, transparent 90%)",
        maskRepeat: "no-repeat",
        maskSize: "100% 100%",
      }}
    >
      <h1 className="text-2xl font-semibold text-slate-800 text-center shadow-white animate-[fadeInDown_0.5s_ease-out]">
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
    </div>
  );
}

export default Home;
