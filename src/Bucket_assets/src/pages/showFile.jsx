import React from "react";
import { useSelector } from "react-redux";
import Loading from "../components/Loading";
import { getReverseFileExtension } from "./File";

function showFile(props) {
  const { bucketActor } = useSelector((state) => state);
  let key = props.match.params.filekey;
  console.log(key);
  const show = async () => {
    let re = await bucketActor.getAssetExtkey(key);
    console.log("RE", re);
    let chunks = Number(re.ok.need_query_times);
    console.log(chunks);
    let file = [];
    for (let i = 0; i < chunks; i++) {
      let reFile = await bucketActor.get({
        file_key: key,
        flag: i,
      });
      console.log(i);
      console.log(reFile);
      let tmp = reFile.ok[0];
      for (let i = 1; i < reFile.ok.length; i++) tmp = tmp.concat(reFile.ok[i]);
      file = file.concat(tmp);
    }

    console.log(file);
    let ff = new Uint8Array(file).buffer;
    console.log(ff);
    let file_type = getReverseFileExtension(re.ok.file_extension);
    const blob = new Blob([ff], {
      type: file_type,
    });

    console.log(blob);
    return URL.createObjectURL(blob);
  };
  show().then((url) => {
    console.log("ok");
    // window.location.assign("localhost:8080/");
    // window.history.back();
    console.log(url);
    if (url !== "") window.open(`${url}`);
    window.history.back();
  });

  return <Loading />;
}

export default showFile;
