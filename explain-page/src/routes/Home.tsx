import { authService, dbService } from "fbase";
import React, { useEffect, useState } from "react";
import { getDocs, query, collection, doc } from "firebase/firestore";
import parse from "html-react-parser";
import { Link } from "react-router-dom";

const Home = () => {
  const [init, setInit] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pageDatas, setPageDatas] = useState<any[]>([]);
  console.log(pageDatas, "zzzzzzsdd");
  // 데이터들 가져오기
  const getContents = async () => {
    // 우선 query로 데이터 가져오기 두번째 인자 where로 조건문도 가능
    const content = query(collection(dbService, "pages"));
    const contentSnapshot = await getDocs(content);

    contentSnapshot.forEach((con) => {
      const dataObj = { ...con.data(), id: con.id };
      console.log("zz", dataObj);
      setPageDatas((prev) => [dataObj, ...prev]);
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
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl">메인페이지</span>
          {pageDatas.map((element, index) => {
            return (
              <div
                className={`w-3/5 break-words border-2 flex flex-col justify-center items-center`}
                key={index}
              >
                {parse(element.content)}
              </div>
            );
          })}
          {isLoggedIn && (
            <Link to="/create">
              <button className="py-2 mx-auto text-sm text-white uppercase bg-indigo-700 rounded shadow px-7 hover:bg-indigo-600">
                글쓰기
              </button>
            </Link>
          )}
          <footer>&copy; {`${new Date().getFullYear()} ZiZiGi`}</footer>
        </div>
      ) : (
        "Loading..."
      )}
    </>
  );
};

export default Home;
