import React, { Component } from "react";
import { Spin } from "antd";
import "../../assets/Loading.css";

class Loading extends Component {
  render() {
    return <Spin tip="Loading" className="pageLoading" size="large" />;
  }
}

export default Loading;
