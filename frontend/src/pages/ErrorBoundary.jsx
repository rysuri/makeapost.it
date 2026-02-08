import { Link } from "react-router-dom";
import { useEffect } from "react";

function ErrorBoundary() {
  useEffect(() => {
    document.title = "Page not found · makeapost";
  }, []);
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-xl max-w-md">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-800">404</h1>
          </div>

          <div className="mb-12">
            <p className="text-lg text-gray-600">
              The page you're looking for doesn't exist.
            </p>
          </div>

          <Link
            to="/"
            className="inline-block bg-yellow-200 hover:bg-yellow-300 text-gray-800 font-semibold py-3 px-6 rounded-sm shadow-lg shadow-yellow-300/50 hover:shadow-xl transition-all duration-200 hover:scale-105 hover:rotate-1"
            style={{ fontFamily: "'Indie Flower', cursive, sans-serif" }}
          >
            oops sorry... Take me home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
