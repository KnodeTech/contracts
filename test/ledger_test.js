const KNDTokenLedger = artifacts.require("./token/KNDTokenLedger.sol");
const KNDFirstPhase = artifacts.require("./token/KNDFirstPhase.sol");

contract('KNDTokenLedger', function(accounts){

    const FIRST_ACCOUNT = accounts[1];
    const SECOND_ACCOUNT = accounts[2];
    const THIRD_ACCOUNT = accounts[3];
    const VALUE = 1e21;

    let ledgerDeployed;
    let ledgerOwner = accounts[0];

    before(async function () {
        ledgerDeployed = await KNDTokenLedger.new();
    });

    it ("check whether the owner of KNDTokenLedger is ledgerOwner", async function(){
        var owner = await ledgerDeployed.owner();
        assert.equal(owner, ledgerOwner, "The address of KNDTokenLedger contract should be " + ledgerOwner + ", but it is " + owner);
    });

    it ("check whether the initial isSealed is false", async function(){
        var isSealed = await ledgerDeployed.isSealed();
        assert(!isSealed, "Expected isSealed = false");
    });

    it ("check whether the initial totalSupply is 0", async function(){
        var totalSupply = await ledgerDeployed.totalSupply();
        assert.equal(totalSupply.toNumber(), 0, "The totalSupply  should be 0, but it is" + totalSupply.toNumber());
    });


    it ("check whether the result is success for transaction, signed by owner, to mint 1000 KNDToken for FIRST_ACCOUNT", async function(){
        await ledgerDeployed.mint(FIRST_ACCOUNT, VALUE, {from: ledgerOwner});
        
        var balance = await ledgerDeployed.balanceOf(FIRST_ACCOUNT);
        assert.equal(balance.toNumber(), VALUE, "The token balance of FIRST_ACCOUNT should be " + VALUE + ", but it is " + balance.toNumber());
    });

    it ("check whether the totalSupply is VALUE after minting", async function(){
        var totalSupply = await ledgerDeployed.totalSupply();
        assert.equal(totalSupply.toNumber(), VALUE, "The totalSupply should be " + VALUE + ", but it is " + totalSupply.toNumber());
    });

    it ("check whether the result is failed for transaction, signed by not owner, to mint 1000 KNDToken for FIRST_ACCOUNT", async function(){
        try {
            await ledgerDeployed.mint(FIRST_ACCOUNT, VALUE, {from: FIRST_ACCOUNT});
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

    it ("check whether the result is failed for transaction, signed by not owner, to transfer 1000 KNDToken from FIRST_ACCOUNT to SECOND_ACCOUNT", async function(){
        try {
            await ledgerDeployed.transferFrom(FIRST_ACCOUNT, SECOND_ACCOUNT, VALUE, {from: FIRST_ACCOUNT});
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

    it ("check whether the result is success for transaction, signed by owner, to transfer 1000 KNDToken from FIRST_ACCOUNT to SECOND_ACCOUNT", async function(){
        await ledgerDeployed.transferFrom(FIRST_ACCOUNT, SECOND_ACCOUNT, VALUE, {from: ledgerOwner});
        
        var balance1 = await ledgerDeployed.balanceOf(FIRST_ACCOUNT);
        assert.equal(balance1.toNumber(), 0, "The token balance of FIRST_ACCOUNT should be 0, but it is " + balance1.toNumber());
        
        var balance2 = await ledgerDeployed.balanceOf(SECOND_ACCOUNT);
        assert.equal(balance2.toNumber(), VALUE, "The token balance of knode_account should be " + VALUE + ", but it is " + balance2.toNumber());
    });

    it ("check whether the result is failed for transaction to transfer 1 ether", async function(){
        try {
            await ledgerDeployed.send(1e18);
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

    it ("check whether the owner can be changed when the contract is not sealed", async function() {
        await ledgerDeployed.transferOwnership(FIRST_ACCOUNT);
        ledgerOwner = await ledgerDeployed.owner();
        assert.equal(ledgerOwner, FIRST_ACCOUNT, "The address of KNDTokenLedger contract should be " + FIRST_ACCOUNT + ", but it is " + ledgerOwner);
    });

    it ("check whether the result is failed for transaction, signed by not owner,  to seal contract", async function() {
        try {
            await ledgerDeployed.seal({from: SECOND_ACCOUNT});
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

    it ("check whether the result is success for transaction, signed by owner, to seal contract", async function() {
        await ledgerDeployed.seal({from: ledgerOwner});
        var isSealed = await ledgerDeployed.isSealed();
        assert(isSealed, "Expected isSealed = true");
    });

    it ("check whether the owner can not be changed when the contract is sealed", async function() {
        try {
            await ledgerDeployed.transferOwnership(SECOND_ACCOUNT, {from: ledgerOwner});
        } catch (error) {
            var isTransactionReverted = error.message.search('revert') >= 0;
            assert(isTransactionReverted, "Expected revert, got '" + error.message + "' instead");
            return;
        }
        assert.fail('Expected revert not received');
    });

});