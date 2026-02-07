import { Link } from "react-router-dom";

function Operations() {
  return (
    <div className="flex gap-8 justify-center">
      <Link
        to="/operations/add"
        className="w-48 h-48 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
      >
        <span className="text-lg font-semibold text-slate-900">
          Make a post
        </span>
      </Link>

      <Link
        to="/operations/add"
        className="w-48 h-48 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
      >
        <span className="text-lg font-semibold text-slate-900">
          Make a post
        </span>
      </Link>
    </div>
  );
}

export default Operations;
