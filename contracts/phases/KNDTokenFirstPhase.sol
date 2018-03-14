pragma solidity 0.4.19;

import "../utils/MathLib.sol";
import "../token/KNDTokenBase.sol";

/// @title First phase managing contract. This contract permits Knode service to mint and transfer tokens. This contract will not be able to mint tokens after the first phase soft cap has been reached.
contract KNDFirstPhase is KNDTokenBase {

    using MathLib for uint256;

    /// @dev Address of Knode token transfering and minting.
    address public knode;
    /// @dev The soft cap of tokens that indicated token amount can be released in this phase by Knode service.
    uint256 public knodeCap;
    /// @dev Number of tokens released in this phase by Knode service.
    uint256 public totalSupplyByKnode;

    /// @dev Cap breach indicator.
    /// @param _totalSupply Number of tokens released in this phase by Knode service.
    event BreakingKnodeCapEvent(uint _totalSupply);

    ///@dev Discard if the sender is not a Knode service address.
    modifier onlyKnode() {
        require(msg.sender == knode);
        _;
    }

    /// @param _ledger Token ledger address.
    /// @param _knode Address of Knode token transfering and minting.
    /// @param _knodeCap The soft cap of tokens can be released in the first phase by Knode service.
    function KNDFirstPhase(KNDTokenLedger _ledger, address _knode, uint256 _knodeCap)
    KNDTokenBase(_ledger)
    public {
        knode = _knode;
        knodeCap = _knodeCap;
    }

    function() public payable {
       revert();
    }

    /// @dev Mint tokens if the knode cap has not break or transfer from knode address or throw if knode address has not enough tokens
    /// @param _to The address that will receive the minted tokens.
    /// @param _value Token ammount to mint or transfer.
    function transferTo(address _to, uint256 _value) public onlyKnode onlyActive {
        if (totalSupplyByKnode < knodeCap) {
            require(ledger.mint(_to, _value));
            Mint(_to, _value);
            totalSupplyByKnode = totalSupplyByKnode.add(_value);
            if (totalSupplyByKnode >= knodeCap)
                BreakingKnodeCapEvent(totalSupplyByKnode);
        } else if (ledger.balanceOf(knode) > _value) {
            require(ledger.transferFrom(knode, _to, _value));
            Transfer(knode, _to, _value);
        } else {
            revert();
        }
    }

    /// @dev Transfer tokens from address _from to knode address
    /// @param _from The address that sends tokens.
    /// @param _value Token amount to transfer.
    function transferFrom(address _from, uint256 _value) public onlyKnode onlyActive {
        require(ledger.transferFrom(_from, knode, _value));
        Transfer(_from, knode, _value);
    }

    /// @dev Change knode address
    /// @param _newKnodeWallet The new address of knode service.
    function updateKnodeWallet(address _newKnodeWallet) public onlyOwner onlyActive validAddress(_newKnodeWallet) {
        var oldKnodeWallet = knode;
        knode = _newKnodeWallet;
        var value = ledger.balanceOf(oldKnodeWallet);
        if (value != 0)
            ledger.transferFrom(oldKnodeWallet, _newKnodeWallet, value);
    }

}