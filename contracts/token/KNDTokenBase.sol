pragma solidity 0.4.19;

import "../utils/MathLib.sol";
import "../utils/Destructible.sol";
import "./KNDTokenLedger.sol";

contract KNDTokenBase is Destructible {

    /// @dev Token name
    string constant public name = "Knode token";
    /// @dev Token symbol.
    string constant public symbol = "KND";
    /// @dev Numbers after decimal point
    uint256 constant public decimal = 18;

    /// @dev KND token ledger address
    KNDTokenLedger public ledger;

    /// @dev Indicated if the contract is active. Transfers are possible if the contract is active.
    bool public isActive;

    /// @dev Triggered when tokens are transferred.
    /// @param _from The address which sent tokens.
    /// @param _to The address which received tokens.
    /// @param _value Token amount.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /// @dev Token minting indication event.
    /// @param _to The address which received tokens.
    /// @param _value Token amount.
    event Mint(address indexed _to, uint _value);

    ///@dev Throws if the contact is inactive.
    modifier onlyActive(){
        require(isActive);
        _;
    }

    ///@param _ledger Token ledger address.
    function KNDTokenBase(KNDTokenLedger _ledger) public {
        ledger = _ledger;
    }

    /// @dev The total token supply.
    function totalSupply() public constant returns(uint256) {
        return ledger.totalSupply();
    }

    /// @dev Token is the total funds available to _holder.
    function balanceOf(address _holder) public constant returns (uint256) {
        return ledger.balanceOf(_holder);
    }

    /// @dev Activate the contract. Discard if the contract is not the ledger owner.
    function activate() public onlyOwner {
        require(!isActive);
        require(ledger.owner() == address(this));
        isActive = true;
    }

    ///@dev Terminates the contract.
    ///@param _replaced The address that overtakes the ownership of ledger and current balance.
    function destroy(address _replaced) public onlyOwner validAddress(_replaced) {
        ledger.transferOwnership(_replaced);
        super.destroy(_replaced);
    }

}