import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { dbService, storageService } from "fbase";
import {
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getCountFromServer,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  deleteObject,
  listAll,
  uploadBytes,
} from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Transition } from "@headlessui/react";

const PageData = ({
  element,
  isLoggedIn,
}: {
  element: any;
  isLoggedIn: boolean;
}) => {
  const navigate = useNavigate();
  // 참조할 데이터 ref
  const dataRef = doc(dbService, "pages", `${element.id}`);
  // 이미지들 전부 가져오기
  const imageDatasRef = ref(storageService, `${element.title}/`);

  // 내용물 보여주기 상태
  const [isShowContent, setIsShowContent] = useState<boolean>(false);
  // 수정 관련
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>(element.title);
  const [newImageList, setNewImageList] = useState<any[]>([]);
  // 현재 데이터 관련
  const [dataCount, setDataCount] = useState<number>(0);

  // 삭제 관련
  const onDelete = async () => {
    const ok = window.confirm("정말 삭제할래?");
    if (ok) {
      // 데이터 삭제
      await deleteDoc(dataRef);
      // 모든 이미지 리스트 가져오고
      const imageTest = await listAll(imageDatasRef);
      // items for문 돌려서 전부 삭제
      imageTest.items.forEach(async (item) => {
        await deleteObject(item);
      });
    } else {
      return;
    }
  };
  // 콘텐츠 리셋
  const resetContent = async () => {
    const editor = (window as any).editor;
    const contentString = editor.getData();
    const imageIndex = contentString.indexOf("<img>");
    const imageRef = ref(storageService, `${newTitle}/`);
    const { items } = await listAll(imageRef);
    const imagesUrls = await Promise.all(
      items.map((item) => getDownloadURL(item)),
    );
    let newContentString = contentString;
    if (imageIndex >= 0) {
      // const uploadedImageUrl = imagesUrls[0]; //`https://firebasestorage.googleapis.com/v0/b/explain-service-d0f41.appspot.com/o/awe5awe%2F34476d82-d00f-4d4b-a928-2253620db62e?alt=media&token=5ff7785f-5474-4ff5-93f3-7f952bc66a2a`;
      imagesUrls.forEach((url) => {
        newContentString = newContentString.replace(
          "<img>",
          `<img className="max-w-full w-96" src='${url}'>`,
        );
      });
      editor.setData(newContentString);
    }
    return newContentString;
  };

  // 업데이트 제출
  const onUpdate = async () => {
    // 우선 기존 이미지 다 지워줌 모든 이미지 리스트 가져오고
    const imageTest = await listAll(imageDatasRef);
    // items for문 돌려서 전부 삭제
    imageTest.items.forEach(async (item) => {
      await deleteObject(item);
    });

    const promises: Promise<any>[] = [];

    newImageList.forEach(async (file) => {
      // 이미지 Ref 만들기
      // 접근하기위해 title이란 폴더안에 파일들을 다 모아서 넣어준다
      const imageRef = ref(storageService, `${newTitle}/${uuidv4()}`);
      const uploadData = uploadBytes(imageRef, file);
      promises.push(uploadData);
    });
    const imageDatas = await Promise.all(promises);
    // 새로 이미지랑 데이터 세팅해주는곳
    const realContent = await resetContent();

    await updateDoc(dataRef, {
      title: newTitle,
      content: realContent,
    });
    setIsEdit(false);
    // window.location.reload();
  };

  // 업데이트 상태 체크
  const toggleEditing = () => setIsEdit((prev) => !prev);

  // 업데이트할 새로운 제목
  const onChangeNewTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setNewTitle(value);
  };

  // 클릭시 내용 보이기
  const showContent = async () => {
    setIsShowContent((prev) => !prev);
    // imageTest.items.forEach((img) => {
    //   console.log("이미지???????????1", img.fullPath);
    // });
    // contentDiv.current?.classList.add("bg-black");
  };

  const customUploadAdapter = (loader: any) => {
    return {
      upload() {
        return new Promise((resolve, reject) => {
          const upload = new FormData();
          loader.file.then((file: any) => {
            upload.append("upload", file);
            setNewImageList((prev) => [...prev, file]);
            resolve(upload);
          });
        });
      },
    };
  };

  function uploadPlugin(editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any,
    ) => {
      return customUploadAdapter(loader);
    };
  }
  // 순서 올리기 함수
  const changeOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
    switch (event.currentTarget.id) {
      case "up":
        if (element.index > 0) {
          await updateDoc(dataRef, {
            index: element.index - 1,
          });
        }
        break;
      case "down":
        if (element.index <= dataCount) {
          await updateDoc(dataRef, {
            index: element.index + 1,
          });
        }
        break;
    }
  };

  // 카운트 가져오는 함수
  const getCountData = async () => {
    const coll = collection(dbService, "pages");
    const snapshot = await getCountFromServer(coll);
    console.log("count: ", snapshot.data().count);
    setDataCount(snapshot.data().count);
  };

  // 처음 실행
  useEffect(() => {
    getCountData();
  }, []);

  return (
    <>
      {isEdit ? (
        <div>
          <input
            onChange={onChangeNewTitle}
            className="w-full p-1 my-3 border-2"
            type="text"
            value={newTitle}
            required
          />
          <CKEditor
            editor={ClassicEditor}
            config={{
              removePlugins: ["Heading"],
              extraPlugins: [uploadPlugin],
            }}
            data={""}
            onReady={(editor: any) => {
              // You can store the "editor" and use when it is needed.
              console.log("Editor is ready to use!", editor);
              (window as any).editor = editor;
            }}
          />
          <button
            className="py-2 mr-2 text-sm text-white uppercase bg-indigo-700 rounded shadow px-7 hover:bg-indigo-600"
            onClick={onUpdate}
          >
            수정
          </button>
          <button
            className="py-2 mr-2 text-sm text-white uppercase rounded shadow bg-rose-700 px-7 hover:bg-rose-600"
            onClick={() => {
              setIsEdit(false);
            }}
          >
            취소
          </button>
        </div>
      ) : (
        <>
          <div
            onClick={showContent}
            className={`border-current w-full break-word flex justify-between items-center border rounded-md py-2 my-2 cursor-pointer hover:bg-slate-200`}
          >
            <span className={`font-bold text-xl px-6`}>✔ {element.title}</span>
            {isLoggedIn && (
              <div>
                <button
                  className={`border-cyan-700 border px-2 rounded-md mx-1 hover:bg-cyan-100`}
                  onClick={toggleEditing}
                >
                  수정
                </button>
                <button
                  className={`border-cyan-700 border px-2 rounded-md mx-1 hover:bg-cyan-100`}
                  onClick={onDelete}
                >
                  삭제
                </button>

                <button id="up" className="z-10" onClick={changeOrder}>
                  🔼
                </button>
                <button id="down" className="z-10" onClick={changeOrder}>
                  🔽
                </button>
                <span>{element.index}</span>
              </div>
            )}
          </div>

          <Transition
            as="div"
            show={isShowContent}
            enter="transition-all duration-300 ease-out"
            enterFrom="scale-y-95 opacity-0"
            enterTo="scale-y-100 opacity-100"
            leave="transition-all duration-150 ease-out"
            leaveFrom="scale-y-100 opacity-100"
            leaveTo="scale-y-95 opacity-0"
            className={`w-full break-words border-2 flex flex-col justify-center items-center text-2xl`}
          >
            {parse(element.content)}
            {/* {imagePathList.map((url) => {
              return (
                <div className={`w-96 max-w-full`} key={url}>
                  <img src={url} />
                </div>
              );
            })} */}
          </Transition>
        </>
      )}
    </>
  );
};

export default PageData;
