import { dbService } from "fbase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import React, { useState } from "react";

const CreatePage = () => {
  // const [init, setInit] = useState<boolean>(false);
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");

  // 여기는 글 입력후 데이터 저장하는곳
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addDoc(collection(dbService, "pages"), {
      content: content,
      createdAt: serverTimestamp(),
    });
    setContent("");
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setContent(value);
  };

  return (
    <div>
      <div>여기는 글쓰는곳</div>
      <form onSubmit={onSubmit}>
        <textarea
          value={content}
          onChange={onChange}
          className={`resize-none border-2`}
          cols={50}
          rows={5}
        ></textarea>
        <input type="submit" />
      </form>
      <CKEditor
        editor={ClassicEditor}
        data="<p>Hello from CKEditor 5!</p>"
        onReady={(editor: any) => {
          // You can store the "editor" and use when it is needed.
          console.log("Editor is ready to use!", editor);
        }}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          console.log({ event, editor, data });
        }}
      />
    </div>
  );
};

export default CreatePage;
