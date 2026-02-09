import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import PostIt from "./PostIt";
import { useBoard } from "../BoardContext";

function Board() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const location = useLocation();
  const boardRef = useRef(null);

  const {
    zoom,
    setZoom,
    pan,
    setPan,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    refreshTrigger,
    isBoardInteractive,
  } = useBoard();

  const blockedRoutes = ["/dashboard", "/operations", "/login"];
  const isBlocked =
    blockedRoutes.includes(location.pathname) || !isBoardInteractive;

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  async function fetchPosts() {
    try {
      const { data } = await axios.get("http://localhost:3000/data/posts");
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  const handleWheel = (e) => {
    if (isBlocked) return;
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.1, zoom * (1 + delta)), 3);

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const pointX = (mouseX - pan.x) / zoom;
    const pointY = (mouseY - pan.y) / zoom;

    const newPan = {
      x: mouseX - pointX * newZoom,
      y: mouseY - pointY * newZoom,
    };

    setZoom(newZoom);
    setPan(newPan);
  };

  const handleMouseDown = (e) => {
    if (isBlocked) return;
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isBlocked) return;
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isBlocked) return;
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    if (isBlocked) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const newZoom = Math.min(zoom + 0.2, 3);
    const pointX = (centerX - pan.x) / zoom;
    const pointY = (centerY - pan.y) / zoom;

    setPan({
      x: centerX - pointX * newZoom,
      y: centerY - pointY * newZoom,
    });
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (isBlocked) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const newZoom = Math.max(zoom - 0.2, 0.1);
    const pointX = (centerX - pan.x) / zoom;
    const pointY = (centerY - pan.y) / zoom;

    setPan({
      x: centerX - pointX * newZoom,
      y: centerY - pointY * newZoom,
    });
    setZoom(newZoom);
  };

  const handleResetView = () => {
    if (isBlocked) return;
    setZoom(1);
    setPan({
      x: window.innerWidth / 2 - BOARD_WIDTH / 2,
      y: window.innerHeight / 2 - BOARD_HEIGHT / 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Blur overlay with fade transition */}
      <div
        className="absolute inset-0 z-20 bg-white/10 transition-all duration-300 ease-in-out"
        style={{
          pointerEvents: isBlocked ? "all" : "none",
          backdropFilter: isBlocked ? "blur(10px)" : "blur(0px)",
          WebkitBackdropFilter: isBlocked ? "blur(10px)" : "blur(0px)",
          opacity: isBlocked ? 1 : 0,
        }}
      />

      {/* Controls - slide in/out with transitions */}
      <div
        className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white p-3 rounded-lg shadow-lg transition-all duration-100 ease-in-out"
        style={{
          transform: isBlocked ? "translateX(150%)" : "translateX(0)",
          opacity: isBlocked ? 0 : 1,
        }}
      >
        <button
          onClick={handleZoomIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Zoom In (+)
        </button>
        <button
          onClick={handleZoomOut}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Zoom Out (-)
        </button>
        <button
          onClick={handleResetView}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Reset View
        </button>
        <div className="text-center text-sm text-gray-600 mt-2">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      <div
        className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-lg transition-all duration-100 ease-in-out"
        style={{
          transform: isBlocked ? "translateX(-150%)" : "translateX(0)",
          opacity: isBlocked ? 0 : 1,
        }}
      >
        <h2 className="text-lg font-bold text-gray-800">Post-It Board</h2>
        <p className="text-sm text-gray-600">Scroll to zoom • Drag to pan</p>
        <p className="text-sm text-gray-600">Posts: {posts.length}</p>
      </div>

      <div
        ref={boardRef}
        className={`w-full h-full ${!isBlocked && isDragging ? "cursor-grabbing" : !isBlocked ? "cursor-grab" : "cursor-default"}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            width: `${BOARD_WIDTH}px`,
            height: `${BOARD_HEIGHT}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            backgroundColor: "#f9fafb",
            position: "relative",
          }}
        >
          {posts.length === 0 ? (
            <div
              style={{
                position: "absolute",
                left: `${BOARD_WIDTH / 2}px`,
                top: `${BOARD_HEIGHT / 2}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <p className="text-center text-gray-500 text-lg">
                No posts yet. Create your first post-it!
              </p>
            </div>
          ) : (
            posts.map((post) => {
              return (
                <div
                  key={post.id}
                  style={{
                    position: "absolute",
                    left: `${(post.position_x || 0) + BOARD_WIDTH / 2}px`,
                    top: `${(post.position_y || 0) + BOARD_HEIGHT / 2}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <PostIt
                    message={post.message}
                    drawing={post.drawing}
                    link={post.link}
                    size={post.size}
                    color={post.color}
                    createdAt={post.iat}
                    expiresAt={post.exp}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Board;
