import { authService, dbService } from "fbase";
import React, { useEffect, useRef, useState } from "react";
import { query, collection, orderBy, onSnapshot } from "firebase/firestore";
import { Link, useLocation } from "react-router-dom";
import { Tab } from "@headlessui/react";
import PageData from "components/PageData";
import Loading from "components/Loading";

// 탭 관련
const CATEGORIES = ["생각대로", "부릉"];

const Home = () => {
  const location = useLocation();
  const [init, setInit] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pageDatas, setPageDatas] = useState<any[]>([]);
  // 가져온 패스워드 데이터들
  const [passwordDatas, setPasswordDatas] = useState<any[]>([]);
  // 글쓰기 링크 보내기
  const [dbTitle, setDbTitle] = useState("생각대로");

  // 헤드리스 tab
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  // 데이터들 가져오기
  const getContents = async () => {
    // 우선 query로 데이터 가져오기 두번째 인자 where로 조건문도 가능
    const content = query(collection(dbService, dbTitle), orderBy("index"));
    // 패스워드 데이터들도 가져오기
    const passwordContent = query(
      collection(dbService, "password"),
      orderBy("index"),
    );

    // 실시간 변화 감지 최신버전
    onSnapshot(content, (snapshot) => {
      const contentSnapshot = snapshot.docs.map((con) => ({
        ...con.data(),
        id: con.id,
      }));
      setPageDatas(contentSnapshot);
    });
    // 실시간 패스워드 변화 감지
    onSnapshot(passwordContent, (snapshot) => {
      const contentSnapshot = snapshot.docs.map((con) => ({
        ...con.data(),
        id: con.id,
      }));
      setPasswordDatas(contentSnapshot);
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
  }, []);

  // 페이지 진입시 DB Title 세팅
  useEffect(() => {
    if (location.pathname === "/page1") {
      setDbTitle("생각대로");
      checkPassword(1);
    } else if (location.pathname === "/page2") {
      setDbTitle("부릉");
      checkPassword(2);
    }
    // 비밀번호 닫기
    setIsPassword(false);
  }, [location.pathname]);

  useEffect(() => {
    // 데이터 가져오기
    getContents();
  }, [dbTitle]);

  // 탭 누를때 생성할 데이터베이스 이름 변경
  // const changeDbTitle = (checkIndex: number) => {
  //   // 데이터가져올 제목 세팅
  //   CATEGORIES.forEach((data, index) => {
  //     if (checkIndex === index) {
  //       setDbTitle(data);
  //     }
  //   });
  // };
  // 비밀번호 제출관련
  const [isPassword, setIsPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  // 비번 입력 함수
  const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };
  // 비번 제출 함수
  const onSubmitPassword = (
    event: React.FormEvent<HTMLFormElement>,
    category: any,
    index: number,
  ) => {
    event.preventDefault();
    sessionStorage.setItem("pass", password);
    const sessionPass = sessionStorage.getItem("pass");

    const result = passwordDatas.some((data, index) => {
      return category === CATEGORIES[index] && sessionPass === data.password;
    });

    if (result) {
      setIsPassword(true);
    } else {
      alert(`비밀번호가 틀렸습니다`);
      setPassword("");
    }
  };
  // 비밀번호 sessionStorage 저장한거 체크 함수
  const checkPassword = (checkIndex: number) => {
    const sessionPass = sessionStorage.getItem("pass");
    passwordDatas.forEach((data, index) => {
      if (checkIndex === index && sessionPass === data.password) {
        setIsPassword(true);
      }
      setPassword("");
    });
  };

  const topDiv = useRef<HTMLDivElement>(null);
  const [isScroll, setIsScroll] = useState<boolean>(false);
  // 클릭시 가장 위로
  const scrollToTop = () => {
    topDiv.current?.scrollIntoView({ behavior: "smooth" });
  };
  // 스크롤 체크 함수
  const checkScroll = () => {
    if (document.body.clientHeight > window.innerHeight) {
      setIsScroll(true);
    } else {
      setIsScroll(false);
    }
  };

  return (
    <>
      {init ? (
        <div className="flex flex-col items-center justify-center w-full mt-10">
          <div ref={topDiv} className="h-20 text-2xl">
            앱 사용법
          </div>
          <div className="flex justify-end w-11/12 md:w-4/5 lg:w-1/2">
            {isLoggedIn && (
              <>
                <Link to={`/create/${dbTitle}`}>
                  <button className="px-5 py-[0.3rem] mx-auto text-sm text-white uppercase bg-indigo-600 rounded shadow hover:bg-indigo-400 mr-1">
                    글쓰기
                  </button>
                </Link>
                <Link to={`/password`}>
                  <button className="px-5 py-[0.3rem] mx-auto text-sm text-white uppercase bg-blue-600 rounded shadow hover:bg-blue-400 mr-1">
                    비번설정
                  </button>
                </Link>
              </>
            )}
          </div>
          <div className="w-11/12 px-1 py-2 md:w-4/5 lg:w-1/2">
            {isPassword ? (
              pageDatas.map((element) => {
                return (
                  <PageData
                    key={element.id}
                    element={element}
                    dbTitle={dbTitle}
                    isLoggedIn={isLoggedIn}
                    checkScroll={checkScroll}
                  />
                );
              })
            ) : (
              <form
                onSubmit={(event) => {
                  if (location.pathname === "/page1") {
                    onSubmitPassword(event, "생각대로", 1);
                  }
                  if (location.pathname === "/page2") {
                    onSubmitPassword(event, "부릉", 2);
                  }
                }}
                className="flex justify-center w-full mt-20"
              >
                <div className="flex items-center py-2 border-b border-teal-500">
                  <input
                    className="w-full px-2 mr-3 leading-tight text-gray-700 bg-transparent border-none focus:outline-none"
                    type="text"
                    placeholder="Password"
                    onChange={onChangePassword}
                    value={password}
                  />
                  <button
                    className="flex-shrink-0 px-2 text-sm text-white bg-teal-500 border-4 border-teal-500 rounded hover:bg-teal-700 hover:border-teal-700"
                    type="submit"
                  >
                    확인
                  </button>
                </div>
              </form>
            )}
          </div>

          {isScroll && (
            <footer className="fixed right-2 bottom-5 md:right-[10%] lg:right-[20%] text-sm">
              <button onClick={scrollToTop}>⏏</button>
            </footer>
          )}
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Home;
