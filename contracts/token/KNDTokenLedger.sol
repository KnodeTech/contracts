pragma solidity 0.4.19;

import "../utils/MathLib.sol";
import "../utils/Destructible.sol";

/// @title The ledger of KND tokens. This contract has a storage for tokens and permit its owner to transfer, mint and burn tokens.
contract KNDTokenLedger is Destructible {
    using MathLib for uint256;

    ///@dev The total token supply.
    uint256 public totalSupply;

    ///@dev Indicates the lock of contract. If the contract is locked the owner cannot be changed.
    bool public isSealed;

    mapping(address => uint256) balances;

    ///@dev Discards if the contract is locked.
    modifier onlyUnsealed() {
        require(!isSealed);
        _;
    }

    function() public payable {
       revert();
    }

  /// @dev Token is the total funds available to _holder.
  /// @param _holder The address of the person whose balance we check.
  /// @return _balance The balance of the user provided as argument.
    function balanceOf(address _holder) public constant returns (uint256 _balance) {
        _balance = balances[_holder];
    }

    /// @dev Locks the contract.
    /// @return _isSuccess A boolean that indicates if the operation was successful.
    function seal() public onlyOwner onlyUnsealed returns (bool _isSuccess) {
        isSealed = true;
        _isSuccess = true;
    }

    /// @dev Allows the current owner to transfer control of the contract to a newOwner if the contract is unsealed.
    /// @return _isSuccess A boolean that indicates if the operation was successful.
    function transferOwnership(address _newOwner) public onlyUnsealed returns (bool _isSuccess) {
        _isSuccess = super.transferOwnership(_newOwner);
    }

    /// @dev Transfer tokens from one address to another.
    /// @param _from The address which you want to send tokens from.
    /// @param _to The address which you want to transfer to.
    /// @param _value Token amount  to transfer.
    /// @return _isSuccess A boolean that indicates if the operation was successful.
    function transferFrom(address _from, address _to, uint256 _value) 
        public
        validAddress(_from)
        validAddress(_to)
        onlyOwner
        returns (bool _isSuccess)
    {
        require(_value <= balances[_from]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        _isSuccess = true;
    }

   /// @dev Function to mint tokens
   /// @param _to The address that will receive the minted tokens.
   /// @param _value Token amount to mint.
   /// @return _isSuccess A boolean that indicates if the operation was successful.
    function mint(address _to, uint256 _value) 
        public
        onlyOwner
        validAddress(_to)
        returns (bool _isSuccess)
    {
        totalSupply = totalSupply.add(_value);
        balances[_to] = balances[_to].add(_value);
        _isSuccess = true;
    }

    /// @dev Burns tokens.
    /// @param _from The address which you want to burns tokens from.
    /// @param _value The amount of token to be burned.
    /// @return _isSuccess A boolean that indicates if the operation was successful.
    function burn(address _from, uint256 _value) 
        public
        onlyOwner
        validAddress(_from)
        returns (bool _isSuccess)
    {
        require(balances[_from] >= _value);
        totalSupply = totalSupply.sub(_value);
        balances[_from] = balances[_from].sub(_value);
        _isSuccess = true;
    }

}