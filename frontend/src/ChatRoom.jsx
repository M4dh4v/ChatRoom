import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { ip } from "../ip";
import { useNavigate } from "react-router-dom";
import { decrypt } from "./functions/encryption";

const socket = io(`${ip}`, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 60000,
});

export default function ChatRoom() {
  const navigate = useNavigate();

  try {
    const id = sessionStorage.getItem("identification");
    if (!id) {
      navigate("/");
    }
    const dd = decrypt(id);
    const decryptData = JSON.parse(dd);
    if (!decryptData.loggedIn) {
      navigate("/");
    }
  } catch (err) {
    console.error(err);
  }

  const id = sessionStorage.getItem("identification");
  const dd = decrypt(id);
  const decryptData = JSON.parse(dd);
  const user = decryptData.user;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("erripuvvula meetup");
  const chatEndRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("heartbeat", { user });
    }, 20000); // every 20 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.emit("join_room", room);
    socket.on("message_history", (history) => {
      setMessages(history);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("message_history");
      socket.off("receive_message");
    };
  }, [room]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    // split on \n and send as an array of lines
    const lines = message.split("\n");

    const data = {
      room,
      author: user,
      message: lines, // <-- send array instead of single string
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", data);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-lg">
        <h1 className="text-2xl font-semibold tracking-wide">WAAAWW WARKING</h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm">Room:</span>
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            {room}
          </span>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-8 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.author === user ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[60%] break-words px-4 py-2 rounded-2xl shadow-md ${
                m.author === user
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-100"
              }`}
            >
              {/* message can be an array (lines) or a string — support both */}
              {Array.isArray(m.message) ? (
                <div className="text-sm space-y-1">
                  {m.message.map((line, idx) => (
                    <p key={`${i}-line-${idx}`}>{line}</p>
                  ))}
                </div>
              ) : (
                <div className="text-sm space-y-1">
                  {String(m.message)
                    .split("\n")
                    .map((line, idx) => (
                      <p key={`${i}-line-${idx}`}>{line}</p>
                    ))}
                </div>
              )}

              <div className="text-xs text-gray-300 mt-1 flex justify-between">
                <span>{m.author}</span>
                <span>{m.time}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      {/* Input area (textarea supports multi-line) */}
      <footer className="flex items-center gap-3 p-4 bg-gray-800 border-t border-gray-700">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            // Enter to send, Shift+Enter to insert newline
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message... (Shift+Enter for newline, Enter to send)"
          className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium transition-colors"
        >
          Send
        </button>
      </footer>
    </div>
  );
}
