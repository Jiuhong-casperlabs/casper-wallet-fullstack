const express = require("express");
const cors = require("cors");
const app = express();

const bodyParser = require("body-parser");
app.use(cors());

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

const { CasperServiceByJsonRPC, DeployUtil } = require("casper-js-sdk");
const clientService = new CasperServiceByJsonRPC(
  // "http://16.162.124.124:7777/rpc"
  // "https://rpc.testnet.casperlabs.io/rpc"
  "https://rpc.mainnet.casperlabs.io/rpc"
);
// const client = new CasperClient("http://94.130.10.55:7777/rpc");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

app.post("/", async (req, res) => {
  let { signedDeployJSON } = req.body;
  const signedDeploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();

  await sleep(1000);

  let deploy_hash = await clientService.deploy(signedDeploy);

  console.log("deploy_hash is: ", deploy_hash);

  res.status(200).send(deploy_hash.deploy_hash || deploy_hash.data);
});

app.post("/balance", async (req, res) => {
  let { publicKey } = req.body;

  try {
    const balance = await clientService.queryBalance(
      "main_purse_under_public_key",
      // "0176197d7191ce519ed043221956a2227921abf30364d4362970229027ec828f04"
      publicKey
    );
    console.log(balance);
    // const balance = await clientService.queryBalance(
    //   "purse_uref",
    //   "uref-99b8abb5ac96537c17c672bd341ca611b8fb1e3dab6d15176af0f730e34d4346-007"
    // );
    // console.log(balance);
    res.status(200).send(balance.toString());
  } catch (error) {
    console.log(error);
    res.status(500).send("There is no balance for the account");
  }
});

app.listen(9000, () => console.log("running on port 9000..."));
