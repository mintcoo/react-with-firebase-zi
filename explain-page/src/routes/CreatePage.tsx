import { dbService, storageService } from "fbase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  ref,
  uploadString,
  uploadBytes,
  getDownloadURL,
  listAll,
} from "@firebase/storage";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import parse from "html-react-parser";

const CreatePage = ({ userObj }: { userObj: any }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [imageList, setImageList] = useState<any[]>([]);

  // 여기 이미지 순서에따른거 다시 해보자 --------
  const resetContent = async (imageDatas) => {
    const editor = (window as any).editor;
    const contentString = editor.getData();
    const imageIndex = contentString.indexOf("<img>");
    const imageRef = ref(storageService, `${title}/`);
    const { items } = await listAll(imageRef);
    const images = await Promise.all(items.map((item) => getDownloadURL(item)));
    if (imageIndex >= 0) {
      const uploadedImageUrl = images[0]; //`https://firebasestorage.googleapis.com/v0/b/explain-service-d0f41.appspot.com/o/awe5awe%2F34476d82-d00f-4d4b-a928-2253620db62e?alt=media&token=5ff7785f-5474-4ff5-93f3-7f952bc66a2a`;
      const fixedContent = contentString.replace(
        "<img>",
        `<img src='${uploadedImageUrl}'>`,
      );
      editor.setData(fixedContent);
    }
  };

  // 여기는 글 입력후 데이터 저장하는곳
  const onSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // 여러개 이미지 올릴려면 promise all해야함
    const promises: Promise<any>[] = [];

    imageList.forEach(async (file) => {
      // 이미지 Ref 만들기
      // 접근하기위해 title이란 폴더안에 파일들을 다 모아서 넣어준다
      const imageRef = ref(storageService, `${title}/${uuidv4()}`);
      const uploadData = uploadBytes(imageRef, file);
      promises.push(uploadData);
    });

    const imageDatas = await Promise.all(promises);

    await resetContent(imageDatas);
    // console.log("zzzzzzzzzz", imageDatas);
    console.log((window as any).editor.getData());
    await addDoc(collection(dbService, "pages"), {
      title,
      content: (window as any).editor.getData(),
      // imageDatas,
      createdAt: serverTimestamp(),
    });
    navigate("/");
    setContent("");
  };

  const customUploadAdapter = (loader: any) => {
    return {
      upload() {
        return new Promise((resolve, reject) => {
          const upload = new FormData();
          //content
          loader.file.then(async (file: any) => {
            upload.append("upload", file);
            setImageList((prev) => [...prev, file]);
            resolve(upload);
          });
        });
      },
    };
  };

  // 제목 정보 받고 세팅
  const onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setTitle(value);
  };

  const [htmlImageList, setHtmlImageList] = useState<any[]>([]);
  // 에디터 글 정보받는곳
  const onChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    editor: any,
  ) => {
    const data = editor.getData();
    console.log({ event, editor, data });
    console.log(imageList, "이미지 파일리스트");
    const htmlImage = document.querySelectorAll("img");

    htmlImageList.forEach((html, index) => {
      htmlImage.forEach((img) => {
        if (html.src === img.src) {
          console.log("겹쳤따 패스");
          return;
        }
      });
      console.log(index, "숫자가 몇인데?");
      if (index) {
        setImageList((prev) => {
          console.log("무사히 지우냐?");
          return prev.splice(index, 1);
        });
      }
    });

    setHtmlImageList([]);
    htmlImage.forEach((html) => {
      setHtmlImageList((prev) => [...prev, html]);
    });
    console.log(htmlImageList, "HTTML이미지");
    setContent(data);
  };

  //여기부터 리액트벗어났음
  function uploadPlugin(editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any,
    ) => {
      return customUploadAdapter(loader);
    };
  }

  return (
    <div>
      <div>여기는 글쓰는곳</div>
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
          extraPlugins: [uploadPlugin],
        }}
        data=""
        onReady={(editor: any) => {
          // You can store the "editor" and use when it is needed.
          console.log("Editor is ready to use!", editor);
          (window as any).editor = editor;
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
