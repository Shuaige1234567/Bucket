"use strict";
(self["webpackChunkContainer_assets"] = self["webpackChunkContainer_assets"] || []).push([["src_Bucket_assets_src_pages_showFile_jsx"],{

/***/ "./src/Bucket_assets/src/pages/showFile.jsx":
/*!**************************************************!*\
  !*** ./src/Bucket_assets/src/pages/showFile.jsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _components_Loading__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Loading */ "./src/Bucket_assets/src/components/Loading.jsx");
/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./File */ "./src/Bucket_assets/src/pages/File.jsx");




function showFile(props) {
    const { bucketActor } = (0,react_redux__WEBPACK_IMPORTED_MODULE_1__.useSelector)((state) => state);
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
            for (let i = 1; i < reFile.ok.length; i++)
                tmp = tmp.concat(reFile.ok[i]);
            file = file.concat(tmp);
        }
        console.log(file);
        let ff = new Uint8Array(file).buffer;
        console.log(ff);
        let file_type = (0,_File__WEBPACK_IMPORTED_MODULE_3__.getReverseFileExtension)(re.ok.file_extension);
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
        if (url !== "")
            window.open(`${url}`);
        window.history.back();
    });
    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_Loading__WEBPACK_IMPORTED_MODULE_2__["default"], null);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (showFile);


/***/ })

}]);
//# sourceMappingURL=src_Bucket_assets_src_pages_showFile_jsx.index.js.map