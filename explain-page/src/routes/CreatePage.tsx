import { dbService } from "fbase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // 여기는 글 입력후 데이터 저장하는곳
  const onSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await addDoc(collection(dbService, "pages"), {
      title,
      content,
      createdAt: serverTimestamp(),
    });
    navigate("/");
    setContent("");
  };
  // 제목 정보 받고 세팅
  const onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setTitle(value);
  };

  // 에디터 글 정보받는곳
  const onChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    editor: any,
  ) => {
    const data = editor.getData();
    console.log({ event, editor, data });
    setContent(data);
  };

  return (
    <div>
      <div>여기는 글쓰는곳</div>
      {/* <form onSubmit={onSubmit}>
        <textarea
          value={content}
          onChange={onChange}
          className={`resize-none border-2`}
          cols={50}
          rows={5}
        ></textarea>
        <input type="submit" />
      </form> */}
      <input
        onChange={onChangeTitle}
        className="w-full p-1 my-3 border-2"
        type="text"
        value={title}
        placeholder="제목 입력해라 두환아 ㅇㅋ?"
        required
      />
      <CKEditor
        editor={ClassicEditor}
        config={{
          removePlugins: ["Heading"],
        }}
        data=""
        onReady={(editor: any) => {
          // You can store the "editor" and use when it is needed.
          console.log("Editor is ready to use!", editor);
        }}
        onChange={onChange}
      />
      <button
        className="py-2 mr-2 text-sm text-white uppercase bg-indigo-700 rounded shadow px-7 hover:bg-indigo-600"
        onClick={onSubmit}
      >
        등록
      </button>
      <button
        className="py-2 mr-2 text-sm text-white uppercase rounded shadow bg-rose-700 px-7 hover:bg-rose-600"
        onClick={() => {
          navigate("/");
        }}
      >
        취소
      </button>
    </div>
  );
};

export default CreatePage;
