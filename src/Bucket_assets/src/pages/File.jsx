import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { sha256 } from "js-sha256";
import { nanoid } from "nanoid";
import {
  Button,
  Layout,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Spin,
} from "antd";
import { MedicineBoxTwoTone } from "@ant-design/icons";
import { useSelector } from "react-redux";
import "../../assets/File.css";

const { Content } = Layout;

export const getReverseFileExtension = (type) => {
  switch (Object.keys(type)[0]) {
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "jpg":
      return "image/jpg";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg";
    case "avi":
      return "video/avi";
    case "mp4":
      return "video/mp4";
    case "aac":
      return "video/aac";
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mp3";
    case "wasm":
      return "application/wasm";
    default:
      return "";
  }
};
const getFileExtension = (type) => {
  switch (type) {
    case "image/jpeg":
      return { jpeg: null };
    case "image/gif":
      return { gif: null };
    case "image/jpg":
      return { jpg: null };
    case "image/png":
      return { png: null };
    case "image/svg":
      return { svg: null };
    case "video/avi":
      return { avi: null };
    case "video/aac":
      return { aac: null };
    case "video/mp4":
      return { mp4: null };
    case "audio/wav":
      return { wav: null };
    case "audio/mp3":
      return { mp3: null };
    case "audio/mpeg":
      return { mp3: null };
    case "application/wasm":
      return { wasm: null };
    default:
      return null;
  }
};
let isUpload = false;
let uploadFileNumber = 0;
let flag = true;
let playupFlag = true;
let selectedRows = [];
const deletePromise = [];

function allFile() {
  // const [key, setkey] = useState("");
  let [newData, setNewData] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const { principal, assets, bucketActor } = useSelector((state) => state);
  const storageKey = principal.value;
  let localStor = JSON.parse(localStorage.getItem(storageKey));
  const localBuffer = localStor === null ? [] : localStor;
  const assetExts = assets === null ? [] : assets.ok;

  if (newData.length < assetExts.length && flag) {
    for (let i = 0; i < assetExts.length; i++) {
      newData[i] = {
        filekey: assetExts[i].file_key,
        bucketId: assetExts[i].bucket_id.toString(),
        filename: assetExts[i].file_name,
        filetype: [Object.keys(assetExts[i].file_extension)[0]],
        id: nanoid(),
      };
    }
    setNewData([...newData]);
  }
  // localStorage.removeItem("ic-identity");
  // localStorage.removeItem("ic-delegation");
  // localStorage.removeItem(
  //   "eniwd-yttfc-vdnj4-4rx5q-6tnr5-g2hxx-2dfcx-6pbcc-xbrg2-oivre-4ae"
  // );
  const arrString = JSON.stringify(newData);
  if (storageKey !== "") localStorage.setItem(storageKey, arrString);

  const onDrop = useCallback(
    (acceptedFiles) => {
      let allPromises = [];
      let allChunks = 0;
      uploadFileNumber = acceptedFiles.length;
      // Do something with the files
      console.log(acceptedFiles);
      let total_size = 0;
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        let fileKey = "";
        const digestTree = [];
        const dataArr = [];
        const tmpArr = [];
        let fileSize = file.size; // 文件大小
        total_size += fileSize;
        console.log("fileSize:", fileSize);
        let chunkSize = 1992295; // 切片的大小
        let chunks = Math.ceil(fileSize / chunkSize); // 获取切片的个数
        console.log("chunks:", chunks);
        let blobSlice = //
          File.prototype.slice ||
          File.prototype.mozSlice ||
          File.prototype.webkitSlice;
        let currentChunk = 0;
        const chunkPromises = [];
        const reader = new FileReader();
        let file_extension = getFileExtension(file.type);

        reader.onload = function (e) {
          let result = e.target.result;
          let tData = new Uint8Array(result);
          let data = [];
          for (let i = 0; i < tData.length; i++) {
            data.push(tData[i]);
          }
          let tmp = sha256.digest(data);
          tmpArr.push(tmp);
          dataArr.push(data);
          digestTree.push(...tmp);
          currentChunk++;
          if (currentChunk < chunks) {
            loadNext();
          } else {
            // let root = sha256.digest(digestTree);
            fileKey = sha256(digestTree);
            // digestTree.splice(0, 0, ...root);
            fileKey = fileKey.toUpperCase();

            let isRepeat = localBuffer.find((item) => item.filekey === fileKey);
            if (isRepeat) {
              uploadFileNumber--;
              message.error(`${fileKey} is Repeat`);
            } else {
              isUpload = true;
              // setkey({});
              setIsSpinning(true);
              for (let i = 0; i < dataArr.length; i++) {
                console.log(fileKey);
                chunkPromises.push(
                  bucketActor.put({
                    file_key: fileKey,
                    file_name: file.name,
                    file_extension: file_extension,
                    chunk: { digest: tmpArr[i], data: dataArr[i] },
                    chunk_number: chunks,
                    order: i,
                  })
                );
              }
              allPromises.push(...chunkPromises);
              if (allPromises.length === allChunks) {
                Promise.all(allPromises).then();
              }
            }
          }
        };

        const loadNext = () => {
          let start = currentChunk * chunkSize;
          let end = start + chunkSize > fileSize ? fileSize : start + chunkSize;
          reader.readAsArrayBuffer(blobSlice.call(file, start, end));
        };
        loadNext();
      }
    },
    [localBuffer, bucketActor]
  );

  const turn = (preLength) => {
    return async () => {
      const arr = [];
      let local = JSON.parse(localStorage.getItem(storageKey));
      const localArr = local === null ? [] : local;
      let x = await bucketActor.getAssetExts();
      console.log(x.ok, localArr.length);
      if (x.ok.length > localArr.length) {
        for (let i = 0; i < x.ok.length; i++) {
          console.log(x.ok[i]);
          arr.push({
            id: nanoid(),
            filename: x.ok[i].file_name,
            bucketId: x.ok[i].bucket_id.toString(),
            filekey: x.ok[i].file_key,
            filetype: [Object.keys(x.ok[i].file_extension)[0]],
          });
        }
      }
      let kkk = JSON.stringify(arr);
      if (arr.length > 0 && storageKey !== "") {
        playupFlag = false;
        localStorage.setItem(storageKey, kkk);
        // setkey({});
        setNewData([...newData]);
      }
      if (x.ok.length === preLength + uploadFileNumber) {
        console.log("上传完成");
        console.log(x.ok);
        location.reload();
        return 0;
      }
    };
  };

  if (isUpload && playupFlag) {
    let local = JSON.parse(localStorage.getItem(storageKey));
    const localArr = local === null ? [] : local;
    setInterval(turn(localArr.length), 1000);
  }

  useEffect(() => {
    return () => {
      Promise.all(deletePromise).then(() => {
        console.log("deleted");
      });
    };
  });

  const loadImg = async (key) => {
    console.log(key);
    const getPromises = [];
    let RE = await bucketActor.getAssetExtkey(key);
    console.log("RE", RE);
    let chunks = Number(RE.ok.need_query_times);
    console.log(chunks);
    let file = [];
    for (let i = 0; i < chunks; i++) {
      getPromises.push(
        bucketActor.get({
          file_key: key,
          flag: i,
        })
      );
    }
    Promise.all(getPromises).then((re) => {
      console.log(re);
      for (let i = 0; i < re.length; i++) {
        let x = re[i].ok[0];
        file = file.concat(x);
      }
      console.log(file);
      let ff = new Uint8Array(file).buffer;
      console.log(ff);
      let file_type = getReverseFileExtension(RE.ok.file_extension);
      const blob = new Blob([ff], {
        type: file_type,
      });
      console.log(blob);
      console.log(URL.createObjectURL(blob));
      const Url = URL.createObjectURL(blob);
      console.log(`${Url}`);
      if (Url) {
        setIsSpinning(false);
        window.open(`${Url}`);
      }
    });
  };

  const skip = (key) => {
    return async () => {
      setIsSpinning(true);
      loadImg(key).then();
    };
  };

  const confirm = async () => {
    console.log(selectedRows);
    if (selectedRows.length > 0) {
      for (let i = 0; i < selectedRows.length; i++) {
        deletePromise.push(bucketActor.deletekey(selectedRows[i].filekey));
        let index = newData.findIndex((item) => {
          return selectedRows[i].filekey === item.filekey;
        });
        if (index !== -1) {
          newData.splice(index, 1);
          flag = false;
        } else {
          message.error("Please select the file to delete!");
          return 0;
        }
      }
      const newStorage = JSON.stringify(newData);
      if (storageKey !== "") localStorage.setItem(storageKey, newStorage);
      selectedRows = [];
      // setkey({});
      setNewData([...newData]);
      message.success("Deleted successded");
    } else {
      message.error("Please select the file to delete!");
    }
  };

  const cancel = () => {
    message.error("Cancel deletion");
  };

  const onSelectChange = (_, Rows) => {
    console.log(Rows);
    selectedRows = Rows;
  };
  const rowSelection = {
    onChange: onSelectChange,
  };
  const columns = [
    {
      title: "FileName",
      dataIndex: "filename",
    },
    {
      title: "BucketId",
      dataIndex: "bucketId",
    },
    {
      title: "FileKey",
      dataIndex: "filekey",
    },
    {
      title: "FileType",
      dataIndex: "filetype",
      render: (tags) => (
        <span>
          {tags.map((tag) => {
            let color;
            switch (tag) {
              case "mp3":
              case "wav":
                color = "volcano";
                break;
              case "acc":
              case "mp4":
              case "avi":
                color = "geekblue";
                break;
              default:
                color = "magenta";
                break;
            }
            return (
              <Tag color={color} key={nanoid()}>
                {tag}
              </Tag>
            );
          })}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={skip(record.filekey)}>
            Entry
          </Button>
        </Space>
      ),
    },
  ];

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <Spin spinning={isSpinning} size="large">
      <Content style={{ padding: "0 0", minHeight: 0 }} className="main">
        <div className="showTable">
          <div className="title">
            <div>
              <div className="drop" {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="uploadBac">
                  <p>
                    <MedicineBoxTwoTone className="icon" />
                  </p>
                  <p>Click one or drag many files to this area to upload</p>
                </div>
              </div>
            </div>
          </div>
          <Table
            className="fileTable"
            rowSelection={rowSelection}
            rowKey={(record) => record.id}
            columns={columns}
            pagination={{ position: "bottomRight" }}
            dataSource={newData}
          />
          <div className="action_bac">
            <Space
              style={{ display: newData.length > 0 ? "inline-flex" : "none" }}
              size="middle"
              className="Action"
            >
              <Popconfirm
                title="Are you sure to delete these files?"
                onConfirm={confirm}
                onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary">Delete</Button>
              </Popconfirm>
            </Space>
          </div>
        </div>
      </Content>
    </Spin>
  );
}

export default allFile;
