/**
 * Socket.IO Service
 * Handles WebSocket connections for real-time whiteboard collaboration
 */
"use client";
import { env } from "@/lib/config/env";
import { io, Socket } from "socket.io-client";

/**
 * Socket.IO connection status
 */
export type SocketStatus = "disconnected" | "connecting" | "connected" | "error";

/**
 * Draw update types
 */
export type DrawUpdateType =
  | "stroke_add"
  | "stroke_update"
  | "rectangle_add"
  | "rectangle_update"
  | "rectangle_delete"
  | "circle_add"
  | "circle_update"
  | "circle_delete"
  | "arrow_add"
  | "arrow_update"
  | "arrow_delete"
  | "line_add"
  | "line_update"
  | "line_delete"
  | "text_add"
  | "text_update"
  | "text_delete"
  | "clear_all";

/**
 * Draw update payload
 */
export interface DrawUpdatePayload {
  whiteboardId: string;
  updateType: DrawUpdateType;
  data: {
    stroke?: {
      color: string;
      width: number;
      points: Array<{ x: number; y: number }>;
    };
    rectangle?: {
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    };
    circle?: {
      id: string;
      x: number;
      y: number;
      radius: number;
      color: string;
    };
    arrow?: {
      id: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
      rotation: number;
    };
    line?: {
      id: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
      rotation: number;
    };
    text?: {
      id: string;
      x: number;
      y: number;
      text: string;
      color: string;
      fontSize: number;
    };
    shapeId?: string; // For delete operations
  };
}

/**
 * User joined/left event payload
 */
export interface UserEventPayload {
  whiteboardId: string;
  userId: string;
  userEmail?: string;
  timestamp: string;
}

/**
 * Socket event callbacks
 */
export interface SocketCallbacks {
  onDrawUpdate?: (payload: DrawUpdatePayload) => void;
  onUserJoined?: (payload: UserEventPayload) => void;
  onUserLeft?: (payload: UserEventPayload) => void;
  onStatusChange?: (status: SocketStatus) => void;
  onError?: (error: Error) => void;
}

/**
 * Socket.IO Service
 * Manages WebSocket connection to the whiteboard namespace
 */
export class SocketService {
  private socket: Socket | null = null;
  private status: SocketStatus = "disconnected";
  private callbacks: SocketCallbacks = {};
  private whiteboardId: string | null = null;

  /**
   * Get Socket.IO server URL from backend URL
   * Removes /api suffix if present and uses the base URL
   */
  private getSocketURL(): string {
    const backendURL = env.BACKEND_URL;
    // Remove /api suffix if present
    const baseURL = backendURL.replace(/\/api$/, "");
    return baseURL;
  }


  /**
   * Connect to the whiteboard namespace
   * @param whiteboardId - The whiteboard ID to join
   * @param callbacks - Event callbacks
   */
  connect(whiteboardId: string, callbacks: SocketCallbacks = {}): void {
    // Disconnect existing connection if any
    if (this.socket?.connected) {
      this.disconnect();
    }

    this.whiteboardId = whiteboardId;
    this.callbacks = callbacks;

    // Check if we're on the client side
    if (typeof window === "undefined") {
      this.setStatus("error");
      const err = new Error("Socket.IO can only be used on the client side");
      this.callbacks.onError?.(err);
      return;
    }

    // Update status to connecting
    this.setStatus("connecting");

    try {
      // Get socket URL
      const socketURL = this.getSocketURL();

      // Create socket connection to /whiteboard namespace
      // HttpOnly cookies are automatically included with credentials: 'include'
      this.socket = io(`${socketURL}/whiteboard`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        withCredentials: true, // Include HttpOnly cookies for JWT authentication
        autoConnect: true,
      });

      // Connection event handlers
      this.socket.on("connect", () => {
        this.setStatus("connected");
        // Emit join_whiteboard event after connection
        this.socket?.emit("join_whiteboard", { whiteboardId });
      });

      this.socket.on("disconnect", (reason: string) => {
        this.setStatus("disconnected");
        console.log("Socket disconnected:", reason);
      });

      this.socket.on("connect_error", (error: { message: string; type?: string; description?: string }) => {
        this.setStatus("error");
        const err = new Error(`Socket connection error: ${error.message}`);
        this.callbacks.onError?.(err);
        console.error("Socket connection error:", error);
      });

      // Whiteboard-specific event handlers
      this.socket.on("draw_update", (payload: DrawUpdatePayload) => {
        // Only process updates for the current whiteboard
        if (payload.whiteboardId === whiteboardId) {
          this.callbacks.onDrawUpdate?.(payload);
        }
      });

      this.socket.on("user_joined", (payload: UserEventPayload) => {
        if (payload.whiteboardId === whiteboardId) {
          this.callbacks.onUserJoined?.(payload);
        }
      });

      this.socket.on("user_left", (payload: UserEventPayload) => {
        if (payload.whiteboardId === whiteboardId) {
          this.callbacks.onUserLeft?.(payload);
        }
      });

      // Error handler
      this.socket.on("error", (error: { message: string }) => {
        const err = new Error(`Socket error: ${error.message}`);
        this.callbacks.onError?.(err);
        console.error("Socket error:", error);
      });
    } catch (error: any) {
      this.setStatus("error");
      const err = new Error(`Failed to initialize Socket.IO client: ${error.message}`);
      this.callbacks.onError?.(err);
      console.error("Failed to initialize Socket.IO client:", error);
    }
  }

  /**
   * Emit draw_update event
   * @param payload - Draw update payload
   */
  emitDrawUpdate(payload: DrawUpdatePayload): void {
    if (this.socket?.connected) {
      this.socket.emit("draw_update", payload);
    } else {
      console.warn("Socket not connected, cannot emit draw_update");
    }
  }

  /**
   * Emit leave_whiteboard event and disconnect
   */
  disconnect(): void {
    if (this.socket?.connected && this.whiteboardId) {
      // Emit leave_whiteboard event before disconnecting
      this.socket.emit("leave_whiteboard", { whiteboardId: this.whiteboardId });
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.whiteboardId = null;
    this.setStatus("disconnected");
  }

  /**
   * Get current connection status
   */
  getStatus(): SocketStatus {
    return this.status;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Set connection status and notify callback
   */
  private setStatus(status: SocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.callbacks.onStatusChange?.(status);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
