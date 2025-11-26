"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

const sharedUsers = ["Ali", "Sara", "Omar"];

type Point = { x: number; y: number };
type Stroke = {
  tool: "pen" | "eraser";
  color: string;
  width: number;
  points: Point[];
};

export default function BoardPage() {
  const params = useParams<{ boardId: string | string[] }>();
  const boardId = useMemo(
    () =>
      (Array.isArray(params?.boardId)
        ? params?.boardId[0]
        : params?.boardId) ?? "board",
    [params]
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader />
      <div className="px-6 py-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-500">
            Whiteboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Board #{boardId}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Shared workspace to sketch ideas and collaborate with your team.
          </p>
        </div>

        <Whiteboard />
      </div>
    </div>
  );
}

function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#111827");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const strokesRef = useRef<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStroke = useRef<Stroke | null>(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const repaint = useCallback(
    (preview?: Stroke | null) => {
      const canvas = canvasRef.current;
      const context = getContext();
      if (!canvas || !context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      strokesRef.current.forEach((stroke) => drawStroke(context, stroke));
      if (preview) {
        drawStroke(context, preview);
      }
    },
    [getContext]
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    repaint(currentStroke.current ?? undefined);
  }, [repaint]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    strokesRef.current = strokes;
    console.log("[strokes] total:", strokes.length);
    repaint();
  }, [strokes, repaint]);

  const getPoint = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    const clientY =
      "touches" in event ? event.touches[0].clientY : event.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    const point = getPoint(event);
    const context = getContext();
    if (!point || !context) return;
    setIsDrawing(true);
    currentStroke.current = {
      tool,
      color: tool === "eraser" ? "#ffffff" : color,
      width: tool === "eraser" ? 20 : 4,
      points: [point],
    };
  };

  const handlePointerMove = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !currentStroke.current) return;
    event.preventDefault();
    const point = getPoint(event);
    const context = getContext();
    if (!point || !context) return;
    const stroke = currentStroke.current;
    stroke.points.push(point);
    repaint(stroke);
  };

  const endDrawing = useCallback(() => {
    if (!isDrawing || !currentStroke.current) return;
    setIsDrawing(false);
    const finishedStroke = currentStroke.current;
    currentStroke.current = null;
    if (!finishedStroke || !finishedStroke.points.length) {
      repaint();
      return;
    }
    setStrokes((prev) => {
      const next = [...prev, finishedStroke];
      console.log("[stroke] saved, new total:", next.length);
      return next;
    });
  }, [isDrawing, repaint]);

  useEffect(() => {
    window.addEventListener("mouseup", endDrawing);
    window.addEventListener("touchend", endDrawing);
    return () => {
      window.removeEventListener("mouseup", endDrawing);
      window.removeEventListener("touchend", endDrawing);
    };
  }, [endDrawing]);

  const handleUndo = () => {
    setStrokes((prev) => {
      if (!prev.length) return prev;
      const next = prev.slice(0, -1);
      console.log("[undo] strokes remaining:", next.length);
      return next;
    });
  };

  const handleClear = () => {
    setStrokes((prev) => {
      if (!prev.length) return prev;
      console.log("[clear] cleared all strokes");
      return [];
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div
        ref={containerRef}
        className="relative flex w-full flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          <span className="text-slate-500">Shared with:</span>
          {sharedUsers.map((user, index) => (
            <span
              key={user}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {user}
              {index < sharedUsers.length - 1 ? "," : ""}
            </span>
          ))}
        </div>

        <div className="relative mt-4 flex-1">
          <button
            onClick={handleUndo}
            className="absolute left-4 top-4 z-10 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
          >
            Undo
          </button>
          <button
            onClick={() => alert("Share feature coming soon!")}
            className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 shadow hover:border-teal-200 hover:text-teal-600 transition"
          >
            Share
          </button>

          <canvas
            ref={canvasRef}
            className={`h-full w-full rounded-2xl border border-slate-200 bg-white shadow-inner ${
              tool === "eraser" ? "cursor-cell" : "cursor-crosshair"
            }`}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
          />
          {!strokes.length && !isDrawing && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm uppercase tracking-[0.5em] text-slate-300">
                Canvas
              </span>
              <p className="mt-3 text-2xl font-semibold text-slate-400">
                Start drawing here
              </p>
            </div>
          )}
        </div>
      </div>

      <aside className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl lg:w-[300px]">
        <h2 className="text-lg font-semibold text-slate-900">Tools</h2>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setTool("pen")}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              tool === "pen"
                ? "bg-teal-500 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              tool === "eraser"
                ? "bg-teal-500 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Eraser
          </button>
          <label className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
            Color Picker
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-8 w-8 cursor-pointer rounded-full border border-slate-200 bg-white p-0"
            />
          </label>
          <button
            onClick={handleClear}
            className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Clear Board
          </button>
          <button
            onClick={handleUndo}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Undo Last
          </button>
          <button
            disabled
            className="w-full rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400"
          >
            Shapes (coming soon)
          </button>
          <button
            disabled
            className="w-full rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400"
          >
            Text (coming soon)
          </button>
        </div>
      </aside>
    </div>
  );
}

function drawStroke(
  context: CanvasRenderingContext2D,
  stroke: Stroke | null | undefined
) {
  if (!stroke || !stroke.points || stroke.points.length === 0) {
    return;
  }

  context.save();
  context.strokeStyle = stroke.color;
  context.lineWidth = stroke.width;
  context.lineJoin = "round";
  context.lineCap = "round";

  if (stroke.points.length === 1) {
    const [point] = stroke.points;
    context.beginPath();
    context.arc(point.x, point.y, stroke.width / 2, 0, Math.PI * 2);
    context.fillStyle =
      stroke.tool === "eraser" ? "#ffffff" : stroke.color ?? "#111827";
    context.fill();
    context.restore();
    return;
  }

  context.beginPath();
  context.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i += 1) {
    const point = stroke.points[i];
    context.lineTo(point.x, point.y);
  }
  context.stroke();
  context.restore();
}

