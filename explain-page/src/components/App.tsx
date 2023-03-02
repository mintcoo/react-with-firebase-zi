import "index.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "routes/Home";
import { authService } from "fbase";
import Auth from "routes/Auth";
import CreatePage from "routes/CreatePage";
import ChangePassword from "routes/ChangePassword";
import NotFound from "routes/NotFound";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userObj, setUserObj] = useState<any>(null);

  useEffect(() => {
    // 유저가 로그인했는지 여부 체크
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserObj(user);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  return (
    <>
      <div className="flex justify-center mx-auto">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
            {isLoggedIn && (
              <>
                <Route path="/create/:dbTitle" element={<CreatePage />} />
                <Route path="/password" element={<ChangePassword />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
