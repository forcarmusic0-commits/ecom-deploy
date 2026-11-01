import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChatRoom } from "@/types";
import { getMyRoomsApi } from "@/api/chat.api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ChatWindow from "@/components/chat/ChatWindow";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyRoomsApi().then(({ data }) => {
      const list = data.data.rooms;
      setRooms(list);

      // if we arrived here via "Message seller" on a product page, open that room directly
      const incomingRoomId = (location.state as any)?.roomId;
      if (incomingRoomId) {
        const match = list.find((r) => r.id === incomingRoomId);
        setActiveRoom(match || null);
      }
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the room list's "last message" preview up to date as new messages arrive live
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: { roomId: number; text: string }) => {
      setRooms((prev) =>
        prev.map((r) => (r.id === msg.roomId ? { ...r, lastMessage: msg.text, lastMessageAt: new Date().toISOString() } : r))
      );
    };
    socket.on("receive_message", handler);
    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket]);

  if (!user) return null;
  if (isLoading) return <Loader label="Loading conversations" />;

  return (
    <div>
      <h1 className="section-title mb-6">Messages</h1>

      {rooms.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Message a seller from any product page to start one."
        />
      ) : (
        <div className="grid h-[70vh] grid-cols-3 overflow-hidden rounded border border-line bg-white">
          <div className="col-span-1 overflow-y-auto border-r border-line">
            <ChatRoomList
              rooms={rooms}
              activeRoomId={activeRoom?.id || null}
              currentUser={user}
              onSelect={setActiveRoom}
            />
          </div>
          <div className="col-span-2">
            {activeRoom ? (
              <ChatWindow room={activeRoom} socket={socket} currentUser={user} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
