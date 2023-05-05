import React, { useState, useEffect } from "react";
import { fetchDetail, fetchBalance } from "./api";

import {
  DeployUtil,
  CLPublicKey,
  decodeBase16,
  RuntimeArgs,
  CLString,
} from "casper-js-sdk";

function App() {
  const CasperWalletProvider = window.CasperWalletProvider;
  const CasperWalletEventTypes = window.CasperWalletEventTypes;

  const provider = CasperWalletProvider();

  const [activeKey, setActivePublicKey] = useState("");
  const [balance, setbalance] = useState("");

  const [message1, setMessage1] = useState("");
  const [message, setMessage] = useState("");
  const [deployhashnewModuleBytesDeploy, setDeployhashnewModuleBytesDeploy] =
    useState("");
  const [deployhashStoredContractByHash, setDeployhashStoredContractByHash] =
    useState("");

  const connectToCasperWallet = async () => {
    return provider.requestConnection();
  };

  const switchAccount = async () => {
    return provider.requestSwitchAccount();
  };

  const createStoredContractByHashDeploy = async (publicKeyHex) => {
    const publicKey = CLPublicKey.fromHex(publicKeyHex);
    // contract hash
    const contractHash = decodeBase16(
      "95286e200f0b206c954e5386897092c40fb38a4fad56089b09e43a91e04185f0"
    );
    const deployParams = new DeployUtil.DeployParams(
      publicKey,
      "casper-test",
      1,
      1800000
    );

    let args = RuntimeArgs.fromMap({
      message1: new CLString(message1),
    });

    const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHash,
      "hello_world",
      args
    );

    return DeployUtil.makeDeploy(
      deployParams,
      session,
      DeployUtil.standardPayment(10000000000)
    );
  };

  const createnewModuleBytesDeploy = async (publicKeyHex) => {
    const publicKey = CLPublicKey.fromHex(publicKeyHex);

    const deployParams = new DeployUtil.DeployParams(
      publicKey,
      "casper-test",
      1,
      1800000
    );
    let args = [];

    args = RuntimeArgs.fromMap({
      message: new CLString(message),
    });

    let lock_cspr_moduleBytes;
    await fetch("contract.wasm")
      .then((response) => response.arrayBuffer())
      .then((bytes) => (lock_cspr_moduleBytes = new Uint8Array(bytes)));

    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      lock_cspr_moduleBytes,
      args
    );

    return DeployUtil.makeDeploy(
      deployParams,
      session,
      DeployUtil.standardPayment(10000000000)
    );
  };

  const signDeployStoredContractByHash = async () => {
    let deploy, deployJSON;

    deploy = await createStoredContractByHashDeploy(activeKey);
    deployJSON = DeployUtil.deployToJson(deploy);
    let signedDeploy;

    try {
      const res = await provider.sign(JSON.stringify(deployJSON), activeKey);
      if (res.cancelled) {
        alert("Sign cancelled");
      } else {
        signedDeploy = DeployUtil.setSignature(
          deploy,
          res.signature,
          CLPublicKey.fromHex(activeKey)
        );
        // alert("Sign successful: " + JSON.stringify(signedDeploy, null, 2));
        console.log(
          "Sign successful: " + JSON.stringify(signedDeploy, null, 2)
        );
        const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
        const { data } = await fetchDetail(signedDeployJSON);

        setDeployhashStoredContractByHash(data);
      }
    } catch (err) {
      alert("Error: " + err);
    }
  };

  const signnewModuleBytesDeploy = async () => {
    let deploy, deployJSON;

    deploy = await createnewModuleBytesDeploy(activeKey);
    deployJSON = DeployUtil.deployToJson(deploy);
    let signedDeploy;

    try {
      const res = await provider.sign(JSON.stringify(deployJSON), activeKey);
      if (res.cancelled) {
        alert("Sign cancelled");
      } else {
        signedDeploy = DeployUtil.setSignature(
          deploy,
          res.signature,
          CLPublicKey.fromHex(activeKey)
        );
        // alert("Sign successful: " + JSON.stringify(signedDeploy, null, 2));
        console.log(
          "Sign successful: " + JSON.stringify(signedDeploy, null, 2)
        );
        const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
        const { data } = await fetchDetail(signedDeployJSON);

        setDeployhashnewModuleBytesDeploy(data);
      }
    } catch (err) {
      alert("Error: " + err);
    }
  };

  const getbalance = async () => {
    if (!activeKey) return;
    const { data } = await fetchBalance(activeKey);
    setbalance(data);
  };

  useEffect(() => {
    const handleConnected = (event) => {
      try {
        const state = JSON.parse(event.detail);
        if (state.activeKey) {
          setActivePublicKey(state.activeKey);
        }
      } catch (err) {
        console.log(err);
      }
    };
    const handleActiveKeyChanged = async (event) => {
      try {
        const state = JSON.parse(event.detail);
        if (state.activeKey) {
          setActivePublicKey(state.activeKey);
        }
        console.log('ActiveKeyChanged: "casper-wallet:activeKeyChanged"');
      } catch (err) {
        console.log(err);
      }
    };

    const handleDisconnected = async (event) => {
      setActivePublicKey("");
      try {
        const state = JSON.parse(event.detail);
        console.log(state);
        console.log('ActiveKeyChanged: "casper-wallet:activeKeyChanged"');
      } catch (err) {
        console.log(err);
      }
    };

    const handleTabChanged = async (event) => {
      try {
        const state = JSON.parse(event.detail);
        console.log(state);
        console.log('TabChanged: "casper-wallet:tabChanged"');
      } catch (err) {
        console.log(err);
      }
    };

    const handleLocked = async (event) => {
      try {
        const state = JSON.parse(event.detail);
        console.log(state);
        console.log('Locked: "casper-wallet:locked"');
      } catch (err) {
        console.log(err);
      }
    };

    const handleUnlocked = async (event) => {
      try {
        const state = JSON.parse(event.detail);
        console.log(state);
        console.log('Unlocked: "casper-wallet:unlocked"');
      } catch (err) {
        console.log(err);
      }
    };
    window.addEventListener(CasperWalletEventTypes.Connected, handleConnected);
    window.addEventListener(
      CasperWalletEventTypes.Disconnected,
      handleDisconnected
    );
    window.addEventListener(
      CasperWalletEventTypes.TabChanged,
      handleTabChanged
    );
    window.addEventListener(
      CasperWalletEventTypes.ActiveKeyChanged,
      handleActiveKeyChanged
    );
    window.addEventListener(CasperWalletEventTypes.Locked, handleLocked);
    window.addEventListener(CasperWalletEventTypes.Unlocked, handleUnlocked);

    return () => {
      window.removeEventListener(
        CasperWalletEventTypes.Connected,
        handleConnected
      );
    };
  }, [
    setActivePublicKey,
    CasperWalletEventTypes.ActiveKeyChanged,
    CasperWalletEventTypes.Connected,
    CasperWalletEventTypes.Disconnected,
    CasperWalletEventTypes.Locked,
    CasperWalletEventTypes.TabChanged,
    CasperWalletEventTypes.Unlocked,
  ]);

  return (
    <div className="App">
      <div>
        <button onClick={connectToCasperWallet}>
          {" "}
          connect to Casper Wallet
        </button>{" "}
        <button onClick={switchAccount}>switch account</button>
        <div>Public key</div>
        <div> {activeKey}</div>
      </div>
      <hr />
      <div>
        ======<strong>StoredContractByHash</strong> ======
        <div>
          <label htmlFor="">
            message1
            <input
              type="text"
              value={message1}
              onChange={(e) => setMessage1(e.target.value)}
            />
            {message1}
          </label>

          <br />

          <div>
            <input
              type="submit"
              value="deploy"
              onClick={signDeployStoredContractByHash}
            />
            <hr />
          </div>

          {deployhashStoredContractByHash && (
            <div>deploy hash {deployhashStoredContractByHash}</div>
          )}
        </div>
      </div>
      <hr />
      <div>
        ======<strong>newModuleBytesDeploy</strong> ======
        <div>
          <label htmlFor="">
            message
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {message}
          </label>

          <br />

          <div>
            <input
              type="submit"
              value="deploy"
              onClick={signnewModuleBytesDeploy}
            />
            <hr />
          </div>

          {deployhashnewModuleBytesDeploy && (
            <div>deploy hash {deployhashnewModuleBytesDeploy}</div>
          )}
        </div>
      </div>
      <div>
        ====<strong>get balance</strong>====
        <div>
          <input type="submit" value="getbalance" onClick={getbalance} />
          {!activeKey && <div>please connect to signer</div>}
          {balance && <div>balance is {balance} motes</div>}
          <hr />
        </div>
      </div>
    </div>
  );
}

export default App;
