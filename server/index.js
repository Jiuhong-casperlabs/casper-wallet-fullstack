const express = require("express");
const cors = require("cors");
const app = express();

const bodyParser = require("body-parser");
app.use(cors());

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

const {
  CasperServiceByJsonRPC,
  DeployUtil,
  CLPublicKey,
  CasperClient,
} = require("casper-js-sdk");
const clientService = new CasperServiceByJsonRPC("http://3.136.227.9:7777/rpc");
const client = new CasperClient("http://3.136.227.9:7777/rpc");

app.post("/", async (req, res) => {
  let { signedDeployJSON } = req.body;
  const signedDeploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();

  let deploy_hash = await client.putDeploy(signedDeploy);
  console.log("deploy_hash is: ", deploy_hash);

  res.status(200).send(deploy_hash);
});

app.post("/balance", async (req, res) => {
  let { publicKey } = req.body;
  console.log("pk is ", publicKey);

  const latestBlock = await clientService.getLatestBlockInfo();
  const root = await clientService.getStateRootHash(latestBlock.block.hash);

  //account balance from the last block
  try {
    const balanceUref = await clientService.getAccountBalanceUrefByPublicKey(
      root,
      CLPublicKey.fromHex(publicKey)
    );
    const balance = await clientService.getAccountBalance(
      latestBlock.block.header.state_root_hash,
      balanceUref
    );
    res.status(200).send(balance.toString());
  } catch (error) {
    console.log(error);
    res.status(500).send("There is no balance for the account");
  }
});

app.listen(9000, () => console.log("running on port 9000..."));
