import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useBoard } from "../BoardContext";
import { useNavigate } from "react-router-dom";
import PostIt from "../components/PostIt";
import simplify from "simplify-js";

function Draw() {
  const [size, setSize] = useState("S");
  const [color, setColor] = useState("Y");
  const [expiration, setExpiration] = useState("7days");
  const [link, setLink] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isPlacing, setIsPlacing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [boardPos, setBoardPos] = useState({ x: 0, y: 0 });
  const [drawingData, setDrawingData] = useState(null);

  const canvasRef = useRef(null);
  const { user, loading } = useAuth();
  const { screenToBoard, zoom, triggerRefresh, setIsBoardInteractive } =
    useBoard();
  const navigate = useNavigate();

  useEffect(() => {
    setIsBoardInteractive(false);
    return () => {
      setIsBoardInteractive(true);
    };
  }, [setIsBoardInteractive]);

  useEffect(() => {
    document.title = "Draw · makeapost";
  }, []);

  useEffect(() => {
    if (!isPlacing) return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const pos = screenToBoard(e.clientX, e.clientY);
      setBoardPos(pos);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPlacing, screenToBoard]);

  useEffect(() => {
    if (!isPlacing) return;

    // Small delay to prevent the button click from triggering placement
    const timer = setTimeout(() => {
      const handleClick = async (e) => {
        e.preventDefault();
        await handlePost(boardPos.x, boardPos.y);
      };

      const handleEscape = (e) => {
        if (e.key === "Escape") {
          setIsPlacing(false);
          setIsBoardInteractive(false);
        }
      };

      window.addEventListener("click", handleClick);
      window.addEventListener("keydown", handleEscape);

      // Store cleanup function
      window._placementCleanup = () => {
        window.removeEventListener("click", handleClick);
        window.removeEventListener("keydown", handleEscape);
      };
    }, 0); // 100ms delay

    return () => {
      clearTimeout(timer);
      if (window._placementCleanup) {
        window._placementCleanup();
        delete window._placementCleanup;
      }
    };
  }, [isPlacing, boardPos]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentPath([coords]);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const coords = getCanvasCoordinates(e);
    setCurrentPath((prev) => [...prev, coords]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentPath.length > 0) {
      setPaths((prev) => [
        ...prev,
        { points: currentPath, color: brushColor, size: brushSize },
      ]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.stroke();
    });

    if (currentPath.length > 1) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);

      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }

      ctx.stroke();
    }
  }, [paths, currentPath, brushColor, brushSize]);

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const undo = () => {
    setPaths((prev) => prev.slice(0, -1));
  };

  const generateDrawingData = () => {
    const simplifiedPaths = paths.map((path) => {
      if (path.points.length < 3) return path;
      const simplified = simplify(path.points, 1.1, true);
      return {
        points: simplified,
        color: path.color,
        size: path.size,
      };
    });

    return {
      paths: simplifiedPaths,
      width: canvasRef.current?.width || 400,
      height: canvasRef.current?.height || 400,
    };
  };

  function startPlacement(e) {
    if (paths.length === 0) {
      alert("Please draw something first!");
      return;
    }

    e.stopPropagation();

    const data = generateDrawingData();
    setDrawingData(data);
    setIsPlacing(true);
    setIsBoardInteractive(true);
  }

  async function handlePost(x, y) {
    try {
      const { data } = await axios.post(
        "http://localhost:3000/data/post",
        {
          message: null,
          drawing: drawingData,
          link: link || null,
          size: size,
          position_x: x,
          position_y: y,
          color: color,
          expiration: expiration,
        },
        { withCredentials: true },
      );

      console.log("Post created:", data);
      setPaths([]);
      setDrawingData(null);
      setLink("");
      setIsPlacing(false);
      setIsBoardInteractive(false);

      triggerRefresh();
      navigate("/");
    } catch (error) {
      console.error("Post error:", error.response?.data || error.message);
      alert("Failed to create post");
      setIsPlacing(false);
      setIsBoardInteractive(false);
    }
  }

  const getCanvasSize = () => {
    switch (size) {
      case "S":
        return { width: 400, height: 400 };
      case "M":
        return { width: 500, height: 500 };
      case "L":
        return { width: 600, height: 600 };
      default:
        return { width: 400, height: 400 };
    }
  };

  const getPostItColor = () => {
    switch (color) {
      case "Y":
        return "#fef08a"; // yellow
      case "P":
        return "#fbcfe8"; // pink
      case "B":
        return "#bfdbfe"; // blue
      default:
        return "#fef08a";
    }
  };

  const canvasSize = getCanvasSize();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    navigate("/");
    return <div className="p-8 text-center">Redirecting to login...</div>;
  }

  return (
    <>
      <style>{`
        @keyframes heartbeat {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
      {isPlacing && drawingData && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: `translate(-50%, -50%) scale(${zoom})`,
            animation: "heartbeat 1.5s ease-in-out infinite",
          }}
        >
          <PostIt
            drawing={drawingData}
            link={link || null}
            size={size}
            color={color}
            createdAt={new Date().toISOString()}
            expiresAt={new Date().toISOString()}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap"
            style={{
              bottom: `${-32 / zoom}px`,
              transform: `translateX(-50%) scale(${1 / zoom})`,
              transformOrigin: "top center",
            }}
          >
            Click to place • ESC to cancel
          </div>
        </div>
      )}

      {!isPlacing && (
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-8 items-start">
            <div className="flex-shrink-0">
              <div
                className="rounded-lg shadow-lg overflow-hidden relative"
                style={{
                  backgroundColor: getPostItColor(),
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="cursor-crosshair bg-transparent"
                  style={{
                    display: "block",
                  }}
                />
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={paths.length === 0}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Undo
                  </button>
                  <button
                    onClick={clearCanvas}
                    disabled={paths.length === 0}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Brush Color
                    </label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Brush Size: {brushSize}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white shadow-lg rounded-lg  p-6 space-y-4">
              <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Draw a Post-it
              </h1>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Size
                    </label>
                    <select
                      value={size}
                      onChange={(e) => {
                        setSize(e.target.value);
                        clearCanvas();
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                    >
                      <option value="S">Small (400x400)</option>
                      <option value="M">Medium (500x500)</option>
                      <option value="L">Large (600x600)</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Color
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                    >
                      <option value="Y">Yellow</option>
                      <option value="P">Pink</option>
                      <option value="B">Blue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Link (optional)
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Add a URL to make your post-it clickable
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiration
                  </label>
                  <select
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  >
                    <option value="1day">1 day</option>
                    <option value="7days">7 days</option>
                    <option value="30days">30 days</option>
                  </select>
                </div>

                <button
                  onClick={startPlacement}
                  className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Place on Board
                </button>
              </div>

              <p className="mt-4 text-sm text-slate-600 text-center">
                Drawing as: {user.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Draw;
