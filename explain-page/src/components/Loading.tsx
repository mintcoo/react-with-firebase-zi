import React from "react";
import style from "./Loading.module.css";

const Loading = () => {
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center text-white bg-black bg-opacity-90">
      <div className="flex flex-col items-center justify-center h-full">
        <img
          className={`${style.loadingImg} w-12 h-12 md:w-24 md:h-24`}
          src={require("../assets/Loading.png")}
          alt="loading"
        />
        <div className={`${style.loadingText} text-sm md:font-bold md:text-xl`}>
          Loading...
        </div>
      </div>
    </div>
  );
};

export default Loading;
