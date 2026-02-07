// PostIt.jsx
import PropTypes from "prop-types";

function PostIt({ message, size, color, createdAt, expiresAt }) {
  // Size mapping
  const sizeClasses = {
    S: "w-32 h-32 text-sm",
    M: "w-48 h-48 text-base",
    L: "w-64 h-64 text-lg",
  };

  // Color mapping
  const colorClasses = {
    Y: "bg-yellow-200 shadow-yellow-300/50",
    P: "bg-pink-200 shadow-pink-300/50",
    B: "bg-blue-200 shadow-blue-300/50",
  };

  return (
    <div
      className={`
        ${sizeClasses[size] || sizeClasses.S} 
        ${colorClasses[color] || colorClasses.Y}
        p-4 
        rounded-sm 
        shadow-lg 
        transform 
        transition-transform 
        cursor-pointer
        flex
        flex-col
        relative
        select-none
      `}
      style={{
        fontFamily: "'Indie Flower', cursive, sans-serif",
      }}
    >
      {/* Post-it tape effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-4 bg-white/40 rounded-sm shadow-sm" />

      {/* Message */}
      <div className="flex-1 overflow-auto break-words">
        <p className="text-gray-800 leading-relaxed">{message}</p>
      </div>

      {/* Optional: timestamp in corner */}
      <div className="text-xs text-gray-600 mt-2 opacity-60">
        {new Date(createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

PostIt.propTypes = {
  message: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["S", "M", "L"]).isRequired,
  color: PropTypes.oneOf(["Y", "P", "B"]).isRequired,
  createdAt: PropTypes.string.isRequired,
  expiresAt: PropTypes.string.isRequired,
};

export default PostIt;
