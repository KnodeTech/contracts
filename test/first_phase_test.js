const KNDTokenLedger = artifacts.require("./token/KNDTokenLedger.sol");
const KNDFirstPhase = artifacts.require("./phases/KNDFirstPhase.sol");

const fs = require("fs");
const path = require("path");
const knodeConfigPath = path.resolve("./knode-config.json");
let knodeConfig = JSON.parse(fs.readFileSync(knodeConfigPath));

contract('KNDFirstPhase', function(accounts){

    const FIRST_ACCOUNT = accounts[1];
    const SECOND_ACCOUNT = accounts[2];
    const THIRD_ACCOUNT = accounts[3];
    const FOURTH_ACCOUNT = accounts[4];
    const VALUE = 1e21;

    let knode_account = accounts[0];
    let tokenFirstDeployed;
    let ledgerDeployed;

    before(async function () {
        ledgerDeployed = await KNDTokenLedger.deployed();
        tokenFirstDeployed = await KNDFirstPhase.deployed();
    });

    it ("check whether the owner of KNDTokenLedger is KNDFirstPhase", async function(){
        var owner = await ledgerDeployed.owner();
        assert.equal(owner, KNDFirstPhase.address, "The address of KNDTokenLedger contract should be " + KNDFirstPhase.address + ", but it is " + owner);
    });

    it ("check whether the initial isActive is true", async function(){
        var isActive = await tokenFirstDeployed.isActive();
        assert(isActive, "The initial isActive should be true, but it is " + isActive);
    });

    it ("check whether the initial token ledger address is KNDTokenLedger.address", async function(){
        var ledger = await tokenFirstDeployed.ledger();
        assert.equal(ledger, KNDTokenLedger.address, "The address of KNDTokenLedger contract should be " + KNDTokenLedger.address  + ", but it is "+ ledger);
    });

    it ("check whether the initial knode address is knode_account", async function(){
        var knode = await tokenFirstDeployed.knode();
        assert.equal(knode, knode_account, "The address of Knode should be "+ knode_account + ", but it is " + knode );
    });

    it ("check whether the initial knode cap is knodeConfig.initFirstPhase.knodeCap", async function(){
        var cap = await tokenFirstDeployed.knodeCap();
        assert.equal(cap.toNumber(), knodeConfig.initFirstPhase.knodeCap, "The knode cap should be " + knodeConfig.initFirstPhase.knodeCap + ", but it is " + cap.toNumber());
    });

    it ("check whether the result is failed for transaction to transfer 1 ether", async function(){
        try {
            await tokenFirstDeployed.send(1e18);
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

    it ("check whether the name is 'Knode token'", async function(){
        var expectedName = "Knode token";
        var name = await tokenFirstDeployed.name();
        assert.equal(name, expectedName, "The name should be " + expectedName + ", but it is " + name);
    });

    it ("check whether the symbol is 'KND'", async function(){
        var expectedSymbol = "KND";
        var symbol = await tokenFirstDeployed.symbol();
        assert.equal(symbol, expectedSymbol, "The symbol should be " + expectedSymbol + ", but it is " + symbol);
    });

    it ("check whether the decimal is 18", async function(){
        var expectedDecimal = 18;
        var decimal = await tokenFirstDeployed.decimal();
        assert.equal(decimal.toNumber(), expectedDecimal, "The decimal should be " + expectedDecimal + ", but it is " + decimal.toNumber());
    });

    it ("check whether the initial totalSupply is 0", async function(){
        var totalSupply = await tokenFirstDeployed.totalSupply();
        assert.equal(totalSupply.toNumber(), 0, "The totalSupply should be 0, but it is " + totalSupply.toNumber());
    });

    it ("check whether the initial totalSupplyByKnode", async function(){
        var totalSupplyByKnode = await tokenFirstDeployed.totalSupplyByKnode();
        assert.equal(totalSupplyByKnode.toNumber(), 0, "The totalSupplyByKnode should be 0, but it is " + totalSupplyByKnode.toNumber());
    });

    it ("check whether the result is success for transaction, signed by knode_account, to transfer 1000 KNDToken in FIRST_ACCOUNT", async function(){

        var mintEventWatcher = tokenFirstDeployed.Mint();

        await tokenFirstDeployed.transferTo(FIRST_ACCOUNT, VALUE, {from: knode_account});
        var events = await mintEventWatcher.get();
        assert.equal(events.length, 1, "Only Mint should be emitted, but the number of emitted events is " + events.length);
        assert.equal(events[0].args._to, FIRST_ACCOUNT, "The arg to of MintByKnodeEvent should be " + FIRST_ACCOUNT + ", but it is " + events[0].args._to);
        assert.equal(events[0].args._value.valueOf(), VALUE, "The arg value of MintByKnodeEvent should be " + VALUE + ", but it is " + events[0].args._value);

        var balance = await tokenFirstDeployed.balanceOf(FIRST_ACCOUNT);
        assert.equal(balance.toNumber(), VALUE, "The token balance of FIRST_ACCOUNT should be " + VALUE + ", but it is " + balance.toNumber());
    });

    it ("check whether the totalSupply is VALUE after first transaction transferTo", async function(){
        var totalSupply = await tokenFirstDeployed.totalSupply();
        assert.equal(totalSupply.toNumber(), VALUE, "The totalSupply should be " + VALUE + ", but it is " + totalSupply.toNumber());
    });

    it ("check whether the totalSupplyByKnode is VALUE after first transaction transferTo", async function(){
        var totalSupplyByKnode = await tokenFirstDeployed.totalSupplyByKnode();
        assert.equal(totalSupplyByKnode.toNumber(), VALUE, "The totalSupplyByKnode should be " + VALUE + ", but it is " + totalSupplyByKnode.toNumber());
    });

    it ("check whether the result is failed for transaction, signed by not knode_account, to transfer 1000 KNDToken in SECOND_ACCOUNT", async function(){
        try {
            await tokenFirstDeployed.transferTo(SECOND_ACCOUNT, VALUE, {from: FIRST_ACCOUNT});
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

    it ("check whether the result is failed for transaction, signed by not knode_account, to transfer 1000 KNDToken from FIRST_ACCOUNT", async function(){
        try {
            await tokenFirstDeployed.transferFrom(FIRST_ACCOUNT, VALUE, {from: FIRST_ACCOUNT});
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

    it ("check whether the result is success for transaction, signed by knode_account, to transfer 1000 KNDToken from FIRST_ACCOUNT in knode_account", async function(){

        var transferFromEventWatcher = tokenFirstDeployed.Transfer();

        await tokenFirstDeployed.transferFrom(FIRST_ACCOUNT, VALUE, {from:knode_account});

        var events = await transferFromEventWatcher.get();
        assert.equal(events.length, 1, "Only TransferFromByKnodeEvent should be emitted, but the number of emitted events is " + events.length);
        assert.equal(events[0].args._from, FIRST_ACCOUNT, "The arg from of Transfer should be " + FIRST_ACCOUNT + ", but it is " + events[0].args._from);
        assert.equal(events[0].args._to, knode_account, "The arg to of Transfer should be " + knode_account + ", but it is " + events[0].args._to);
        assert.equal(events[0].args._value.valueOf(), VALUE, "The arg value of Transfer should be " + VALUE + ", but it is " + events[0].args._value);

        var balance1 = await tokenFirstDeployed.balanceOf(FIRST_ACCOUNT);
        assert.equal(balance1.toNumber(), 0, "The token balance of FIRST_ACCOUNT should be 0, but it is " + balance1.toNumber());

        var balance2 = await tokenFirstDeployed.balanceOf(knode_account);
        assert.equal(balance2.toNumber(), VALUE, "The token balance of knode_account should be " + VALUE + ", but it is " + balance2.toNumber());
    });

    it ("check BreakingKnodeCapEvent", async function(){

        var breakingKnodeCapEventWatcher = tokenFirstDeployed.BreakingKnodeCapEvent();

        await tokenFirstDeployed.transferTo(knode_account, knodeConfig.initFirstPhase.knodeCap, {from: knode_account});
        var events = await breakingKnodeCapEventWatcher.get();
        assert.equal(events.length, 1, "Only one BreakingKnodeCapEvent should be emitted, but the number of emitted events is " + events.length);

        var totalSupplyByKnode = await tokenFirstDeployed.totalSupplyByKnode();
        assert.equal(events[0].args._totalSupply, totalSupplyByKnode.toNumber(), "The arg total of BreakingKnodeCapEvent should be " + totalSupplyByKnode.toNumber() + ", but it is " + events[0].args._totalSupply);
    });

    it ("check TransferToByKnodeEvent after breaking knode cap", async function(){
        
        var transferToEventWatcher = tokenFirstDeployed.Transfer();
        
        await tokenFirstDeployed.transferTo(FOURTH_ACCOUNT, VALUE, {from: knode_account});
        var events = await transferToEventWatcher.get();
        assert.equal(events.length, 1, "Only Transfer should be emitted, but the number of emitted events is " + events.length);
        assert.equal(events[0].args._from, knode_account, "The arg from of Transfer should be " + knode_account + ", but it is " + events[0].args._from);
        assert.equal(events[0].args._to, FOURTH_ACCOUNT, "The arg to of Transfer should be " + FOURTH_ACCOUNT + ", but it is " + events[0].args._to);
        assert.equal(events[0].args._value.valueOf(), VALUE, "The arg value of Transfershould be " + VALUE + ", but it is " + events[0].args._value);
    });

    it ("check the knode address and its balance after updating", async function(){

        var balance1 = await tokenFirstDeployed.balanceOf(knode_account);

        await tokenFirstDeployed.updateKnodeWallet(THIRD_ACCOUNT);

        knode_account = await tokenFirstDeployed.knode();
        assert.equal(knode_account, THIRD_ACCOUNT, "The address of Knode should be " + THIRD_ACCOUNT + ", but it is " + knode_account);

        var balance2 = await tokenFirstDeployed.balanceOf(knode_account);
        assert.equal(balance2.toNumber(), balance1, "The token balance of knode_account should be " + balance1 + ", but it is" + balance2.toNumber());

    });

    it ("check the ledger owner after the destruction", async function(){

        var knode = await tokenFirstDeployed.knode();
        var tokenSecond = await KNDFirstPhase.new(KNDTokenLedger.address, knode, knodeConfig.initFirstPhase.knodeCap);
        await tokenFirstDeployed.destroy(tokenSecond.address);

        var ledgerOwner = await ledgerDeployed.owner();
        assert.equal(ledgerOwner, tokenSecond.address, "The owner of ledger should be " + tokenSecond.address + ", but it is " + ledgerOwner);
    });

});