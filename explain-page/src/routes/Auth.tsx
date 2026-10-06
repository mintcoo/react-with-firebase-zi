import { authService } from "fbase";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EMAIL_DOMAIN = "@zizigi.com";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 로그인할떄 이메일과 비밀번호
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    if (name === "ID") {
      setEmail(value);
    } else if (name === "Password") {
      setPassword(value);
    }
  };

  // 제출할때 처리할 함수
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const trimmed = email.trim();
      // 이미 @가 들어있으면 그대로, 없으면 도메인을 붙임
      const fullEmail = trimmed.includes("@")
        ? trimmed
        : `${trimmed}${EMAIL_DOMAIN}`;
      await signInWithEmailAndPassword(authService, fullEmail, password);
      navigate("/");
    } catch (error) {
      alert("로그인 실패");
    }
  };

  return (
    <div className="flex overflow-hidden relative flex-col justify-center min-h-screen">
      <div className="p-6 m-auto w-full bg-white rounded-md border drop-shadow-lg lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
          Admin
        </h1>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="mb-2">
            <label
              htmlFor="id"
              className="block text-sm font-semibold text-gray-800"
            >
              ID
            </label>
            <input
              onChange={onChange}
              id="id"
              name="ID"
              type="text"
              placeholder="ID"
              value={email}
              required
              className="block px-4 py-2 mt-2 w-full text-purple-700 bg-white rounded-md border focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <input
              onChange={onChange}
              id="password"
              name="Password"
              type="password"
              placeholder="Password"
              value={password}
              required
              className="block px-4 py-2 mt-2 w-full text-purple-700 bg-white rounded-md border focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          <div className="mt-6">
            <input
              type="submit"
              value="로그인"
              className="px-4 py-2 w-full tracking-wide text-white bg-purple-700 rounded-md transition-colors duration-200 transform cursor-pointer hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
