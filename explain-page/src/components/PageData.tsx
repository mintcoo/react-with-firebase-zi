import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { dbService, storageService } from "fbase";
import { doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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
  // ----------- 이미지 전부 가져오는거 계속해서 삭제할때 for문 돌리는거 해봐야함------
  const [imagePathList, setImagePathList] = useState<any[]>([]);
  // 내용물 보여주기 상태
  const [isShowContent, setIsShowContent] = useState<boolean>(false);
  // 수정 관련
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>(element.title);
  const [newContent, setNewContent] = useState<string>(element.content);
  const [newImageList, setNewImageList] = useState<any[]>([]);

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
    await updateDoc(dataRef, {
      title: newTitle,
      content: newContent,
      createdAt: serverTimestamp(),
    });
    setIsEdit(false);
    window.location.reload();
  };

  // 업데이트 상태 체크
  const toggleEditing = () => setIsEdit((prev) => !prev);

  // 업데이트할 새로운 제목
  const onChangeNewTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setNewTitle(value);
  };

  // 업데이트할 새로운 내용.
  const onNewChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    editor: any,
  ) => {
    const data = editor.getData();
    setNewContent(data);
  };

  // 클릭시 내용 보이기
  const showContent = async () => {
    setIsShowContent((prev) => !prev);
    // imageTest.items.forEach((img) => {
    //   console.log("이미지???????????1", img.fullPath);
    // });
    // contentDiv.current?.classList.add("bg-black");
  };

  // 이미지 리스트 세팅
  const settingImageList = async () => {
    // 모든 이미지 리스트 가져오고
    const imageTest = await listAll(imageDatasRef);
    // items for문 돌려서 getDownloadURL로 가져오고 리스트에 세팅
    imageTest.items.forEach(async (item) => {
      const url = await getDownloadURL(item);
      setImagePathList((prev) => [...prev, url]);
    });
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
  // 처음 세팅할때
  useEffect(() => {
    settingImageList();
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
            data={newContent}
            onReady={(editor: any) => {
              // You can store the "editor" and use when it is needed.
              console.log("Editor is ready to use!", editor);
            }}
            onChange={onNewChange}
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
            className={`w-11/12 md:w-3/5 break-word flex justify-between items-center border-2 py-2 my-2`}
          >
            <span>{element.title}</span>
            {isLoggedIn && (
              <div>
                <span onClick={toggleEditing}>수정</span>
                <span onClick={onDelete}>삭제</span>
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
            className={`w-11/12 md:w-3/5 break-words border-2 flex flex-col justify-center items-center`}
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
