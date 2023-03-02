import React, { useEffect, useRef, useState } from "react";
import { dbService, storageService } from "fbase";
import {
  doc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const ChangePassword = () => {
  const inputRef = useRef<HTMLInputElement[]>([]);
  // 가져온 패스워드 데이터들
  const [passwordDatas, setPasswordDatas] = useState<any[]>([]);

  const [newPassword, setNewPassword] = useState<string>("");
  // 제출시 데이터 업데이트
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // data-set으로 가져옴
    const order = Number(event.currentTarget.dataset.order);
    // 참조할 데이터 ref
    const dataRef = doc(dbService, "password", `${passwordDatas[order].id}`);

    try {
      await updateDoc(dataRef, {
        password: newPassword,
      });
      alert(`비밀번호변경 성공`);
      setNewPassword("");
      // console.log(inputRef.current[order]);
      // 빈값으로 초기화
      (inputRef.current[order] as HTMLInputElement).value = "";
    } catch (error) {
      alert("변경 실패");
      setNewPassword("");
    }
  };

  // 데이터들 가져오기
  const getContents = async () => {
    // 우선 query로 데이터 가져오기 두번째 인자 where로 조건문도 가능
    const content = query(collection(dbService, "password"), orderBy("index"));

    // 실시간 변화 감지 최신버전
    onSnapshot(content, (snapshot) => {
      const contentSnapshot = snapshot.docs.map((con) => ({
        ...con.data(),
        id: con.id,
      }));
      setPasswordDatas(contentSnapshot);
    });
  };

  useEffect(() => {
    getContents();
  }, []);

  return (
    <div className="flex flex-col justify-center h-screen">
      {passwordDatas.map((data, index) => {
        return (
          <form
            onSubmit={onSubmit}
            key={data.id}
            data-order={index}
            className="w-full max-w-sm my-5"
          >
            <div className="flex items-center py-2 border-b border-teal-500">
              <input
                ref={(element: HTMLInputElement) => {
                  inputRef.current[index] = element;
                }}
                className="w-full px-2 py-1 mr-3 leading-tight text-gray-700 bg-transparent border-none appearance-none focus:outline-none"
                type="text"
                required
                placeholder={`${index + 1}의 비번: ${data.password}`}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setNewPassword(event.currentTarget.value);
                }}
              />
              <button
                className="flex-shrink-0 px-2 py-1 text-sm text-white bg-teal-500 border-4 border-teal-500 rounded hover:bg-teal-700 hover:border-teal-700"
                type="submit"
              >
                변경
              </button>
            </div>
          </form>
        );
      })}
      <Link to={`/`}>
        <button className="px-5 py-[0.3rem] mx-auto text-sm text-white uppercase bg-indigo-600 rounded shadow hover:bg-indigo-400 mr-1">
          뒤로가기
        </button>
      </Link>
    </div>
  );
};

export default ChangePassword;
