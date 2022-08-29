// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Counter {
    string public name;
    uint public count;

    constructor (string memory _name, uint _initCount){
        name = _name;
        count = _initCount;
    }

    function getCount() public view returns (uint) {
        return count;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function IncreaseNum() public {
        count++;
    }

    function decreaseNum() public {
        count--;
    }

    function resetCount() public {
        count = 0;
    }

    function setName(string memory _newName) public {
        name = _newName;
    }


}