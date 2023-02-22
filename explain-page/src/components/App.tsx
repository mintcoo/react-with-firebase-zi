import "index.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "routes/Home";
import { authService } from "fbase";
import Auth from "routes/Auth";
import CreatePage from "routes/CreatePage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // 유저가 로그인했는지 여부 체크
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Auth />} />
          <Route path="*" element={<Home />} />
          {isLoggedIn && <Route path="/create" element={<CreatePage />} />}
        </Routes>
      </BrowserRouter>
      <footer>&copy; {`${new Date().getFullYear()} ZiZiGi`}</footer>
    </div>
  );
}

export default App;
