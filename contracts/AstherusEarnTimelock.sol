// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import '@openzeppelin/contracts/governance/TimelockController.sol';

contract AstherusEarnTimelock is TimelockController {
    
    event MaxDelayChanged(uint256 oldValue, uint256 newValue);

    uint256 public MAX_DELAY;

    constructor(uint256 minDelay, uint256 maxDelay, address[] memory proposers, address[] memory executors) 
        TimelockController(minDelay, proposers, executors, address(0)) 
    {
        require(maxDelay > minDelay + 3600, "illegal maxDelay");
        MAX_DELAY = maxDelay; 
    }

    function setMaxDelay(uint256 maxDelay) external onlyRoleOrOpenRole(DEFAULT_ADMIN_ROLE) {
        require(maxDelay > getMinDelay() + 3600, "illegal maxDelay");
        emit MaxDelayChanged(MAX_DELAY, maxDelay);
        MAX_DELAY = maxDelay;
    }

    function getTimestamp(bytes32 id) public view override returns (uint256) {
        uint timestamp = super.getTimestamp(id);
        if (timestamp  >= block.timestamp + MAX_DELAY) {
            return 0;
        } else {
            return timestamp;
        }
    }

}

