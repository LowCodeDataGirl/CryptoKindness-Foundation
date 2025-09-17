// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ITipJar Interface
 * @dev Interface for TipJar donation contract
 * @author CryptoKindness Foundation
 * @notice This contract allows anyone to donate ETH with messages, only owner can withdraw
 */
interface ITipJar {
    
    // ============ EVENTS ============
    
    /**
     * @dev Emitted when someone makes a donation
     * @param donor The address of the person donating (indexed for filtering)
     * @param amount The amount of ETH donated in wei
     * @param message The message left by the donor
     * @param timestamp When the donation was made (block.timestamp)
     */
    event NewTip(
        address indexed donor, 
        uint256 amount, 
        string message, 
        uint256 timestamp
    );

    /**
     * @dev Emitted when owner withdraws funds from the contract
     * @param owner The address that withdrew funds (should always be contract owner)
     * @param amount The amount of ETH withdrawn in wei
     * @param timestamp When the withdrawal happened (block.timestamp)
     */
    event Withdrawal(
        address indexed owner, 
        uint256 amount, 
        uint256 timestamp
    );

    // ============ FUNCTIONS ============

    /**
     * @dev Allows anyone to donate ETH to the contract with an optional message
     * @param message Optional message from the donor (can be empty string "")
     * 
     * Requirements:
     * - Must send at least the minimum donation amount (0.001 ETH)
     * - Message should be reasonable length (implementation defined)
     * 
     * Effects:
     * - Increases contract balance by msg.value
     * - Updates donor's total donation amount
     * - Emits NewTip event
     */
    function donate(string memory message) external payable;

    /**
     * @dev Allows contract owner to withdraw a specific amount of ETH
     * @param amount The amount of ETH to withdraw in wei
     * 
     * Requirements:
     * - Only contract owner can call this function
     * - Amount must be greater than 0
     * - Amount must not exceed current contract balance
     * 
     * Effects:
     * - Transfers specified amount to owner's address
     * - Emits Withdrawal event
     */
    function withdraw(uint256 amount) external;

    /**
     * @dev Allows contract owner to withdraw all available funds
     * 
     * Requirements:
     * - Only contract owner can call this function
     * - Contract must have balance greater than 0
     * 
     * Effects:
     * - Transfers entire contract balance to owner's address
     * - Emits Withdrawal event
     */
    function withdrawAll() external;

    /**
     * @dev Returns the current ETH balance held in the contract
     * @return balance The contract's current balance in wei
     * 
     * Note: This is a view function - it doesn't cost gas when called externally
     */
    function getBalance() external view returns (uint256 balance);

    /**
     * @dev Returns the total amount a specific address has donated over time
     * @param donor The address to check donation history for
     * @return total The cumulative amount this address has donated in wei
     * 
     * Note: This tracks lifetime donations, even if funds have been withdrawn
     */
    function totalDonations(address donor) external view returns (uint256 total);
}

