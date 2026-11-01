import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { ChatRoom, Message, User } from "@/types";
import { getRoomMessagesApi } from "@/api/chat.api";
import Loader from "@/components/common/Loader";

export default function ChatWindow({
  room,
  socket,
  currentUser,
}: {
  room: ChatRoom;
  socket: Socket | null;
  currentUser: User;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [othersTyping, setOthersTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load message history + join the room's socket channel whenever the room changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getRoomMessagesApi(room.id).then(({ data }) => {
      if (!cancelled) setMessages(data.data.room.messages || []);
      setIsLoading(false);
    });

    socket?.emit("join_room", room.id);

    return () => {
      cancelled = true;
    };
  }, [room.id, socket]);

  // listen for live events
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => {
      if (msg.roomId === room.id) setMessages((prev) => [...prev, msg]);
    };
    const handleTyping = ({ userId }: { userId: string }) => {
      if (userId !== currentUser._id) setOthersTyping(true);
    };
    const handleStopTyping = () => setOthersTyping(false);

    socket.on("receive_message", handleReceive);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket, room.id, currentUser._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit("send_message", { roomId: room.id, text: text.trim() });
    socket.emit("stop_typing", { roomId: room.id });
    setText("");
  };

  const handleTypingInput = (value: string) => {
    setText(value);
    if (!socket) return;
    socket.emit("typing", { roomId: room.id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit("stop_typing", { roomId: room.id }), 1500);
  };

  if (isLoading) return <Loader label="Loading conversation" />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted">Say hello to start the conversation.</p>
        )}
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser._id;
          return (
            <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded px-3 py-2 text-sm ${
                  mine ? "bg-forest text-white" : "bg-paper text-ink border border-line"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {othersTyping && <p className="text-xs text-muted">typing…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3">
        <input
          className="input"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => handleTypingInput(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}
