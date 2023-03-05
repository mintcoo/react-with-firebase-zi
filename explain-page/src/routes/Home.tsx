import { authService, dbService } from "fbase";
import React, { useEffect, useRef, useState } from "react";
import { query, collection, orderBy, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Tab } from "@headlessui/react";
import PageData from "components/PageData";

const Home = () => {
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

  useEffect(() => {
    // 데이터 가져오기
    getContents();
  }, [dbTitle]);

  // 탭 관련
  const categories = useRef([
    "생각대로",
    "바로고",
    "모아콜",
    "만나플러스",
    "국민배달",
  ]);
  // 탭 누를때 생성할 데이터베이스 이름 변경
  const changeDbTitle = (checkIndex: number) => {
    // 비밀번호 닫기
    setIsPassword(false);
    // 데이터가져올 제목 세팅
    categories.current.forEach((data, index) => {
      if (checkIndex === index) {
        console.log("제목", data);
        setDbTitle(data);
      }
    });

    // switch (checkIndex) {
    //   case 0:
    //     setDbTitle(categories.current[0]);
    //     break;
    //   case 1:
    //     setDbTitle(categories.current[1]);
    //     break;
    //   case 2:
    //     setDbTitle(categories.current[2]);
    //     break;
    // }
  };
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
      return (
        category === categories.current[index] && sessionPass === data.password
      );
    });

    if (result) {
      setIsPassword(true);
    } else {
      alert(`${categories.current[index]}의 비밀번호가 틀렸습니다`);
      setPassword("");
    }
    // switch (category) {
    //   case categories.current[0]:
    //     if (sessionPass === passwordDatas[0].password) {
    //       setIsPassword(true);
    //       setPassword("");
    //       break;
    //     }
    //     alert(`${categories.current[0]}의 비밀번호가 틀렸습니다`);
    //     setPassword("");
    //     break;
    //   case categories.current[1]:
    //     if (password === passwordDatas[1].password) {
    //       setIsPassword(true);
    //       setPassword("");
    //       break;
    //     }
    //     alert(`${categories.current[1]}의 비밀번호가 틀렸습니다`);
    //     setPassword("");
    //     break;
    //   case categories.current[2]:
    //     if (password === passwordDatas[2].password) {
    //       setIsPassword(true);
    //       setPassword("");
    //       break;
    //     }
    //     alert(`${categories.current[2]}의 비밀번호가 틀렸습니다`);
    //     setPassword("");
    //     break;
    // }
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
    // switch (checkIndex) {
    //   case 0:
    //     if (sessionPass === passwordDatas[0].password) {
    //       setIsPassword(true);
    //     }
    //     setPassword("");
    //     break;
    //   case 1:
    //     if (sessionPass === passwordDatas[1].password) {
    //       setIsPassword(true);
    //     }
    //     setPassword("");
    //     break;
    //   case 2:
    //     if (sessionPass === passwordDatas[2].password) {
    //       setIsPassword(true);
    //     }
    //     setPassword("");
    //     break;
    // }
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
            <Tab.Group
              onChange={(index) => {
                console.log("Changed selected tab to:", index);
                changeDbTitle(index);
                checkPassword(index);
              }}
            >
              <Tab.List className="flex flex-wrap p-1 rounded-xl bg-blue-900/20">
                {categories.current.map((category) => (
                  <Tab
                    key={category}
                    className={({ selected }) =>
                      classNames(
                        "w-1/3 rounded-lg py-2.5 text-md font-medium leading-5 text-blue-700",
                        "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:font-bold",
                        selected
                          ? "bg-white shadow"
                          : "text-blue-100 hover:bg-white/[0.4] hover:text-blue-400",
                      )
                    }
                  >
                    {category}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-2">
                {categories.current.map((category, index) => (
                  <Tab.Panel
                    key={category}
                    className={classNames(
                      "rounded-xl bg-white",
                      "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none",
                    )}
                  >
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
                        onSubmit={(event) =>
                          onSubmitPassword(event, category, index)
                        }
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
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>

          {isScroll && (
            <footer className="fixed right-1 bottom-5 md:right-[10%] lg:right-[20%] text-sm">
              <button onClick={scrollToTop}>⏏</button>
            </footer>
          )}
        </div>
      ) : (
        "Loading..."
      )}
    </>
  );
};

export default Home;
