import React from "react";
import { Layout } from "antd";
import logo from "../../assets/dfinity.png";
import "../../assets/Head.css";

const { Header } = Layout;

function Head() {
  return (
    <Header className="header">
      <img src={logo} alt="" />
      <span>BUCKET</span>
    </Header>
  );
}

export default Head;
