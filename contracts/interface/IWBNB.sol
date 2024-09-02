// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

interface IWBNB {
    function deposit() external payable;

    function withdraw(uint) external;
}