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
  const [expiration, setExpiration] = useState("7 days");
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [simplifyTolerance, setSimplifyTolerance] = useState(1.0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const canvasRef = useRef(null);
  const { user, loading } = useAuth();
  const { setIsBoardInteractive } = useBoard();
  const navigate = useNavigate();

  // Set board to non-interactive on mount, restore on unmount
  useEffect(() => {
    setIsBoardInteractive(false);
    return () => {
      setIsBoardInteractive(true);
    };
  }, [setIsBoardInteractive]);

  useEffect(() => {
    document.title = "Draw · makeapost";
  }, []);

  // Get canvas coordinates from mouse event
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

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed paths
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

    // Draw current path
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

  const generateSVG = (shouldSimplify = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    const width = canvas.width;
    const height = canvas.height;

    let svgPaths = "";
    let pathsToUse = paths;

    // Simplify paths if requested
    if (shouldSimplify) {
      pathsToUse = paths.map((path) => {
        if (path.points.length < 3) return path;

        const simplified = simplify(path.points, simplifyTolerance, true);
        return { ...path, points: simplified };
      });
    }

    pathsToUse.forEach((path) => {
      if (path.points.length < 2) return;

      let pathData = `M ${path.points[0].x} ${path.points[0].y}`;
      for (let i = 1; i < path.points.length; i++) {
        pathData += ` L ${path.points[i].x} ${path.points[i].y}`;
      }

      svgPaths += `<path d="${pathData}" stroke="${path.color}" stroke-width="${path.size}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n`;
    });

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${svgPaths}</svg>`;

    return svg;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = () => {
    if (paths.length === 0) {
      alert("Please draw something first!");
      return;
    }

    // Generate original SVG
    const originalSVG = generateSVG(false);
    const originalSize = new Blob([originalSVG]).size;

    // Generate simplified SVG
    const simplifiedSVG = generateSVG(true);
    const simplifiedSize = new Blob([simplifiedSVG]).size;

    // Calculate reduction
    const reduction = ((originalSize - simplifiedSize) / originalSize) * 100;

    console.log("=".repeat(60));
    console.log("ORIGINAL SVG:");
    console.log("=".repeat(60));
    console.log(originalSVG);
    console.log("\n" + "=".repeat(60));
    console.log("SIMPLIFIED SVG:");
    console.log("=".repeat(60));
    console.log(simplifiedSVG);
    console.log("\n" + "=".repeat(60));
    console.log("SIZE COMPARISON:");
    console.log("=".repeat(60));
    console.log(`Original Size:    ${formatBytes(originalSize)}`);
    console.log(`Simplified Size:  ${formatBytes(simplifiedSize)}`);
    console.log(`Reduction:        ${reduction.toFixed(2)}%`);
    console.log(
      `Saved:            ${formatBytes(originalSize - simplifiedSize)}`,
    );
    console.log("=".repeat(60));

    // Set preview data and show preview
    setPreviewData({
      originalSVG,
      simplifiedSVG,
      originalSize,
      simplifiedSize,
      reduction,
    });
    setShowPreview(true);
  };

  const handleBackToEdit = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  // Get post-it dimensions based on size
  const getCanvasSize = () => {
    switch (size) {
      case "S":
        return { width: 200, height: 200 };
      case "M":
        return { width: 300, height: 300 };
      case "L":
        return { width: 400, height: 400 };
      default:
        return { width: 200, height: 200 };
    }
  };

  // Get post-it background color
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

  // Preview mode
  if (showPreview && previewData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">SVG Comparison</h1>
          <button
            onClick={handleBackToEdit}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            ← Back to Edit
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-slate-600 mb-1">Original Size</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatBytes(previewData.originalSize)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-slate-600 mb-1">Simplified Size</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatBytes(previewData.simplifiedSize)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-slate-600 mb-1">Size Reduction</p>
            <p className="text-2xl font-bold text-green-600">
              {previewData.reduction.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Original */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">
              Original
            </h2>
            <div
              className="rounded-xl shadow-lg overflow-hidden mx-auto"
              style={{
                backgroundColor: getPostItColor(),
                padding: "30px",
                width: "fit-content",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewData.originalSVG }}
                style={{
                  transform: "scale(1.5)",
                  transformOrigin: "center",
                }}
              />
            </div>
            <div className="mt-4 text-center text-sm text-slate-600">
              {formatBytes(previewData.originalSize)}
            </div>
          </div>

          {/* Simplified */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">
              Simplified
            </h2>
            <div
              className="rounded-xl shadow-lg overflow-hidden mx-auto"
              style={{
                backgroundColor: getPostItColor(),
                padding: "30px",
                width: "fit-content",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewData.simplifiedSVG }}
                style={{
                  transform: "scale(1.5)",
                  transformOrigin: "center",
                }}
              />
            </div>
            <div className="mt-4 text-center text-sm text-slate-600">
              {formatBytes(previewData.simplifiedSize)} (
              {previewData.reduction.toFixed(1)}% smaller)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Drawing mode
  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex gap-8 items-start">
          {/* Left side - Drawing Canvas */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Draw Your Post-it
            </h2>
            <div
              className="rounded-xl shadow-lg overflow-hidden relative"
              style={{
                backgroundColor: getPostItColor(),
                padding: "20px",
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

            {/* Drawing tools */}
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

          {/* Right side - Options */}
          <div className="flex-1 bg-white shadow-lg rounded-2xl p-6 space-y-4">
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
                      clearCanvas(); // Clear when changing size
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  >
                    <option value="S">Small (200x200)</option>
                    <option value="M">Medium (300x300)</option>
                    <option value="L">Large (400x400)</option>
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
                  Expiration
                </label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                >
                  <option value="1 hour">1 hour</option>
                  <option value="7 days">7 days</option>
                  <option value="1 year">1 year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Simplify Tolerance: {simplifyTolerance}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={simplifyTolerance}
                  onChange={(e) => setSimplifyTolerance(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Higher = more simplification (smaller file)
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Submit Drawing
              </button>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2">
                  Instructions:
                </h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Click and drag to draw</li>
                  <li>• Use the color picker to change brush color</li>
                  <li>• Adjust brush size with the slider</li>
                  <li>• Adjust simplify tolerance for compression</li>
                  <li>• Click Undo to remove last stroke</li>
                  <li>• Click Clear to start over</li>
                  <li>• Submit to see side-by-side comparison</li>
                </ul>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 text-center">
              Drawing as: {user.name}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Draw;
