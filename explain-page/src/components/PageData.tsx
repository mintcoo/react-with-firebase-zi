import React from "react";
import parse from "html-react-parser";

const PageData = ({
  element,
  isLoggedIn,
}: {
  element: any;
  isLoggedIn: boolean;
}) => {
  return (
    <>
      <div className={`w-3/5 break-word flex justify-between items-center`}>
        <span>{element.title}</span>
        {isLoggedIn && (
          <div>
            <span>수정</span>
            <span>삭제</span>
          </div>
        )}
      </div>
      <div
        className={`w-3/5 break-words border-2 flex flex-col justify-center items-center`}
      >
        {parse(element.content)}
      </div>
    </>
  );
};

export default PageData;
