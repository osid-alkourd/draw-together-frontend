/**
 * useWhiteboardSocket Hook
 * React hook for managing Socket.IO connection for whiteboard collaboration
 */

import { useEffect, useRef, useCallback } from "react";
import {
  socketService,
  type SocketStatus,
  type DrawUpdatePayload,
  type UserEventPayload,
  type SocketCallbacks,
} from "@/lib/api/socket.service";

/**
 * Hook return type
 */
export interface UseWhiteboardSocketReturn {
  status: SocketStatus;
  isConnected: boolean;
  emitDrawUpdate: (payload: DrawUpdatePayload) => void;
  disconnect: () => void;
}

/**
 * useWhiteboardSocket Hook
 * Manages Socket.IO connection for real-time whiteboard collaboration
 *
 * @param whiteboardId - The whiteboard ID to connect to
 * @param callbacks - Event callbacks for socket events
 * @returns Socket status, connection state, and methods
 */
export function useWhiteboardSocket(
  whiteboardId: string | null,
  callbacks: SocketCallbacks = {}
): UseWhiteboardSocketReturn {
  const callbacksRef = useRef<SocketCallbacks>(callbacks);
  const isConnectedRef = useRef(false);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Wrapped callbacks that use the ref
  const wrappedCallbacks: SocketCallbacks = {
    onDrawUpdate: (payload) => {
      callbacksRef.current.onDrawUpdate?.(payload);
    },
    onUserJoined: (payload) => {
      callbacksRef.current.onUserJoined?.(payload);
    },
    onUserLeft: (payload) => {
      callbacksRef.current.onUserLeft?.(payload);
    },
    onStatusChange: (status) => {
      isConnectedRef.current = status === "connected";
      callbacksRef.current.onStatusChange?.(status);
    },
    onError: (error) => {
      callbacksRef.current.onError?.(error);
    },
  };

  // Connect to socket when whiteboardId is available
  useEffect(() => {
    if (!whiteboardId || whiteboardId === "board") {
      return;
    }

    // Connect to socket
    socketService.connect(whiteboardId, wrappedCallbacks);

    // Cleanup: disconnect when component unmounts or whiteboardId changes
    return () => {
      socketService.disconnect();
    };
  }, [whiteboardId]); // Only depend on whiteboardId

  // Emit draw update
  const emitDrawUpdate = useCallback((payload: DrawUpdatePayload) => {
    socketService.emitDrawUpdate(payload);
  }, []);

  // Disconnect manually if needed
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  // Get current status
  const status = socketService.getStatus();
  const isConnected = socketService.isConnected();

  return {
    status,
    isConnected,
    emitDrawUpdate,
    disconnect,
  };
}


