import React, { useEffect, useState } from "react";
import { ip } from "../ip";
import { encrypt, decrypt } from "./functions/encryption";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Waves from "./components/Waves";
import Example from "./components/EncryptButton";

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
    const username = (user || "").trim().toLowerCase();

    if (!username || !password) {
      toast.error("You didn't even fill the details");
      return;
    }

    // keep the displayed username normalized
    setUser(username);

    try {
      console.log(username,password);

      const res = await fetch(`${ip}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: username, password }),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem(
          "identification",
          encrypt(
            JSON.stringify({
              user: username,
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
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Ensure a dark page background so light/white waves are visible */}
      <div className="fixed inset-0 -z-30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" aria-hidden />

      {/* Waves as a full-screen background. pointer-events-none keeps them decorative so the form remains interactable. */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        {/* Give the Waves container full size so the component has room to draw */}
        <div className="w-full h-full">
          <Waves
            className="w-full h-full"
            lineColor="#60A5FA" /* slightly visible blue */
            backgroundColor="transparent"
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
        </div>
      </div>

      {/* Centered interactable form */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={handleSubmit}
          className="relative z-20 w-full max-w-md bg-gray-800/70 backdrop-blur-md text-white p-8 rounded-2xl shadow-xl"
          aria-label="Login form"
        >

          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="w-full mb-4 p-3 rounded bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full mb-6 p-3 rounded bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          
            <Example />
          
        </form>
      </div>
      <ToastContainer position="bottom-right" />

      {/* small debug hint - can remove: */}
      {/* <div className="fixed bottom-4 right-4 text-xs text-gray-400 z-30">Waves background: z-20 form: z-20</div> */}
    </div>
  );
}
