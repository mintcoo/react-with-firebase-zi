import "index.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "routes/Home";
import { authService } from "fbase";
import Auth from "routes/Auth";

function App() {
  console.log(authService.currentUser, "현재 로그인한 유저");

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Auth />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
      <footer>&copy; {`${new Date().getFullYear()} ZiZiGi`}</footer>
    </div>
  );
}

export default App;
