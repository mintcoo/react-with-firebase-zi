import { authService } from "fbase";
import React, { useEffect, useState } from "react";

const Home = () => {
  const [init, setInit] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // 유저가 로그인했는지 여부 체크
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  }, []);

  return (
    <>
      {init ? (
        <div>
          {isLoggedIn && <button>글쓰기</button>}
          <span className="text-2xl">메인페이지</span>
        </div>
      ) : (
        "Loading..."
      )}
    </>
  );
};

export default Home;
