import { authService, dbService } from "fbase";
import React, { useEffect, useState } from "react";
import { query, collection, orderBy, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import PageData from "components/PageData";

const Home = () => {
  const [init, setInit] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pageDatas, setPageDatas] = useState<any[]>([]);

  // 데이터들 가져오기
  const getContents = async () => {
    // 우선 query로 데이터 가져오기 두번째 인자 where로 조건문도 가능
    const content = query(collection(dbService, "pages"), orderBy("createdAt"));

    // 실시간 변화 감지 최신버전
    onSnapshot(content, (snapshot) => {
      const contentSnapshot = snapshot.docs.map((con) => ({
        ...con.data(),
        id: con.id,
      }));
      setPageDatas(contentSnapshot);
    });
  };

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
    // 데이터 가져오기
    getContents();
  }, []);

  return (
    <>
      {init ? (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="text-2xl">메인페이지</div>
          <div className="flex justify-end w-3/5">
            {isLoggedIn && (
              <Link to="/create">
                <button className="py-2 mx-auto text-sm text-white uppercase bg-indigo-700 rounded shadow px-7 hover:bg-indigo-500">
                  글쓰기
                </button>
              </Link>
            )}
          </div>
          {pageDatas.map((element) => {
            return (
              <PageData
                key={element.id}
                element={element}
                isLoggedIn={isLoggedIn}
              />
            );
          })}
          <footer className="fixed bottom-5">
            &copy; {`${new Date().getFullYear()} 두환이의 ZiZiGi`}
          </footer>
        </div>
      ) : (
        "Loading..."
      )}
    </>
  );
};

export default Home;
