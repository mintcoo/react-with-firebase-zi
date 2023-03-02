import React, { useRef, useState } from "react";
import { dbService, storageService } from "fbase";
import { doc, updateDoc, collection } from "firebase/firestore";

const ChangePassword = () => {
  const titles = useRef<string[]>([
    "Fisrt Password",
    "Second Password",
    "Thrid Password",
  ]);
  // 참조할 데이터의 index
  const [index, setIndex] = useState<number>(0);
  // 참조할 데이터 ref
  const dataRef = doc(dbService, "password", `${index}`);

  const [newPassword, setNewPassword] = useState<string>("");
  // ----------- 여기부터 데이터를 가져올떄 id해서 추가로 해야함 ------------
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateDoc(dataRef, {
      password: newPassword
    });
  };

  return (
    <div className="flex flex-col justify-center h-screen">
      {titles.current.map((title) => {
        return (
          <form
            onSubmit={onSubmit}
            key={title}
            className="w-full max-w-sm my-5"
          >
            <div className="flex items-center py-2 border-b border-teal-500">
              <input
                className="w-full px-2 py-1 mr-3 leading-tight text-gray-700 bg-transparent border-none appearance-none focus:outline-none"
                type="text"
                placeholder={title}
                value={newPassword}
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
    </div>
  );
};

export default ChangePassword;
