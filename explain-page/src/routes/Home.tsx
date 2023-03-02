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
  // 글쓰기 링크 보내기
  const [dbTitle, setDbTitle] = useState("테스트다");

  // 헤드리스 tab
  function classNameNames(...classNamees) {
    return classNamees.filter(Boolean).join(" ");
  }

  // 데이터들 가져오기
  const getContents = async () => {
    // 우선 query로 데이터 가져오기 두번째 인자 where로 조건문도 가능
    const content = query(collection(dbService, dbTitle), orderBy("index"));

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
  }, []);

  useEffect(() => {
    // 데이터 가져오기
    getContents();
  }, [dbTitle]);

  // 탭 관련
  const categories = useRef(["테스트다", "두번째다", "비밀이다"]);
  // 탭 누를때 생성할 데이터베이스 이름 변경
  const changeDbTitle = (index: number) => {
    // 비밀번호 닫기
    setIsPassword(false);

    switch (index) {
      case 0:
        setDbTitle(categories.current[0]);
        break;
      case 1:
        setDbTitle(categories.current[1]);
        break;
      case 2:
        setDbTitle(categories.current[2]);
        break;
    }
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
  ) => {
    event.preventDefault();
    // 여기부터 해봐야함 -------------------
    console.log(category, "비번 카테고리");
    console.log(password, "비번 내용물2");
    switch (password) {
      case "test":
        setIsPassword(true);
        break;
      default:
        alert("비밀번호가 틀렸습니다");
        setPassword("");
    }
  };

  return (
    <>
      {init ? (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="text-2xl">메인페이지</div>
          <div className="flex justify-end w-11/12 md:w-3/5">
            {isLoggedIn && (
              <Link to={`/create/${dbTitle}`}>
                <button className="py-2 mx-auto text-sm text-white uppercase bg-indigo-700 rounded shadow px-7 hover:bg-indigo-500">
                  글쓰기
                </button>
              </Link>
            )}
          </div>
          <div className="w-11/12 px-2 py-16 md:w-3/5">
            <Tab.Group
              onChange={(index) => {
                console.log("Changed selected tab to:", index);
                changeDbTitle(index);
              }}
            >
              <Tab.List className="flex p-1 space-x-1 rounded-xl bg-blue-900/20">
                {categories.current.map((category) => (
                  <Tab
                    key={category}
                    className={({ selected }) =>
                      classNameNames(
                        "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                        "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                        selected
                          ? "bg-white shadow"
                          : "text-blue-100 hover:bg-white/[0.12] hover:text-white",
                      )
                    }
                  >
                    {category}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-2">
                {categories.current.map((category) => (
                  <Tab.Panel
                    key={category}
                    className={classNameNames(
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
                          />
                        );
                      })
                    ) : (
                      <form
                        onSubmit={(event) => onSubmitPassword(event, category)}
                        className="flex justify-center w-full mt-20"
                      >
                        <div className="flex items-center py-2 border-b border-teal-500">
                          <input
                            className="w-full px-2 mr-3 leading-tight text-gray-700 bg-transparent border-b border-teal-500 border-none appearance-none focus:outline-none"
                            type="text"
                            placeholder="Password"
                            aria-label="Full name"
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
