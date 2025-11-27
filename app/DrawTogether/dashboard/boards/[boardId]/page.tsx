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

const SHARED_USERS = ["Ali", "Sara", "Omar"];
const TOOLBAR_ITEMS: { label: string; value: Tool }[] = [
  { label: "Pen", value: "pen" },
  { label: "Eraser", value: "eraser" },
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
  { label: "Line", value: "line" },
  { label: "Arrow", value: "arrow" },
  { label: "Text", value: "text" },
];

type Point = { x: number; y: number };
type Tool =
  | "pen"
  | "eraser"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text";

type Stroke = {
  tool: Tool;
  color: string;
  width: number;
  points: Point[];
  text?: string;
};

const SHAPE_TOOLS: Tool[] = ["rectangle", "circle", "line", "arrow"];

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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
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
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const rect = wrapper.getBoundingClientRect();
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
    if (!point) return;

    if (tool === "text") {
      const value =
        typeof window !== "undefined" ? window.prompt("Enter text") : undefined;
      const textValue = value?.trim();
      if (!textValue) return;
      const textStroke: Stroke = {
        tool: "text",
        color,
        width: 1,
        points: [point],
        text: textValue,
      };
      setStrokes((prev) => [...prev, textStroke]);
      return;
    }

    const newStroke: Stroke = {
      tool,
      color: tool === "eraser" ? "#ffffff" : color,
      width: getStrokeWidth(tool),
      points: [point, ...(isShapeTool(tool) ? [point] : [])],
    };

    currentStroke.current = newStroke;
    setIsDrawing(true);
  };

  const handlePointerMove = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !currentStroke.current) return;
    event.preventDefault();
    const point = getPoint(event);
    if (!point) return;

    const activeStroke = currentStroke.current;
    if (isShapeTool(activeStroke.tool)) {
      activeStroke.points[1] = point;
    } else {
      activeStroke.points.push(point);
    }

    repaint(activeStroke);
  };

  const finishStroke = useCallback(() => {
    if (!isDrawing || !currentStroke.current) return;
    setIsDrawing(false);
    const stroke = currentStroke.current;
    currentStroke.current = null;

    if (!stroke) {
      repaint();
      return;
    }

    if (isShapeTool(stroke.tool)) {
      const [start, end] = stroke.points;
      if (!end || pointsAreClose(start, end)) {
        repaint();
        return;
      }
    } else if (stroke.points.length < 2) {
      repaint();
      return;
    }

    setStrokes((prev) => {
      const next = [...prev, stroke];
      console.log("[stroke] saved, new total:", next.length);
      return next;
    });
  }, [isDrawing, repaint]);

  useEffect(() => {
    window.addEventListener("mouseup", finishStroke);
    window.addEventListener("touchend", finishStroke);
    return () => {
      window.removeEventListener("mouseup", finishStroke);
      window.removeEventListener("touchend", finishStroke);
    };
  }, [finishStroke]);

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
        ref={wrapperRef}
        className="relative flex w-full flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          <span className="text-slate-500">Shared with:</span>
          {SHARED_USERS.map((user, index) => (
            <span
              key={user}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {user}
              {index < SHARED_USERS.length - 1 ? "," : ""}
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
              tool === "eraser"
                ? "cursor-cell"
                : tool === "text"
                ? "cursor-text"
                : "cursor-crosshair"
            }`}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={finishStroke}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={finishStroke}
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
          {TOOLBAR_ITEMS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTool(value)}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                tool === value
                  ? "bg-teal-500 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
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
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            More tools coming soon
          </div>
        </div>
      </aside>
    </div>
  );
}

function drawStroke(context: CanvasRenderingContext2D, stroke: Stroke) {
  const [start, end] = stroke.points;
  context.save();

  switch (stroke.tool) {
    case "pen":
    case "eraser": {
      if (stroke.points.length < 2) break;
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i += 1) {
        context.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      context.stroke();
      break;
    }
    case "rectangle": {
      if (!start || !end) break;
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.strokeRect(x, y, width, height);
      break;
    }
    case "circle": {
      if (!start || !end) break;
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radius =
        Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) / 2;
      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.stroke();
      break;
    }
    case "line": {
      if (!start || !end) break;
      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
      break;
    }
    case "arrow": {
      if (!start || !end) break;
      drawArrow(context, start, end, stroke.color, stroke.width);
      break;
    }
    case "text": {
      if (!start || !stroke.text) break;
      context.fillStyle = stroke.color;
      context.font = `${Math.max(stroke.width * 7, 20)}px "Inter", sans-serif`;
      context.textBaseline = "top";
      context.fillText(stroke.text, start.x, start.y);
      break;
    }
    default:
      break;
  }

  context.restore();
}

function drawArrow(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  width: number
) {
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();

  const headLength = 16;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  context.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  context.closePath();
  context.fill();
}

function isShapeTool(tool: Tool) {
  return SHAPE_TOOLS.includes(tool);
}

function getStrokeWidth(tool: Tool) {
  switch (tool) {
    case "eraser":
      return 24;
    case "pen":
      return 4;
    case "line":
    case "arrow":
      return 3;
    case "text":
      return 1;
    default:
      return 2;
  }
}

function pointsAreClose(a?: Point, b?: Point) {
  if (!a || !b) return true;
  return Math.hypot(a.x - b.x, a.y - b.y) < 6;
}