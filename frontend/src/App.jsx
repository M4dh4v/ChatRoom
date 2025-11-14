import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import ChatRoom from "./ChatRoom";
import Login from "./Login";
import NoMatch from "./NoMatch";
import { Routes, Route } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </>
  );
}

export default App;
