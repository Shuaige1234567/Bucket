"use strict";
(self["webpackChunkContainer_assets"] = self["webpackChunkContainer_assets"] || []).push([["src_Container_assets_src_pages_People_jsx"],{

/***/ "./src/Container_assets/src/pages/People.jsx":
/*!***************************************************!*\
  !*** ./src/Container_assets/src/pages/People.jsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _redux_features_peopleSlice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../redux/features/peopleSlice */ "./src/Container_assets/src/redux/features/peopleSlice.js");



function People() {
    const count = (0,react_redux__WEBPACK_IMPORTED_MODULE_1__.useSelector)((state) => state.counter.value);
    const dispatch = (0,react_redux__WEBPACK_IMPORTED_MODULE_1__.useDispatch)();
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null,
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { onClick: () => dispatch((0,_redux_features_peopleSlice__WEBPACK_IMPORTED_MODULE_2__.increment)()) }, "Increment"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, count),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { onClick: () => dispatch((0,_redux_features_peopleSlice__WEBPACK_IMPORTED_MODULE_2__.decrement)()) }, "Decrement"))));
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (People);


/***/ })

}]);
//# sourceMappingURL=src_Container_assets_src_pages_People_jsx.index.js.map