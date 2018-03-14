var KNDTokenLedger = artifacts.require("./token/KNDTokenLedger.sol");
var KNDFirstPhase = artifacts.require("./phases/KNDFirstPhase.sol");

var fs = require("fs");
var path = require("path");
var knodeConfigPath = path.resolve("../knode-config.json");
var knodeConfig = JSON.parse(fs.readFileSync(knodeConfigPath));

module.exports = function(deployer, network, accounts) {
    deployer.deploy(KNDFirstPhase, KNDTokenLedger.address, accounts[0], knodeConfig.initFirstPhase.knodeCap).then(function(){
        return KNDTokenLedger.at(KNDTokenLedger.address);
    }).then(function(ledger){
        return ledger.transferOwnership(KNDFirstPhase.address);
    }).then(function(){
        return KNDFirstPhase.deployed();
    }).then(function(instance){
        return instance.activate();
    }).then(function(){
        if (!knodeConfig[network])
            knodeConfig[network] = {};
        knodeConfig[network].KNDFirstPhase = web3.toChecksumAddress(KNDFirstPhase.address);
        var data = JSON.stringify(knodeConfig, null, 2);
        fs.writeFileSync(knodeConfigPath, data);
    });
};
