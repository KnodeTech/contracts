var MathLib = artifacts.require("./utils/MathLib.sol");
var KNDTokenLedger = artifacts.require("./token/KNDTokenLedger.sol");

var fs = require("fs");
var path = require("path");
var knodeConfigPath = path.resolve("../knode-config.json");
var knodeConfig = JSON.parse(fs.readFileSync(knodeConfigPath));

module.exports = function(deployer, network) {
  deployer.deploy(MathLib);
  deployer.link(MathLib, KNDTokenLedger);

  deployer.deploy(KNDTokenLedger).then(function(){
    knodeConfig[network] = {};
    knodeConfig[network].KNDTokenLedger = web3.toChecksumAddress(KNDTokenLedger.address);
    var data = JSON.stringify(knodeConfig, null, 2);
    fs.writeFileSync(knodeConfigPath, data);
  });
};
