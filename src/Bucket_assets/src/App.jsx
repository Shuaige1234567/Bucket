import React, { useState, useEffect, lazy, Suspense } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Layout } from "antd";
import "antd/dist/antd.css";
import { idlFactory, canisterId } from "../../declarations/bucket";
import { useDispatch } from "react-redux";
import { updateAgent } from "./redux/features/agentSlice";
import { updatePrincipal } from "./redux/features/principalSlice";
import { updateBucketActor } from "./redux/features/bucketSlice";
import "./App.css";
import Head from "./pages/Head";
import Loading from "./components/Loading";
import { updateassetsActor } from "./redux/features/assetsSlice";

const allFile = lazy(() => import("./pages/File"));
const showFile = lazy(() => import("./pages/showFile"));
const { Content } = Layout;

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();

  async function getActor(authClient) {
    const tidentity = await authClient.getIdentity();
    const agent = new HttpAgent({
      identity: tidentity,
      host: "ic0.app",
      // host: "127.0.0.1:8000",
    });
    console.log(agent);
    await agent.fetchRootKey();
    const bucketActor = Actor.createActor(idlFactory, {
      agent,
      canisterId: "op4wk-nyaaa-aaaag-aaapq-cai",
    });

    const principal = (await agent.getPrincipal()).toString();
    console.log(bucketActor);
    let assetsExts = await bucketActor.getAssetExts();
    console.log("inner App", assetsExts);

    dispatch(updateassetsActor(assetsExts));
    dispatch(updateAgent(agent));
    dispatch(updateBucketActor(bucketActor));
    dispatch(updatePrincipal(principal));
  }

  async function handleAuthenticated(authClient) {
    setIsLogin(true);
    getActor(authClient);
  }

  async function checkLogin() {
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      handleAuthenticated(authClient);
    } else {
      setIsLogin(false);
    }
  }

  useEffect(() => {
    checkLogin();
  }, []);

  const handleLogin = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      // identityProvider:
      //   "http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai",
      onSuccess: async () => {
        handleAuthenticated(authClient);
      },
    });
  };

  return isLogin ? (
    <Layout>
      <Route path="/Bucket" component={Head} />
      <Content style={{ padding: "0 0" }}>
        <Layout className="site-layout-background" style={{ padding: "0 0" }}>
          <Suspense fallback={<Loading />}>
            <Switch>
              <Route exact={true} path="/sha/:filekey" component={showFile} />
              <Route exact={true} path="/Bucket/bucket" component={allFile} />
              <Redirect to="/Bucket/bucket" />
            </Switch>
          </Suspense>
        </Layout>
      </Content>
    </Layout>
  ) : (
    <div className="login">
      <div className="login_position">
        <button onClick={handleLogin} className="Login_LoginButton">
          Login With &nbsp;&nbsp;{" "}
        </button>
      </div>
    </div>
  );
  // return (
  //     <Layout>
  //         <Head/>
  //         <Content style={{padding: "0 0"}}>
  //             <Layout className="site-layout-background" style={{padding: "0 0"}}>
  //                 <Route path="/Container" component={Sider_}/>
  //                 <Redirect to="/Container/overview"/>
  //                 <Main/>
  //             </Layout>
  //         </Content>
  //     </Layout>
  // );
};
export default App;
