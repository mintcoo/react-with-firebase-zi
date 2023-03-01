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

  // 헤드리스 tab
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  // 데이터들 가져오기
  const getContents = async () => {
    // 우선 query로 데이터 가져오기 두번째 인자 where로 조건문도 가능
    const content = query(collection(dbService, "pages"), orderBy("index"));

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

  // 탭 관련
  const categories = useRef(["테스트다", "두번째다", "비밀이다"]);

  return (
    <>
      {init ? (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="text-2xl">메인페이지</div>
          <div className="flex justify-end w-11/12 md:w-3/5">
            {isLoggedIn && (
              <Link to="/create">
                <button className="py-2 mx-auto text-sm text-white uppercase bg-indigo-700 rounded shadow px-7 hover:bg-indigo-500">
                  글쓰기
                </button>
              </Link>
            )}
          </div>
          <div className="w-11/12 px-2 py-16 md:w-3/5">
            <Tab.Group>
              <Tab.List className="flex p-1 space-x-1 rounded-xl bg-blue-900/20">
                {categories.current.map((category) => (
                  <Tab
                    key={category}
                    className={({ selected }) =>
                      classNames(
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
                <Tab.Panel
                  className={classNames(
                    "rounded-xl bg-white",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none",
                  )}
                >
                  {pageDatas.map((element) => {
                    return (
                      <PageData
                        key={element.id}
                        element={element}
                        isLoggedIn={isLoggedIn}
                      />
                    );
                  })}
                </Tab.Panel>
                <Tab.Panel
                  className={classNames(
                    "rounded-xl bg-white p-3",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  )}
                >
                  ㄴㄴ
                </Tab.Panel>
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
