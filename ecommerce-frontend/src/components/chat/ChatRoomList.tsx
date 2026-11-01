import { ChatRoom, User } from "@/types";

export default function ChatRoomList({
  rooms,
  activeRoomId,
  currentUser,
  onSelect,
}: {
  rooms: ChatRoom[];
  activeRoomId: number | null;
  currentUser: User;
  onSelect: (room: ChatRoom) => void;
}) {
  if (rooms.length === 0) {
    return <p className="p-4 text-sm text-muted">No conversations yet.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {rooms.map((room) => {
        const otherPartyId = room.buyerId === currentUser._id ? room.sellerId : room.buyerId;
        return (
          <li key={room.id}>
            <button
              onClick={() => onSelect(room)}
              className={`block w-full px-4 py-3 text-left transition-colors hover:bg-paper ${
                activeRoomId === room.id ? "bg-forest-light" : ""
              }`}
            >
              <p className="text-sm font-medium text-ink">Chat with {otherPartyId.slice(-6)}</p>
              <p className="line-clamp-1 text-xs text-muted">{room.lastMessage || "No messages yet"}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
