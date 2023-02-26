import React, { useState } from "react";
import parse from "html-react-parser";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { dbService, storageService } from "fbase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { useNavigate } from "react-router-dom";
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
  console.log("이미지모음 잘오냐", imageDatasRef);
  // ----------- 이미지 전부 가져오는거 계속해서 삭제할때 for문 돌리는거 해봐야함------
  // // 이미지 데이터 참조 ref
  // const imageDataRef = ref(storageService, ``)
  // 내용물 보여주기 상태
  const [isShowContent, setIsShowContent] = useState<boolean>(false);
  // 수정 관련
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>(element.title);
  const [newContent, setNewContent] = useState<string>(element.content);

  const onDelete = async () => {
    const ok = window.confirm("정말 삭제할래?");
    if (ok) {
      // 데이터 삭제
      await deleteDoc(dataRef);
      await deleteObject(ref(storageService, `${element.title}/`));
    } else {
      return;
    }
  };

  // 업데이트 제출
  const onUpdate = async () => {
    await updateDoc(dataRef, {
      title: newTitle,
      content: newContent,
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

  // 업데이트할 새로운 내용.
  const onNewChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    editor: any,
  ) => {
    const data = editor.getData();
    setNewContent(data);
  };

  // 클릭시 내용 보이기
  const showContent = () => {
    setIsShowContent((prev) => !prev);
    // contentDiv.current?.classList.add("bg-black");
  };

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
              navigate("/");
            }}
          >
            취소
          </button>
        </div>
      ) : (
        <>
          <div
            onClick={showContent}
            className={`w-3/5 break-word flex justify-between items-center border-2 py-2 my-2`}
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
            className={`w-3/5 break-words border-2 flex flex-col justify-center items-center`}
          >
            {parse(element.content)}
          </Transition>
        </>
      )}
    </>
  );
};

export default PageData;
