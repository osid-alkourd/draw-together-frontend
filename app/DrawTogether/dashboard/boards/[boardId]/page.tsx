"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

const SHARED_USERS = ["Ali", "Sara", "Omar"];

const TOOLBAR_ITEMS = [
  { label: "Select", value: "select" },
  { label: "Pen", value: "pen" },
  { label: "Eraser", value: "eraser" },
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
  { label: "Line", value: "line" },
  { label: "Arrow", value: "arrow" },
  { label: "Text", value: "text" },
];

// Stroke data structure
type Point = { x: number; y: number };
type Stroke = {
  color: string;
  width: number;
  points: Point[];
};

// Rectangle data structure
type Rectangle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

// Circle data structure
type Circle = {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
};

// Arrow data structure
type Arrow = {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  rotation: number; // Rotation in degrees (0-360)
};

// Line data structure
type Line = {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  rotation: number; // Rotation in degrees (0-360)
};

// Text data structure
type Text = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
};

// Interaction types
type InteractionType = "draw" | "move" | "resize" | "rotate" | null;
type ResizeHandle = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "edge" | "start" | "end" | "rotate";

type InteractionState = {
  type: InteractionType;
  rectangleId: string | null;
  circleId: string | null;
  arrowId: string | null;
  lineId: string | null;
  textId: string | null;
  startPoint: Point;
  startRect: Rectangle | null;
  startCircle: Circle | null;
  startArrow: Arrow | null;
  startLine: Line | null;
  startText: Text | null;
  handle: ResizeHandle | null;
  centerPoint?: Point; // For rotation
  initialAngle?: number; // For rotation
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

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [texts, setTexts] = useState<Text[]>([]);
  const [activeTool, setActiveTool] = useState<string>("pen");
  const [color, setColor] = useState("#111827");
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(null);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>("");
  const [cursor, setCursor] = useState<string>("default");
  const currentStrokeRef = useRef<Stroke | null>(null);
  const currentRectRef = useRef<Rectangle | null>(null);
  const currentCircleRef = useRef<Circle | null>(null);
  const currentArrowRef = useRef<Arrow | null>(null);
  const currentLineRef = useRef<Line | null>(null);
  const interactionRef = useRef<InteractionState | null>(null);

  /**
   * Gets canvas context for drawing
   */
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  /**
   * Generates unique ID for shapes
   */
  const generateId = useCallback((prefix: string = "shape") => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Checks if point is inside rectangle
   */
  const isPointInRectangle = useCallback((point: Point, rect: Rectangle): boolean => {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }, []);

  /**
   * Gets resize handle at point (if any)
   */
  const getResizeHandle = useCallback((point: Point, rect: Rectangle): ResizeHandle | null => {
    const HANDLE_SIZE = 8;
    const handles: { handle: ResizeHandle; x: number; y: number }[] = [
      { handle: "top-left", x: rect.x, y: rect.y },
      { handle: "top-right", x: rect.x + rect.width, y: rect.y },
      { handle: "bottom-left", x: rect.x, y: rect.y + rect.height },
      { handle: "bottom-right", x: rect.x + rect.width, y: rect.y + rect.height },
    ];

    for (const { handle, x, y } of handles) {
      if (
        Math.abs(point.x - x) <= HANDLE_SIZE &&
        Math.abs(point.y - y) <= HANDLE_SIZE
      ) {
        return handle;
      }
    }

    return null;
  }, []);

  /**
   * Checks if point is inside circle
   */
  const isPointInCircle = useCallback((point: Point, circle: Circle): boolean => {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= circle.radius;
  }, []);

  /**
   * Gets resize handle for circle (edge handle)
   */
  const getCircleResizeHandle = useCallback((point: Point, circle: Circle): ResizeHandle | null => {
    const HANDLE_TOLERANCE = 8;
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if point is near the edge (within tolerance)
    if (Math.abs(distance - circle.radius) <= HANDLE_TOLERANCE) {
      return "edge";
    }
    
    return null;
  }, []);

  /**
   * Gets cursor for resize handle
   */
  const getCursorForHandle = useCallback((handle: ResizeHandle): string => {
    switch (handle) {
      case "top-left":
      case "bottom-right":
        return "nwse-resize";
      case "top-right":
      case "bottom-left":
        return "nesw-resize";
      case "edge":
        return "ns-resize";
      case "start":
      case "end":
        return "pointer";
      case "rotate":
        return "grab";
      default:
        return "default";
    }
  }, []);

  /**
   * Gets arrow center point
   */
  const getArrowCenter = useCallback((arrow: Arrow): Point => {
    return {
      x: (arrow.startX + arrow.endX) / 2,
      y: (arrow.startY + arrow.endY) / 2,
    };
  }, []);

  /**
   * Rotates a point around a center
   */
  const rotatePoint = useCallback((x: number, y: number, center: Point, angleDegrees: number): Point => {
    const angle = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - center.x;
    const dy = y - center.y;
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }, []);

  /**
   * Checks if point is on arrow line (for selection)
   */
  const isPointOnArrow = useCallback((point: Point, arrow: Arrow): boolean => {
    const TOLERANCE = 8;
    const dx = arrow.endX - arrow.startX;
    const dy = arrow.endY - arrow.startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return false;
    
    // Calculate distance from point to line segment
    const t = Math.max(0, Math.min(1, ((point.x - arrow.startX) * dx + (point.y - arrow.startY) * dy) / (length * length)));
    const projX = arrow.startX + t * dx;
    const projY = arrow.startY + t * dy;
    const dist = Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
    
    return dist <= TOLERANCE;
  }, []);

  /**
   * Gets arrow handle at point (start, end, or rotate)
   * Accounts for arrow rotation when calculating handle positions
   */
  const getArrowHandle = useCallback((point: Point, arrow: Arrow): ResizeHandle | null => {
    const HANDLE_TOLERANCE = 10;
    const center = getArrowCenter(arrow);
    
    // Get unrotated start and end points
    let unrotatedStart: Point;
    let unrotatedEnd: Point;
    
    if (arrow.rotation !== 0) {
      // Reverse rotation to get original points
      const reverseAngle = -arrow.rotation;
      unrotatedStart = rotatePoint(arrow.startX, arrow.startY, center, reverseAngle);
      unrotatedEnd = rotatePoint(arrow.endX, arrow.endY, center, reverseAngle);
    } else {
      unrotatedStart = { x: arrow.startX, y: arrow.startY };
      unrotatedEnd = { x: arrow.endX, y: arrow.endY };
    }
    
    // Check start point (accounting for rotation)
    const distToStart = Math.sqrt((point.x - arrow.startX) ** 2 + (point.y - arrow.startY) ** 2);
    if (distToStart <= HANDLE_TOLERANCE) return "start";
    
    // Check end point (accounting for rotation)
    const distToEnd = Math.sqrt((point.x - arrow.endX) ** 2 + (point.y - arrow.endY) ** 2);
    if (distToEnd <= HANDLE_TOLERANCE) return "end";
    
    // Check rotation handle (above arrow, perpendicular to line)
    const lineAngle = Math.atan2(unrotatedEnd.y - unrotatedStart.y, unrotatedEnd.x - unrotatedStart.x);
    const ROTATION_HANDLE_OFFSET = 30;
    const rotX = center.x - ROTATION_HANDLE_OFFSET * Math.sin(lineAngle);
    const rotY = center.y + ROTATION_HANDLE_OFFSET * Math.cos(lineAngle);
    
    // Apply rotation to rotation handle position
    let finalRotX = rotX;
    let finalRotY = rotY;
    if (arrow.rotation !== 0) {
      const rotated = rotatePoint(rotX, rotY, center, arrow.rotation);
      finalRotX = rotated.x;
      finalRotY = rotated.y;
    }
    
    const distToRot = Math.sqrt((point.x - finalRotX) ** 2 + (point.y - finalRotY) ** 2);
    if (distToRot <= HANDLE_TOLERANCE) return "rotate";
    
    return null;
  }, [getArrowCenter, rotatePoint]);

  /**
   * Draws an arrow on canvas with rotation support
   * Arrows are stored with rotated positions, so we draw them directly
   */
  const drawArrow = useCallback((context: CanvasRenderingContext2D, arrow: Arrow) => {
    context.save();
    
    // Draw arrow line (points are already in their rotated positions)
    context.strokeStyle = arrow.color;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(arrow.startX, arrow.startY);
    context.lineTo(arrow.endX, arrow.endY);
    context.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(arrow.endY - arrow.startY, arrow.endX - arrow.startX);
    const headLength = 16;
    context.fillStyle = arrow.color;
    context.beginPath();
    context.moveTo(arrow.endX, arrow.endY);
    context.lineTo(
      arrow.endX - headLength * Math.cos(angle - Math.PI / 6),
      arrow.endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    context.lineTo(
      arrow.endX - headLength * Math.cos(angle + Math.PI / 6),
      arrow.endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    context.closePath();
    context.fill();
    
    context.restore();
  }, []);

  /**
   * Gets line center point
   */
  const getLineCenter = useCallback((line: Line): Point => {
    return {
      x: (line.startX + line.endX) / 2,
      y: (line.startY + line.endY) / 2,
    };
  }, []);

  /**
   * Checks if point is on line (for selection)
   */
  const isPointOnLine = useCallback((point: Point, line: Line): boolean => {
    const TOLERANCE = 8;
    const dx = line.endX - line.startX;
    const dy = line.endY - line.startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return false;
    
    // Calculate distance from point to line segment
    const t = Math.max(0, Math.min(1, ((point.x - line.startX) * dx + (point.y - line.startY) * dy) / (length * length)));
    const projX = line.startX + t * dx;
    const projY = line.startY + t * dy;
    const dist = Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
    
    return dist <= TOLERANCE;
  }, []);

  /**
   * Erases shapes at the given point - partial erasing
   * Removes only the parts that the eraser passes over
   */
  const eraseAtPoint = useCallback((point: Point) => {
    const ERASER_RADIUS = 15; // Eraser radius for partial erasing

    // Partial erase strokes - remove points within eraser radius
    setStrokes((prev) => {
      const newStrokes: Stroke[] = [];
      
      for (const stroke of prev) {
        // Filter out points within eraser radius
        const remainingPoints = stroke.points.filter((strokePoint) => {
          const dx = point.x - strokePoint.x;
          const dy = point.y - strokePoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance > ERASER_RADIUS;
        });

        if (remainingPoints.length === 0) {
          // All points erased, skip this stroke
          continue;
        } else if (remainingPoints.length === stroke.points.length) {
          // No points erased, keep stroke as is
          newStrokes.push(stroke);
        } else {
          // Some points erased - split into multiple strokes if there are gaps
          const segments: Point[][] = [];
          let currentSegment: Point[] = [];

          for (let i = 0; i < stroke.points.length; i++) {
            const strokePoint = stroke.points[i];
            const dx = point.x - strokePoint.x;
            const dy = point.y - strokePoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > ERASER_RADIUS) {
              // Point is not erased, add to current segment
              currentSegment.push(strokePoint);
            } else {
              // Point is erased
              if (currentSegment.length > 0) {
                // Save current segment and start new one
                segments.push(currentSegment);
                currentSegment = [];
              }
            }
          }

          // Add final segment if it exists
          if (currentSegment.length > 0) {
            segments.push(currentSegment);
          }

          // Create new strokes from segments (only if segment has at least 2 points)
          for (const segment of segments) {
            if (segment.length >= 2) {
              newStrokes.push({
                color: stroke.color,
                width: stroke.width,
                points: segment,
              });
            }
          }
        }
      }

      return newStrokes;
    });

    // For geometric shapes, convert to strokes when erased so they can be partially erased
    // Check lines (from last to first)
    setLines((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        const line = prev[i];
        if (isPointOnLine(point, line)) {
          if (selectedLineId === line.id) {
            setSelectedLineId(null);
          }
          
          // Convert line to stroke points for partial erasing
          const numPoints = Math.max(20, Math.floor(Math.sqrt(
            Math.pow(line.endX - line.startX, 2) + Math.pow(line.endY - line.startY, 2)
          ) / 5));
          const strokePoints: Point[] = [];
          
          for (let j = 0; j <= numPoints; j++) {
            const t = j / numPoints;
            strokePoints.push({
              x: line.startX + (line.endX - line.startX) * t,
              y: line.startY + (line.endY - line.startY) * t,
            });
          }
          
          // Remove the line and add as stroke
          setStrokes((strokePrev) => [
            ...strokePrev,
            {
              color: line.color,
              width: 2,
              points: strokePoints,
            },
          ]);
          
          return prev.filter((l) => l.id !== line.id);
        }
      }
      return prev;
    });

    // Check arrows (from last to first)
    setArrows((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        const arrow = prev[i];
        if (isPointOnArrow(point, arrow)) {
          if (selectedArrowId === arrow.id) {
            setSelectedArrowId(null);
          }
          
          // Convert arrow to stroke points
          const numPoints = Math.max(20, Math.floor(Math.sqrt(
            Math.pow(arrow.endX - arrow.startX, 2) + Math.pow(arrow.endY - arrow.startY, 2)
          ) / 5));
          const strokePoints: Point[] = [];
          
          for (let j = 0; j <= numPoints; j++) {
            const t = j / numPoints;
            strokePoints.push({
              x: arrow.startX + (arrow.endX - arrow.startX) * t,
              y: arrow.startY + (arrow.endY - arrow.startY) * t,
            });
          }
          
          setStrokes((strokePrev) => [
            ...strokePrev,
            {
              color: arrow.color,
              width: 2,
              points: strokePoints,
            },
          ]);
          
          return prev.filter((a) => a.id !== arrow.id);
        }
      }
      return prev;
    });

    // Check circles (from last to first)
    setCircles((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        const circle = prev[i];
        if (isPointInCircle(point, circle)) {
          if (selectedCircleId === circle.id) {
            setSelectedCircleId(null);
          }
          
          // Convert circle to stroke points (circumference)
          const numPoints = Math.max(40, Math.floor(2 * Math.PI * circle.radius / 5));
          const strokePoints: Point[] = [];
          
          for (let j = 0; j <= numPoints; j++) {
            const angle = (j / numPoints) * 2 * Math.PI;
            strokePoints.push({
              x: circle.x + circle.radius * Math.cos(angle),
              y: circle.y + circle.radius * Math.sin(angle),
            });
          }
          
          setStrokes((strokePrev) => [
            ...strokePrev,
            {
              color: circle.color,
              width: 2,
              points: strokePoints,
            },
          ]);
          
          return prev.filter((c) => c.id !== circle.id);
        }
      }
      return prev;
    });

    // Check rectangles (from last to first)
    setRectangles((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        const rect = prev[i];
        if (isPointInRectangle(point, rect)) {
          if (selectedRectangleId === rect.id) {
            setSelectedRectangleId(null);
          }
          
          // Convert rectangle to stroke points (perimeter)
          const perimeter = 2 * (rect.width + rect.height);
          const numPoints = Math.max(40, Math.floor(perimeter / 5));
          const strokePoints: Point[] = [];
          
          // Top edge
          const topPoints = Math.floor((rect.width / perimeter) * numPoints);
          for (let j = 0; j <= topPoints; j++) {
            strokePoints.push({
              x: rect.x + (rect.width * j) / topPoints,
              y: rect.y,
            });
          }
          
          // Right edge
          const rightPoints = Math.floor((rect.height / perimeter) * numPoints);
          for (let j = 1; j <= rightPoints; j++) {
            strokePoints.push({
              x: rect.x + rect.width,
              y: rect.y + (rect.height * j) / rightPoints,
            });
          }
          
          // Bottom edge
          const bottomPoints = Math.floor((rect.width / perimeter) * numPoints);
          for (let j = 1; j <= bottomPoints; j++) {
            strokePoints.push({
              x: rect.x + rect.width - (rect.width * j) / bottomPoints,
              y: rect.y + rect.height,
            });
          }
          
          // Left edge
          const leftPoints = Math.floor((rect.height / perimeter) * numPoints);
          for (let j = 1; j < leftPoints; j++) {
            strokePoints.push({
              x: rect.x,
              y: rect.y + rect.height - (rect.height * j) / leftPoints,
            });
          }
          
          setStrokes((strokePrev) => [
            ...strokePrev,
            {
              color: rect.color,
              width: 2,
              points: strokePoints,
            },
          ]);
          
          return prev.filter((r) => r.id !== rect.id);
        }
      }
      return prev;
    });
  }, [selectedLineId, selectedArrowId, selectedCircleId, selectedRectangleId, isPointOnLine, isPointOnArrow, isPointInCircle, isPointInRectangle]);

  /**
   * Gets line handle at point (start, end, or rotate)
   * Accounts for line rotation when calculating handle positions
   */
  const getLineHandle = useCallback((point: Point, line: Line): ResizeHandle | null => {
    const HANDLE_TOLERANCE = 10;
    const center = getLineCenter(line);
    
    // Get unrotated start and end points
    let unrotatedStart: Point;
    let unrotatedEnd: Point;
    
    if (line.rotation !== 0) {
      // Reverse rotation to get original points
      const reverseAngle = -line.rotation;
      unrotatedStart = rotatePoint(line.startX, line.startY, center, reverseAngle);
      unrotatedEnd = rotatePoint(line.endX, line.endY, center, reverseAngle);
    } else {
      unrotatedStart = { x: line.startX, y: line.startY };
      unrotatedEnd = { x: line.endX, y: line.endY };
    }
    
    // Check start point (accounting for rotation)
    const distToStart = Math.sqrt((point.x - line.startX) ** 2 + (point.y - line.startY) ** 2);
    if (distToStart <= HANDLE_TOLERANCE) return "start";
    
    // Check end point (accounting for rotation)
    const distToEnd = Math.sqrt((point.x - line.endX) ** 2 + (point.y - line.endY) ** 2);
    if (distToEnd <= HANDLE_TOLERANCE) return "end";
    
    // Check rotation handle (above line, perpendicular to line)
    const lineAngle = Math.atan2(unrotatedEnd.y - unrotatedStart.y, unrotatedEnd.x - unrotatedStart.x);
    const ROTATION_HANDLE_OFFSET = 30;
    const rotX = center.x - ROTATION_HANDLE_OFFSET * Math.sin(lineAngle);
    const rotY = center.y + ROTATION_HANDLE_OFFSET * Math.cos(lineAngle);
    
    // Apply rotation to rotation handle position
    let finalRotX = rotX;
    let finalRotY = rotY;
    if (line.rotation !== 0) {
      const rotated = rotatePoint(rotX, rotY, center, line.rotation);
      finalRotX = rotated.x;
      finalRotY = rotated.y;
    }
    
    const distToRot = Math.sqrt((point.x - finalRotX) ** 2 + (point.y - finalRotY) ** 2);
    if (distToRot <= HANDLE_TOLERANCE) return "rotate";
    
    return null;
  }, [getLineCenter, rotatePoint]);

  /**
   * Draws a line on canvas with rotation support
   * Lines are stored with rotated positions, so we draw them directly
   */
  const drawLine = useCallback((context: CanvasRenderingContext2D, line: Line) => {
    context.save();
    
    // Draw line (points are already in their rotated positions)
    context.strokeStyle = line.color;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(line.startX, line.startY);
    context.lineTo(line.endX, line.endY);
    context.stroke();
    
    context.restore();
  }, []);

  /**
   * Checks if point is within text bounds
   */
  const isPointInText = useCallback((point: Point, text: Text): boolean => {
    const context = getContext();
    if (!context) return false;
    
    context.font = `${text.fontSize}px Arial`;
    const metrics = context.measureText(text.text);
    const textWidth = metrics.width;
    const textHeight = text.fontSize;
    
    return (
      point.x >= text.x &&
      point.x <= text.x + textWidth &&
      point.y >= text.y - textHeight &&
      point.y <= text.y
    );
  }, [getContext]);

  /**
   * Draws text on canvas
   */
  const drawText = useCallback((context: CanvasRenderingContext2D, text: Text) => {
    context.save();
    
    context.font = `${text.fontSize}px Arial`;
    context.fillStyle = text.color;
    context.textBaseline = "bottom";
    context.fillText(text.text, text.x, text.y);
    
    context.restore();
  }, []);

  /**
   * Redraws all strokes and rectangles on canvas
   */
  const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const context = getContext();
      if (!canvas || !context) return;

    // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all stored strokes (pen drawings)
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        context.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      context.stroke();
    });

    // Draw all stored rectangles
    rectangles.forEach((rect) => {
      context.strokeStyle = rect.color;
      context.lineWidth = 2;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });

    // Draw all stored circles
    circles.forEach((circle) => {
      context.strokeStyle = circle.color;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      context.stroke();
    });

    // Draw all stored arrows
    arrows.forEach((arrow) => {
      drawArrow(context, arrow);
    });

    // Draw all stored lines
    lines.forEach((line) => {
      drawLine(context, line);
    });

    // Draw all stored texts
    texts.forEach((text) => {
      drawText(context, text);
    });

    // Draw current stroke if drawing (pen)
    if (isDrawing && currentStrokeRef.current && activeTool === "pen") {
      const stroke = currentStrokeRef.current;
      if (stroke.points.length >= 2) {
        context.strokeStyle = stroke.color;
        context.lineWidth = stroke.width;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length; i++) {
          context.lineTo(stroke.points[i].x, stroke.points[i].y);
        }

        context.stroke();
      }
    }

    // Draw current rectangle preview if drawing
    if (currentRectRef.current && activeTool === "rectangle") {
      const rect = currentRectRef.current;
      context.strokeStyle = rect.color;
      context.lineWidth = 2;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    // Draw current circle preview if drawing
    if (currentCircleRef.current && activeTool === "circle") {
      const circle = currentCircleRef.current;
      context.strokeStyle = circle.color;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      context.stroke();
    }

    // Draw current arrow preview if drawing
    if (currentArrowRef.current && activeTool === "arrow") {
      drawArrow(context, currentArrowRef.current);
    }

    // Draw current line preview if drawing
    if (currentLineRef.current && activeTool === "line") {
      drawLine(context, currentLineRef.current);
    }

    // Draw selection border and resize handles for selected rectangle
    if (selectedRectangleId) {
      const selectedRect = rectangles.find((r) => r.id === selectedRectangleId);
      if (selectedRect) {
        // Draw selection border
        context.strokeStyle = "#0f172a";
        context.lineWidth = 1.5;
        context.setLineDash([8, 6]);
        context.strokeRect(selectedRect.x, selectedRect.y, selectedRect.width, selectedRect.height);
        context.setLineDash([]);

        // Draw resize handles
        const handles: { handle: ResizeHandle; x: number; y: number }[] = [
          { handle: "top-left", x: selectedRect.x, y: selectedRect.y },
          { handle: "top-right", x: selectedRect.x + selectedRect.width, y: selectedRect.y },
          { handle: "bottom-left", x: selectedRect.x, y: selectedRect.y + selectedRect.height },
          { handle: "bottom-right", x: selectedRect.x + selectedRect.width, y: selectedRect.y + selectedRect.height },
        ];

        handles.forEach(({ x, y }) => {
          context.fillStyle = "#14b8a6";
          context.strokeStyle = "#ffffff";
          context.lineWidth = 2;
          context.beginPath();
          context.arc(x, y, 5, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        });
      }
    }

    // Draw selection ring and resize handle for selected circle
    if (selectedCircleId) {
      const selectedCircle = circles.find((c) => c.id === selectedCircleId);
      if (selectedCircle) {
        // Draw selection ring
        context.strokeStyle = "#0f172a";
        context.lineWidth = 1.5;
        context.setLineDash([8, 6]);
        context.beginPath();
        context.arc(selectedCircle.x, selectedCircle.y, selectedCircle.radius, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);

        // Draw resize handle on edge (right side)
        const handleX = selectedCircle.x + selectedCircle.radius;
        const handleY = selectedCircle.y;
        context.fillStyle = "#14b8a6";
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(handleX, handleY, 5, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      }
    }

    // Draw selection and handles for selected arrow
    if (selectedArrowId) {
      const selectedArrow = arrows.find((a) => a.id === selectedArrowId);
      if (selectedArrow) {
        const center = getArrowCenter(selectedArrow);
        
        // Draw selection line (dashed)
        context.strokeStyle = "#0f172a";
        context.lineWidth = 1.5;
        context.setLineDash([8, 6]);
        context.beginPath();
        context.moveTo(selectedArrow.startX, selectedArrow.startY);
        context.lineTo(selectedArrow.endX, selectedArrow.endY);
        context.stroke();
        context.setLineDash([]);

        // Draw handles: start, end, and rotation
        // Calculate rotation handle position accounting for arrow rotation
        const unrotatedStart = selectedArrow.rotation !== 0 
          ? rotatePoint(selectedArrow.startX, selectedArrow.startY, center, -selectedArrow.rotation)
          : { x: selectedArrow.startX, y: selectedArrow.startY };
        const unrotatedEnd = selectedArrow.rotation !== 0
          ? rotatePoint(selectedArrow.endX, selectedArrow.endY, center, -selectedArrow.rotation)
          : { x: selectedArrow.endX, y: selectedArrow.endY };
        
        const lineAngle = Math.atan2(unrotatedEnd.y - unrotatedStart.y, unrotatedEnd.x - unrotatedStart.x);
        const ROTATION_HANDLE_OFFSET = 30;
        const rotX = center.x - ROTATION_HANDLE_OFFSET * Math.sin(lineAngle);
        const rotY = center.y + ROTATION_HANDLE_OFFSET * Math.cos(lineAngle);
        
        // Apply rotation to rotation handle if arrow is rotated
        let finalRotX = rotX;
        let finalRotY = rotY;
        if (selectedArrow.rotation !== 0) {
          const rotated = rotatePoint(rotX, rotY, center, selectedArrow.rotation);
          finalRotX = rotated.x;
          finalRotY = rotated.y;
        }

        const handles = [
          { x: selectedArrow.startX, y: selectedArrow.startY, color: "#14b8a6" },
          { x: selectedArrow.endX, y: selectedArrow.endY, color: "#14b8a6" },
          { x: finalRotX, y: finalRotY, color: "#8b5cf6" }, // Purple for rotation handle
        ];

        handles.forEach(({ x, y, color: handleColor }) => {
          context.fillStyle = handleColor;
          context.strokeStyle = "#ffffff";
          context.lineWidth = 2;
          context.beginPath();
          context.arc(x, y, 5, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        });
      }
    }

    // Draw selection and handles for selected line
    if (selectedLineId) {
      const selectedLine = lines.find((l) => l.id === selectedLineId);
      if (selectedLine) {
        const center = getLineCenter(selectedLine);
        
        // Draw selection line (dashed)
        context.strokeStyle = "#0f172a";
        context.lineWidth = 1.5;
        context.setLineDash([8, 6]);
        context.beginPath();
        context.moveTo(selectedLine.startX, selectedLine.startY);
        context.lineTo(selectedLine.endX, selectedLine.endY);
        context.stroke();
        context.setLineDash([]);

        // Draw handles: start, end, and rotation
        // Calculate rotation handle position accounting for line rotation
        const unrotatedStart = selectedLine.rotation !== 0 
          ? rotatePoint(selectedLine.startX, selectedLine.startY, center, -selectedLine.rotation)
          : { x: selectedLine.startX, y: selectedLine.startY };
        const unrotatedEnd = selectedLine.rotation !== 0
          ? rotatePoint(selectedLine.endX, selectedLine.endY, center, -selectedLine.rotation)
          : { x: selectedLine.endX, y: selectedLine.endY };
        
        const lineAngle = Math.atan2(unrotatedEnd.y - unrotatedStart.y, unrotatedEnd.x - unrotatedStart.x);
        const ROTATION_HANDLE_OFFSET = 30;
        const rotX = center.x - ROTATION_HANDLE_OFFSET * Math.sin(lineAngle);
        const rotY = center.y + ROTATION_HANDLE_OFFSET * Math.cos(lineAngle);
        
        // Apply rotation to rotation handle if line is rotated
        let finalRotX = rotX;
        let finalRotY = rotY;
        if (selectedLine.rotation !== 0) {
          const rotated = rotatePoint(rotX, rotY, center, selectedLine.rotation);
          finalRotX = rotated.x;
          finalRotY = rotated.y;
        }

        const handles = [
          { x: selectedLine.startX, y: selectedLine.startY, color: "#14b8a6" },
          { x: selectedLine.endX, y: selectedLine.endY, color: "#14b8a6" },
          { x: finalRotX, y: finalRotY, color: "#8b5cf6" }, // Purple for rotation handle
        ];

        handles.forEach(({ x, y, color: handleColor }) => {
          context.fillStyle = handleColor;
          context.strokeStyle = "#ffffff";
          context.lineWidth = 2;
          context.beginPath();
          context.arc(x, y, 5, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        });
      }
    }

    // Draw selection border for selected text
    if (selectedTextId) {
      const selectedText = texts.find((t) => t.id === selectedTextId);
      if (selectedText) {
        context.font = `${selectedText.fontSize}px Arial`;
        const metrics = context.measureText(selectedText.text);
        const textWidth = metrics.width;
        const textHeight = selectedText.fontSize;
        
        // Draw selection border (dashed rectangle)
        context.strokeStyle = "#0f172a";
        context.lineWidth = 1.5;
        context.setLineDash([8, 6]);
        context.strokeRect(
          selectedText.x - 2,
          selectedText.y - textHeight - 2,
          textWidth + 4,
          textHeight + 4
        );
        context.setLineDash([]);
      }
    }
  }, [strokes, rectangles, circles, arrows, lines, texts, isDrawing, activeTool, selectedRectangleId, selectedCircleId, selectedArrowId, selectedLineId, selectedTextId, getContext, drawArrow, drawLine, drawText, getArrowCenter, getLineCenter, rotatePoint]);

  /**
   * Resizes canvas to match container
   */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    redrawCanvas();
  }, [redrawCanvas]);

  // Resize canvas on mount and window resize
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Redraw when strokes or rectangles change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  /**
   * Gets mouse/touch point relative to canvas
   */
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

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  /**
   * Handles mouse down - starts drawing or interaction based on tool
   */
  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    const point = getPoint(event);
    if (!point) return;

    // Eraser tool - erase shapes at point
    if (activeTool === "eraser") {
      eraseAtPoint(point);
      setIsDrawing(true); // Track that erasing is active
      return;
    }

    // Pen tool - start drawing stroke
    if (activeTool === "pen") {
      const newStroke: Stroke = {
        color,
        width: 4,
        points: [point],
      };
      currentStrokeRef.current = newStroke;
      setIsDrawing(true);
      return;
    }

    // Rectangle tool - check for selection/resize first, then draw
    if (activeTool === "rectangle") {
      // Don't draw new rectangle if one is selected
      if (selectedRectangleId) {
        const selectedRect = rectangles.find((r) => r.id === selectedRectangleId);
        if (selectedRect) {
          // Check for resize handle
          const handle = getResizeHandle(point, selectedRect);
          if (handle) {
            interactionRef.current = {
              type: "resize",
              rectangleId: selectedRect.id,
              circleId: null,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: { ...selectedRect },
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: null,
          handle,
            };
            return;
          }

          // Check if clicking on rectangle body (move)
          if (isPointInRectangle(point, selectedRect)) {
            interactionRef.current = {
              type: "move",
              rectangleId: selectedRect.id,
              circleId: null,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: { ...selectedRect },
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: null,
              handle: null,
            };
        return;
      }
        }
      }

      // Check if clicking on any rectangle (select)
      for (let i = rectangles.length - 1; i >= 0; i--) {
        const rect = rectangles[i];
        if (isPointInRectangle(point, rect)) {
          setSelectedRectangleId(rect.id);
          // Check for resize handle
          const handle = getResizeHandle(point, rect);
          if (handle) {
            interactionRef.current = {
              type: "resize",
              rectangleId: rect.id,
              circleId: null,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: { ...rect },
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: null,
              handle,
            };
      } else {
            // Start move
            interactionRef.current = {
              type: "move",
              rectangleId: rect.id,
              circleId: null,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: { ...rect },
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: null,
              handle: null,
            };
          }
          return;
        }
      }

      // Clicked empty space - deselect and start new rectangle
      setSelectedRectangleId(null);
      const newRect: Rectangle = {
        id: generateId("rect"),
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color,
      };
      currentRectRef.current = newRect;
      interactionRef.current = {
        type: "draw",
        rectangleId: newRect.id,
        circleId: null,
        arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: null,
              handle: null,
            };
      setIsDrawing(true);
    }

    // Circle tool - check for selection/resize first, then draw
    if (activeTool === "circle") {
      // Don't draw new circle if one is selected
      if (selectedCircleId) {
        const selectedCircle = circles.find((c) => c.id === selectedCircleId);
        if (selectedCircle) {
          // Check for resize handle (edge)
          const handle = getCircleResizeHandle(point, selectedCircle);
          if (handle) {
            interactionRef.current = {
              type: "resize",
              rectangleId: null,
              circleId: selectedCircle.id,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: { ...selectedCircle },
              startArrow: null,
              startLine: null,
              startText: null,
              handle,
            };
            return;
          }

          // Check if clicking on circle body (move)
          if (isPointInCircle(point, selectedCircle)) {
            interactionRef.current = {
              type: "move",
              rectangleId: null,
              circleId: selectedCircle.id,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: { ...selectedCircle },
              startArrow: null,
              startLine: null,
              startText: null,
              handle: null,
            };
            return;
          }
        }
      }

      // Check if clicking on any circle (select)
      for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        if (isPointInCircle(point, circle)) {
          setSelectedCircleId(circle.id);
          // Check for resize handle
          const handle = getCircleResizeHandle(point, circle);
          if (handle) {
            interactionRef.current = {
              type: "resize",
              rectangleId: null,
              circleId: circle.id,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: { ...circle },
              startArrow: null,
              startLine: null,
              startText: null,
              handle,
            };
          } else {
            // Start move
            interactionRef.current = {
              type: "move",
              rectangleId: null,
              circleId: circle.id,
              arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: { ...circle },
              startArrow: null,
              startLine: null,
              startText: null,
              handle: null,
            };
          }
      return;
    }
      }

      // Clicked empty space - deselect and start new circle (center at click point)
      setSelectedCircleId(null);
      const newCircle: Circle = {
        id: generateId("circle"),
        x: point.x,
        y: point.y,
        radius: 0,
        color,
      };
      currentCircleRef.current = newCircle;
      interactionRef.current = {
        type: "draw",
        rectangleId: null,
        circleId: newCircle.id,
        arrowId: null,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: null,
              handle: null,
            };
      setIsDrawing(true);
    }

    // Arrow tool - check for selection/resize/rotate first, then draw
    if (activeTool === "arrow") {
      // Don't draw new arrow if one is selected
      if (selectedArrowId) {
        const selectedArrow = arrows.find((a) => a.id === selectedArrowId);
        if (selectedArrow) {
          // Check for handles (start, end, rotate)
          const handle = getArrowHandle(point, selectedArrow);
          if (handle) {
            const center = getArrowCenter(selectedArrow);
            if (handle === "rotate") {
              // Start rotation
              const dx = point.x - center.x;
              const dy = point.y - center.y;
              const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
              interactionRef.current = {
                type: "rotate",
                rectangleId: null,
                circleId: null,
                arrowId: selectedArrow.id,
                lineId: null,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: { ...selectedArrow },
              startLine: null,
              startText: null,
              handle: "rotate",
              centerPoint: center,
                initialAngle: currentAngle - selectedArrow.rotation,
              };
            } else {
              // Start resize (start or end handle)
              interactionRef.current = {
                type: "resize",
                rectangleId: null,
                circleId: null,
                arrowId: selectedArrow.id,
                lineId: null,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: { ...selectedArrow },
              startLine: null,
              startText: null,
              handle,
              };
            }
      return;
    }

          // Check if clicking on arrow body (move)
          if (isPointOnArrow(point, selectedArrow)) {
            interactionRef.current = {
              type: "move",
              rectangleId: null,
              circleId: null,
              arrowId: selectedArrow.id,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: null,
              startArrow: { ...selectedArrow },
              startLine: null,
              startText: null,
              handle: null,
            };
      return;
    }
        }
      }

      // Check if clicking on any arrow (select)
      for (let i = arrows.length - 1; i >= 0; i--) {
        const arrow = arrows[i];
        if (isPointOnArrow(point, arrow)) {
          setSelectedArrowId(arrow.id);
          // Check for handles
          const handle = getArrowHandle(point, arrow);
          if (handle) {
            const center = getArrowCenter(arrow);
            if (handle === "rotate") {
              // Start rotation
              const dx = point.x - center.x;
              const dy = point.y - center.y;
              const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
              interactionRef.current = {
                type: "rotate",
                rectangleId: null,
                circleId: null,
                arrowId: arrow.id,
                lineId: null,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: { ...arrow },
              startLine: null,
              startText: null,
              handle: "rotate",
              centerPoint: center,
                initialAngle: currentAngle - arrow.rotation,
              };
            } else {
              // Start resize
              interactionRef.current = {
                type: "resize",
                rectangleId: null,
                circleId: null,
                arrowId: arrow.id,
                lineId: null,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: { ...arrow },
                startLine: null,
                startText: null,
                handle,
              };
            }
          } else {
            // Start move
            interactionRef.current = {
              type: "move",
              rectangleId: null,
              circleId: null,
              arrowId: arrow.id,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: null,
              startArrow: { ...arrow },
              startLine: null,
              startText: null,
              handle: null,
            };
          }
      return;
        }
      }

      // Clicked empty space - deselect and start new arrow
      setSelectedArrowId(null);
      const newArrow: Arrow = {
        id: generateId("arrow"),
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y,
        color,
        rotation: 0,
      };
      currentArrowRef.current = newArrow;
      interactionRef.current = {
        type: "draw",
        rectangleId: null,
        circleId: null,
        arrowId: newArrow.id,
              lineId: null,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: null,
              handle: null,
            };
    setIsDrawing(true);
    }

    // Line tool - check for selection/resize/rotate first, then draw
    if (activeTool === "line") {
      // Don't draw new line if one is selected
      if (selectedLineId) {
        const selectedLine = lines.find((l) => l.id === selectedLineId);
        if (selectedLine) {
          // Check for handles (start, end, rotate)
          const handle = getLineHandle(point, selectedLine);
          if (handle) {
            const center = getLineCenter(selectedLine);
            if (handle === "rotate") {
              // Start rotation
              const dx = point.x - center.x;
              const dy = point.y - center.y;
              const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
              interactionRef.current = {
                type: "rotate",
                rectangleId: null,
                circleId: null,
                arrowId: null,
                lineId: selectedLine.id,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: null,
                startLine: { ...selectedLine },
                startText: null,
                handle: "rotate",
                centerPoint: center,
                initialAngle: currentAngle - selectedLine.rotation,
              };
            } else {
              // Start resize (start or end handle)
              interactionRef.current = {
                type: "resize",
                rectangleId: null,
                circleId: null,
                arrowId: null,
                lineId: selectedLine.id,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: null,
                startLine: { ...selectedLine },
                startText: null,
                handle,
              };
            }
      return;
    }

          // Check if clicking on line body (move)
          if (isPointOnLine(point, selectedLine)) {
            interactionRef.current = {
              type: "move",
              rectangleId: null,
              circleId: null,
              arrowId: null,
                lineId: selectedLine.id,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: null,
                startLine: { ...selectedLine },
                startText: null,
                handle: null,
            };
      return;
          }
        }
      }

      // Check if clicking on any line (select)
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (isPointOnLine(point, line)) {
          setSelectedLineId(line.id);
          // Check for handles
          const handle = getLineHandle(point, line);
          if (handle) {
            const center = getLineCenter(line);
            if (handle === "rotate") {
              // Start rotation
              const dx = point.x - center.x;
              const dy = point.y - center.y;
              const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
              interactionRef.current = {
                type: "rotate",
                rectangleId: null,
                circleId: null,
                arrowId: null,
                lineId: line.id,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: null,
                startLine: { ...line },
                startText: null,
                handle: "rotate",
                centerPoint: center,
                initialAngle: currentAngle - line.rotation,
              };
            } else {
              // Start resize
              interactionRef.current = {
                type: "resize",
                rectangleId: null,
                circleId: null,
                arrowId: null,
                lineId: line.id,
                textId: null,
                startPoint: point,
                startRect: null,
                startCircle: null,
                startArrow: null,
                startLine: { ...line },
                startText: null,
                handle,
              };
            }
          } else {
            // Start move
            interactionRef.current = {
              type: "move",
              rectangleId: null,
              circleId: null,
              arrowId: null,
              lineId: line.id,
              textId: null,
              startPoint: point,
              startRect: null,
              startCircle: null,
              startArrow: null,
              startLine: { ...line },
              startText: null,
              handle: null,
            };
          }
          return;
        }
      }

      // Clicked empty space - deselect and start new line
      setSelectedLineId(null);
      const newLine: Line = {
        id: generateId("line"),
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y,
        color,
        rotation: 0,
      };
      currentLineRef.current = newLine;
      interactionRef.current = {
        type: "draw",
        rectangleId: null,
        circleId: null,
        arrowId: null,
        lineId: newLine.id,
        textId: null,
        startPoint: point,
        startRect: null,
        startCircle: null,
        startArrow: null,
        startLine: null,
        startText: null,
        handle: null,
      };
    setIsDrawing(true);
    }

    // Text tool - check for selection/move first, then add new text
    if (activeTool === "text") {
      // Don't add new text if one is selected
      if (selectedTextId) {
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (selectedText) {
          // Check if clicking on text body (move)
          if (isPointInText(point, selectedText)) {
            interactionRef.current = {
              type: "move",
              rectangleId: null,
              circleId: null,
              arrowId: null,
              lineId: null,
              textId: selectedText.id,
              startPoint: point,
              startRect: null,
              startCircle: null,
              startArrow: null,
              startLine: null,
              startText: { ...selectedText },
              handle: null,
            };
            return;
          }
        }
      }

      // Check if clicking on any text (select)
      for (let i = texts.length - 1; i >= 0; i--) {
        const text = texts[i];
        if (isPointInText(point, text)) {
          setSelectedTextId(text.id);
          // Start move
          interactionRef.current = {
            type: "move",
            rectangleId: null,
            circleId: null,
            arrowId: null,
            lineId: null,
            textId: text.id,
            startPoint: point,
            startRect: null,
            startCircle: null,
            startArrow: null,
            startLine: null,
            startText: { ...text },
            handle: null,
          };
          return;
        }
      }

      // Clicked empty space - create new text
      setSelectedTextId(null);
      const newText: Text = {
        id: generateId("text"),
        x: point.x,
        y: point.y,
        text: "Text",
        color,
        fontSize: 24,
      };
      setTexts((prev) => [...prev, newText]);
      setSelectedTextId(newText.id);
      setEditingTextId(newText.id);
      setEditingTextValue("Text");
    }
  };

  /**
   * Handles mouse move - continues drawing or interaction based on tool
   */
  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const point = getPoint(event);
    if (!point) return;

    // Update cursor for rectangle tool (hover detection)
    if (activeTool === "rectangle" && !interactionRef.current) {
      if (selectedRectangleId) {
        const selectedRect = rectangles.find((r) => r.id === selectedRectangleId);
        if (selectedRect) {
          const handle = getResizeHandle(point, selectedRect);
          if (handle) {
            setCursor(getCursorForHandle(handle));
            return;
          } else if (isPointInRectangle(point, selectedRect)) {
            setCursor("move");
      return;
          }
        }
      } else {
        // Check if hovering over any rectangle
        for (let i = rectangles.length - 1; i >= 0; i--) {
          const rect = rectangles[i];
          if (isPointInRectangle(point, rect)) {
            setCursor("move");
            return;
          }
        }
      }
      setCursor("crosshair");
    }

    // Update cursor for circle tool (hover detection)
    if (activeTool === "circle" && !interactionRef.current) {
      if (selectedCircleId) {
        const selectedCircle = circles.find((c) => c.id === selectedCircleId);
        if (selectedCircle) {
          const handle = getCircleResizeHandle(point, selectedCircle);
          if (handle) {
            setCursor(getCursorForHandle(handle));
            return;
          } else if (isPointInCircle(point, selectedCircle)) {
            setCursor("move");
      return;
          }
        }
      } else {
        // Check if hovering over any circle
        for (let i = circles.length - 1; i >= 0; i--) {
          const circle = circles[i];
          if (isPointInCircle(point, circle)) {
            setCursor("move");
            return;
          }
        }
      }
      setCursor("crosshair");
    }

    // Update cursor for arrow tool (hover detection)
    if (activeTool === "arrow" && !interactionRef.current) {
      if (selectedArrowId) {
        const selectedArrow = arrows.find((a) => a.id === selectedArrowId);
        if (selectedArrow) {
          const handle = getArrowHandle(point, selectedArrow);
          if (handle) {
            setCursor(getCursorForHandle(handle));
            return;
          } else if (isPointOnArrow(point, selectedArrow)) {
            setCursor("move");
            return;
          }
        }
    } else {
        // Check if hovering over any arrow
        for (let i = arrows.length - 1; i >= 0; i--) {
          const arrow = arrows[i];
          if (isPointOnArrow(point, arrow)) {
            setCursor("move");
            return;
          }
        }
      }
      setCursor("crosshair");
    }

    // Update cursor for line tool (hover detection)
    if (activeTool === "line" && !interactionRef.current) {
      if (selectedLineId) {
        const selectedLine = lines.find((l) => l.id === selectedLineId);
        if (selectedLine) {
          const handle = getLineHandle(point, selectedLine);
          if (handle) {
            setCursor(getCursorForHandle(handle));
            return;
          } else if (isPointOnLine(point, selectedLine)) {
            setCursor("move");
            return;
          }
        }
    } else {
        // Check if hovering over any line
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i];
          if (isPointOnLine(point, line)) {
            setCursor("move");
            return;
          }
        }
      }
      setCursor("crosshair");
    }

    // Update cursor for text tool (hover detection)
    if (activeTool === "text" && !interactionRef.current) {
      if (selectedTextId) {
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (selectedText) {
          if (isPointInText(point, selectedText)) {
            setCursor("move");
            return;
          }
        }
      } else {
        // Check if hovering over any text
        for (let i = texts.length - 1; i >= 0; i--) {
          const text = texts[i];
          if (isPointInText(point, text)) {
            setCursor("move");
            return;
          }
        }
      }
      setCursor("text");
    }

    // Update cursor for eraser tool
    if (activeTool === "eraser") {
      if (isDrawing) {
        setCursor("grabbing");
      } else {
        setCursor("grab");
      }
    }

    event.preventDefault();

    // Eraser tool - continue erasing while dragging
    if (activeTool === "eraser" && isDrawing) {
      eraseAtPoint(point);
      return;
    }

    // Pen tool - continue drawing
    if (activeTool === "pen" && isDrawing && currentStrokeRef.current) {
      currentStrokeRef.current.points.push(point);
      redrawCanvas();
      return;
    }

    // Circle tool - handle drawing, move, or resize
    if (activeTool === "circle" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentCircleRef.current) {
        // Drawing new circle - calculate radius from center to current point
        const dx = point.x - interaction.startPoint.x;
        const dy = point.y - interaction.startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        currentCircleRef.current.radius = radius;
        redrawCanvas();
      } else if (interaction.type === "move" && interaction.startCircle) {
        // Moving circle - update center position
        const deltaX = point.x - interaction.startPoint.x;
        const deltaY = point.y - interaction.startPoint.y;
        setCircles((prev) =>
          prev.map((circle) =>
            circle.id === interaction.circleId
              ? {
                  ...circle,
                  x: interaction.startCircle!.x + deltaX,
                  y: interaction.startCircle!.y + deltaY,
                }
              : circle
          )
        );
      } else if (interaction.type === "resize" && interaction.startCircle) {
        // Resizing circle - calculate new radius from center to current point
        const dx = point.x - interaction.startCircle.x;
        const dy = point.y - interaction.startCircle.y;
        const newRadius = Math.sqrt(dx * dx + dy * dy);
        const MIN_RADIUS = 10;
        const radius = Math.max(newRadius, MIN_RADIUS);
        setCircles((prev) =>
          prev.map((circle) =>
            circle.id === interaction.circleId ? { ...circle, radius } : circle
          )
        );
      }
        return;
      }

    // Arrow tool - handle drawing, move, resize, or rotate
    if (activeTool === "arrow" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentArrowRef.current) {
        // Drawing new arrow - update end point
        currentArrowRef.current.endX = point.x;
        currentArrowRef.current.endY = point.y;
        redrawCanvas();
      } else if (interaction.type === "move" && interaction.startArrow) {
        // Moving arrow - translate both start and end points
        const deltaX = point.x - interaction.startPoint.x;
        const deltaY = point.y - interaction.startPoint.y;
        setArrows((prev) =>
          prev.map((arrow) =>
            arrow.id === interaction.arrowId
              ? {
                  ...arrow,
                  startX: interaction.startArrow!.startX + deltaX,
                  startY: interaction.startArrow!.startY + deltaY,
                  endX: interaction.startArrow!.endX + deltaX,
                  endY: interaction.startArrow!.endY + deltaY,
                }
              : arrow
          )
        );
      } else if (interaction.type === "resize" && interaction.startArrow && interaction.handle) {
        // Resizing arrow - update start or end point
        if (interaction.handle === "start") {
          setArrows((prev) =>
            prev.map((arrow) =>
              arrow.id === interaction.arrowId
                ? {
                    ...arrow,
                    startX: point.x,
                    startY: point.y,
                  }
                : arrow
            )
          );
        } else if (interaction.handle === "end") {
          setArrows((prev) =>
            prev.map((arrow) =>
              arrow.id === interaction.arrowId
                ? {
                    ...arrow,
                    endX: point.x,
                    endY: point.y,
                  }
                : arrow
            )
          );
        }
      } else if (interaction.type === "rotate" && interaction.startArrow && interaction.centerPoint && interaction.initialAngle !== undefined) {
        // Rotating arrow - calculate rotation angle
        const dx = point.x - interaction.centerPoint.x;
        const dy = point.y - interaction.centerPoint.y;
        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        const rotationDelta = currentAngle - interaction.initialAngle;
        const newRotation = interaction.startArrow.rotation + rotationDelta;
        // Normalize to 0-360
        const normalizedRotation = ((newRotation % 360) + 360) % 360;
        
        // Rotate start and end points around center
        const center = interaction.centerPoint;
        const originalStart = rotatePoint(interaction.startArrow.startX, interaction.startArrow.startY, center, -interaction.startArrow.rotation);
        const originalEnd = rotatePoint(interaction.startArrow.endX, interaction.startArrow.endY, center, -interaction.startArrow.rotation);
        const newStart = rotatePoint(originalStart.x, originalStart.y, center, normalizedRotation);
        const newEnd = rotatePoint(originalEnd.x, originalEnd.y, center, normalizedRotation);
        
        setArrows((prev) =>
          prev.map((arrow) =>
            arrow.id === interaction.arrowId
              ? {
                  ...arrow,
                  startX: newStart.x,
                  startY: newStart.y,
                  endX: newEnd.x,
                  endY: newEnd.y,
                  rotation: normalizedRotation,
                }
              : arrow
          )
        );
      }
      return;
    }

    // Line tool - handle drawing, move, resize, or rotate
    if (activeTool === "line" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentLineRef.current) {
        // Drawing new line - update end point
        currentLineRef.current.endX = point.x;
        currentLineRef.current.endY = point.y;
        redrawCanvas();
      } else if (interaction.type === "move" && interaction.startLine) {
        // Moving line - translate both start and end points
        const deltaX = point.x - interaction.startPoint.x;
        const deltaY = point.y - interaction.startPoint.y;
        setLines((prev) =>
          prev.map((line) =>
            line.id === interaction.lineId
              ? {
                  ...line,
                  startX: interaction.startLine!.startX + deltaX,
                  startY: interaction.startLine!.startY + deltaY,
                  endX: interaction.startLine!.endX + deltaX,
                  endY: interaction.startLine!.endY + deltaY,
                }
              : line
          )
        );
      } else if (interaction.type === "resize" && interaction.startLine && interaction.handle) {
        // Resizing line - update start or end point
        if (interaction.handle === "start") {
          setLines((prev) =>
            prev.map((line) =>
              line.id === interaction.lineId
                ? {
                    ...line,
                    startX: point.x,
                    startY: point.y,
                  }
                : line
            )
          );
        } else if (interaction.handle === "end") {
          setLines((prev) =>
            prev.map((line) =>
              line.id === interaction.lineId
                ? {
                    ...line,
                    endX: point.x,
                    endY: point.y,
                  }
                : line
            )
          );
        }
      } else if (interaction.type === "rotate" && interaction.startLine && interaction.centerPoint && interaction.initialAngle !== undefined) {
        // Rotating line - calculate rotation angle
        const dx = point.x - interaction.centerPoint.x;
        const dy = point.y - interaction.centerPoint.y;
        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        const rotationDelta = currentAngle - interaction.initialAngle;
        const newRotation = interaction.startLine.rotation + rotationDelta;
        // Normalize to 0-360
        const normalizedRotation = ((newRotation % 360) + 360) % 360;
        
        // Rotate start and end points around center
        const center = interaction.centerPoint;
        const originalStart = rotatePoint(interaction.startLine.startX, interaction.startLine.startY, center, -interaction.startLine.rotation);
        const originalEnd = rotatePoint(interaction.startLine.endX, interaction.startLine.endY, center, -interaction.startLine.rotation);
        const newStart = rotatePoint(originalStart.x, originalStart.y, center, normalizedRotation);
        const newEnd = rotatePoint(originalEnd.x, originalEnd.y, center, normalizedRotation);
        
        setLines((prev) =>
          prev.map((line) =>
            line.id === interaction.lineId
              ? {
                  ...line,
                  startX: newStart.x,
                  startY: newStart.y,
                  endX: newEnd.x,
                  endY: newEnd.y,
                  rotation: normalizedRotation,
                }
              : line
          )
        );
      }
      return;
    }

    // Text tool - handle move
    if (activeTool === "text" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "move" && interaction.startText) {
        // Moving text - update position
        const deltaX = point.x - interaction.startPoint.x;
        const deltaY = point.y - interaction.startPoint.y;
        setTexts((prev) =>
          prev.map((text) =>
            text.id === interaction.textId
              ? {
                  ...text,
                  x: interaction.startText!.x + deltaX,
                  y: interaction.startText!.y + deltaY,
                }
              : text
          )
        );
      }
      return;
    }

    // Rectangle tool - handle drawing, move, or resize
    if (activeTool === "rectangle" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentRectRef.current) {
        // Drawing new rectangle
        const startX = interaction.startPoint.x;
        const startY = interaction.startPoint.y;
        currentRectRef.current.x = Math.min(startX, point.x);
        currentRectRef.current.y = Math.min(startY, point.y);
        currentRectRef.current.width = Math.abs(point.x - startX);
        currentRectRef.current.height = Math.abs(point.y - startY);
        redrawCanvas();
      } else if (interaction.type === "move" && interaction.startRect) {
        // Moving rectangle
        const deltaX = point.x - interaction.startPoint.x;
        const deltaY = point.y - interaction.startPoint.y;
        setRectangles((prev) =>
          prev.map((rect) =>
            rect.id === interaction.rectangleId
              ? {
                  ...rect,
                  x: interaction.startRect!.x + deltaX,
                  y: interaction.startRect!.y + deltaY,
                }
              : rect
          )
        );
      } else if (interaction.type === "resize" && interaction.startRect && interaction.handle) {
        // Resizing rectangle
        const deltaX = point.x - interaction.startPoint.x;
        const deltaY = point.y - interaction.startPoint.y;
        const MIN_SIZE = 20;

        let newX = interaction.startRect.x;
        let newY = interaction.startRect.y;
        let newWidth = interaction.startRect.width;
        let newHeight = interaction.startRect.height;

        switch (interaction.handle) {
          case "top-left":
            newX = interaction.startRect.x + deltaX;
            newY = interaction.startRect.y + deltaY;
            newWidth = interaction.startRect.width - deltaX;
            newHeight = interaction.startRect.height - deltaY;
            break;
          case "top-right":
            newY = interaction.startRect.y + deltaY;
            newWidth = interaction.startRect.width + deltaX;
            newHeight = interaction.startRect.height - deltaY;
            break;
          case "bottom-left":
            newX = interaction.startRect.x + deltaX;
            newWidth = interaction.startRect.width - deltaX;
            newHeight = interaction.startRect.height + deltaY;
            break;
          case "bottom-right":
            newWidth = interaction.startRect.width + deltaX;
            newHeight = interaction.startRect.height + deltaY;
            break;
        }

        // Enforce minimum size
        if (newWidth < MIN_SIZE) {
          newWidth = MIN_SIZE;
          if (interaction.handle === "top-left" || interaction.handle === "bottom-left") {
            newX = interaction.startRect.x + interaction.startRect.width - MIN_SIZE;
          }
        }
        if (newHeight < MIN_SIZE) {
          newHeight = MIN_SIZE;
          if (interaction.handle === "top-left" || interaction.handle === "top-right") {
            newY = interaction.startRect.y + interaction.startRect.height - MIN_SIZE;
          }
        }

        setRectangles((prev) =>
          prev.map((rect) =>
            rect.id === interaction.rectangleId
              ? { ...rect, x: newX, y: newY, width: newWidth, height: newHeight }
              : rect
          )
        );
      }
    }
  };

  /**
   * Handles mouse up - finishes drawing or interaction
   */
  const handleMouseUp = () => {
    // Eraser tool - finish erasing
    if (activeTool === "eraser" && isDrawing) {
      setIsDrawing(false);
      return;
    }

    // Pen tool - finish stroke
    if (activeTool === "pen" && isDrawing && currentStrokeRef.current) {
      const stroke = currentStrokeRef.current;
      if (stroke.points.length >= 2) {
        setStrokes((prev) => [...prev, stroke]);
      }
      currentStrokeRef.current = null;
      setIsDrawing(false);
      return;
    }

    // Circle tool - finish drawing, move, or resize
    if (activeTool === "circle" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentCircleRef.current) {
        // Save new circle if it has valid radius
        const circle = currentCircleRef.current;
        if (circle.radius >= 10) {
          setCircles((prev) => [...prev, circle]);
          setSelectedCircleId(circle.id);
        }
        currentCircleRef.current = null;
        setIsDrawing(false);
      } else if (interaction.type === "move" || interaction.type === "resize") {
        // Move/resize is already applied, just clear interaction
      }

    interactionRef.current = null;
    }

    // Arrow tool - finish drawing, move, resize, or rotate
    if (activeTool === "arrow" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentArrowRef.current) {
        // Save new arrow if it has valid length
        const arrow = currentArrowRef.current;
        const dx = arrow.endX - arrow.startX;
        const dy = arrow.endY - arrow.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length >= 10) {
          setArrows((prev) => [...prev, arrow]);
          setSelectedArrowId(arrow.id);
        }
        currentArrowRef.current = null;
        setIsDrawing(false);
      } else if (interaction.type === "move" || interaction.type === "resize" || interaction.type === "rotate") {
        // Move/resize/rotate is already applied, just clear interaction
      }

      interactionRef.current = null;
    }

    // Line tool - finish drawing, move, resize, or rotate
    if (activeTool === "line" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentLineRef.current) {
        // Save new line if it has valid length
        const line = currentLineRef.current;
        const dx = line.endX - line.startX;
        const dy = line.endY - line.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length >= 10) {
          setLines((prev) => [...prev, line]);
          setSelectedLineId(line.id);
        }
        currentLineRef.current = null;
        setIsDrawing(false);
      } else if (interaction.type === "move" || interaction.type === "resize" || interaction.type === "rotate") {
        // Move/resize/rotate is already applied, just clear interaction
      }

      interactionRef.current = null;
    }

    // Text tool - finish move
    if (activeTool === "text" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "move") {
        // Move is already applied, just clear interaction
      }

      interactionRef.current = null;
    }

    // Rectangle tool - finish drawing, move, or resize
    if (activeTool === "rectangle" && interactionRef.current) {
      const interaction = interactionRef.current;

      if (interaction.type === "draw" && currentRectRef.current) {
        // Save new rectangle if it has valid size
        const rect = currentRectRef.current;
        if (rect.width >= 20 && rect.height >= 20) {
          setRectangles((prev) => [...prev, rect]);
          setSelectedRectangleId(rect.id);
        }
        currentRectRef.current = null;
        setIsDrawing(false);
      } else if (interaction.type === "move" || interaction.type === "resize") {
        // Move/resize is already applied, just clear interaction
      }

      interactionRef.current = null;
    }
  };

  /**
   * Undo - removes last stroke, rectangle, circle, arrow, line, or text
   */
  const handleUndo = () => {
    // Remove last text if any, then line, then arrow, then circle, then rectangle, then stroke
    if (texts.length > 0) {
      setTexts((prev) => {
        const newTexts = prev.slice(0, -1);
        // Deselect if removed text was selected
        if (selectedTextId && !newTexts.find((t) => t.id === selectedTextId)) {
          setSelectedTextId(null);
          setEditingTextId(null);
        }
        return newTexts;
      });
    } else if (lines.length > 0) {
      setLines((prev) => {
        const newLines = prev.slice(0, -1);
        // Deselect if removed line was selected
        if (selectedLineId && !newLines.find((l) => l.id === selectedLineId)) {
          setSelectedLineId(null);
        }
        return newLines;
      });
    } else if (arrows.length > 0) {
      setArrows((prev) => {
        const newArrows = prev.slice(0, -1);
        // Deselect if removed arrow was selected
        if (selectedArrowId && !newArrows.find((a) => a.id === selectedArrowId)) {
          setSelectedArrowId(null);
        }
        return newArrows;
      });
    } else if (circles.length > 0) {
      setCircles((prev) => {
        const newCircles = prev.slice(0, -1);
        // Deselect if removed circle was selected
        if (selectedCircleId && !newCircles.find((c) => c.id === selectedCircleId)) {
          setSelectedCircleId(null);
        }
        return newCircles;
      });
    } else if (rectangles.length > 0) {
      setRectangles((prev) => {
        const newRects = prev.slice(0, -1);
        // Deselect if removed rectangle was selected
        if (selectedRectangleId && !newRects.find((r) => r.id === selectedRectangleId)) {
          setSelectedRectangleId(null);
        }
        return newRects;
      });
    } else {
      setStrokes((prev) => {
        if (prev.length === 0) return prev;
        return prev.slice(0, -1);
      });
    }
  };

  /**
   * Clear board - removes all strokes, rectangles, circles, arrows, lines, and texts
   */
  const handleClear = () => {
    setStrokes([]);
    setRectangles([]);
    setCircles([]);
    setArrows([]);
    setLines([]);
    setTexts([]);
    setSelectedRectangleId(null);
    setSelectedCircleId(null);
    setSelectedArrowId(null);
    setSelectedLineId(null);
    setSelectedTextId(null);
    setEditingTextId(null);
  };

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

    <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main Canvas Area */}
          <div className="relative flex w-full flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
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

            <div className="relative mt-4 flex-1" ref={wrapperRef}>
          <button
            onClick={handleUndo}
                disabled={strokes.length === 0 && rectangles.length === 0 && circles.length === 0 && arrows.length === 0 && lines.length === 0 && texts.length === 0}
                className="absolute left-4 top-4 z-10 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 shadow hover:border-teal-200 hover:text-teal-600 transition"
          >
            Share
          </button>

              {/* Canvas Area */}
              <div className="relative h-full w-full rounded-2xl border border-slate-200 bg-white shadow-inner min-h-[500px]">
          <canvas
            ref={canvasRef}
                  className="absolute inset-0 h-full w-full rounded-2xl"
            style={{ cursor }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    handleMouseUp();
                    setCursor("default");
                  }}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                />
                {strokes.length === 0 && rectangles.length === 0 && circles.length === 0 && arrows.length === 0 && lines.length === 0 && texts.length === 0 && !isDrawing && (
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
      </div>

          {/* Tools Panel */}
      <aside className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl lg:w-[300px]">
        <h2 className="text-lg font-semibold text-slate-900">Tools</h2>
        <div className="mt-6 space-y-3">
          {TOOLBAR_ITEMS.map(({ label, value }) => (
            <button
              key={value}
                  onClick={() => {
                    setActiveTool(value);
                    // Deselect when switching tools
                    if (value !== "rectangle") {
                      setSelectedRectangleId(null);
                    }
                    if (value !== "circle") {
                      setSelectedCircleId(null);
                    }
                    if (value !== "arrow") {
                      setSelectedArrowId(null);
                    }
                    if (value !== "line") {
                      setSelectedLineId(null);
                    }
                    if (value !== "text") {
                      setSelectedTextId(null);
                      setEditingTextId(null);
                    }
                    // Reset cursor
                    if (value === "eraser") {
                      setCursor("grab");
                    } else if (value === "text") {
                      setCursor("text");
                    } else if (value === "pen" || value === "rectangle" || value === "circle" || value === "arrow" || value === "line") {
                      setCursor("crosshair");
                    } else {
                      setCursor("default");
                    }
                  }}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    activeTool === value &&
                    (value === "pen" || value === "rectangle" || value === "circle" || value === "arrow" || value === "line" || value === "eraser" || value === "text")
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
                  onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-full border border-slate-200 bg-white p-0"
            />
          </label>
          <button
            onClick={handleClear}
                disabled={strokes.length === 0 && rectangles.length === 0 && circles.length === 0 && arrows.length === 0 && lines.length === 0 && texts.length === 0}
                className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Board
          </button>
          <button
            onClick={handleUndo}
                disabled={strokes.length === 0 && rectangles.length === 0 && circles.length === 0 && arrows.length === 0 && lines.length === 0 && texts.length === 0}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo Last
          </button>
          {editingTextId && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Edit Text
              </label>
              <input
                type="text"
                value={editingTextValue}
                onChange={(e) => {
                  setEditingTextValue(e.target.value);
                  setTexts((prev) =>
                    prev.map((text) =>
                      text.id === editingTextId
                        ? { ...text, text: e.target.value }
                        : text
                    )
                  );
                }}
                onBlur={() => {
                  setEditingTextId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingTextId(null);
                  }
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
            </div>
          )}
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            More tools coming soon
          </div>
        </div>
      </aside>
        </div>
      </div>
    </div>
  );
}
