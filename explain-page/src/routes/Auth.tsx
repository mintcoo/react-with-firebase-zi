import { authService } from "fbase";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";

const Auth = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 로그인할떄 이메일과 비밀번호
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    if (name === "Email") {
      setEmail(value);
    } else if (name === "Password") {
      setPassword(value);
    }
  };

  // 제출할때 처리할 함수
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // 로그인 성공할때
      const data = await signInWithEmailAndPassword(authService, email, password);
      console.log("로그인 성공", data);
    } catch (error) {
      console.log("로그인 오류", error);
    }
  };

  return (
    <div>
      <h1>로그인</h1>
      <form onSubmit={onSubmit}>
        <input
          className={`border-2`}
          onChange={onChange}
          name="Email"
          type="email"
          placeholder="Email"
          value={email}
          required
        />
        <input
          className={`border-2`}
          onChange={onChange}
          name="Password"
          type="password"
          placeholder="Password"
          value={password}
          required
        />
        <input type="submit" value="로그인" />
      </form>
    </div>
  );
};

export default Auth;
