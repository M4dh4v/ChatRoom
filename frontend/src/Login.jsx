import { useState } from "react";
import { ip } from "../ip";
import { encrypt, decrypt } from "./functions/encryption";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import Waves from "./components/Waves";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = sessionStorage.getItem("identification");
    if (id) {
      try {
        const idData = JSON.parse(decrypt(id));
        if (idData.loggedIn) {
          navigate("/chat");
        }
      } catch (err) {
        console.error("Invalid session data:", err);
        sessionStorage.removeItem("identification");
      }
    }
  }, [navigate]);

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !password) {
      toast.error("You didnt even fucking fill the details");
    } else {
      setUser(user.toLowerCase());
      const res = await fetch(`${ip}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem(
          "identification",
          encrypt(
            JSON.stringify({
              user,
              loggedIn: true,
            })
          )
        );
        toast.success(data.message);
        setTimeout(() => navigate("/chat"), 1500);
      } else {
        toast.error(data.message);
        setPassword("");
      }
    }
  };

  return (
    <>
      <Waves
        lineColor="#fff"
        backgroundColor="rgba(255, 255, 255, 0.2)"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-96"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Username"
            className="w-full mb-4 p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full mb-6 p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-semibold transition"
          >
            Login
          </button>
        </form>
        <ToastContainer />
      </div>
    </>
  );
}
