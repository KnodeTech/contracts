pragma solidity 0.4.18;

contract Ownable {

  /// @dev The owner of this contact.
  address public owner;

  /// @dev The event that indicates that ownership of the contract was transferred to the new owner.
  /// @param previousOwner Address of previous owner.
  /// @param newOwner Address of new owner.
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  function Ownable() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier validAddress(address addressValue) {
        require(addressValue != 0x0);
        _;
  }

  function transferOwnership(address _newOwner) public onlyOwner validAddress(_newOwner) returns (bool _isSuccess) {
    OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
    _isSuccess = true;
  }

}