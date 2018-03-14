pragma solidity 0.4.19;


import "./Ownable.sol";


contract Destructible is Ownable {

  ///@dev Terminates the contract.
  ///@param _replaced The address to transfers the current balance.
  function destroy(address _replaced) onlyOwner public {
    selfdestruct(_replaced);
  }
}