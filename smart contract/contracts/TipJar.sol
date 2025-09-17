// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import OpenZeppelin's battle-tested Ownable
import "@openzeppelin/contracts/access/Ownable.sol";
// Import our interface that defines what functions we must implement
import "./interfaces/ITipJar.sol";

/**
 * @title TipJar
 * @dev A smart contract for accepting ETH donations with owner-only withdrawals
 * @author CryptoKindness Foundation
 * @notice Anyone can donate ETH with messages, only owner can withdraw funds
 * 
 * Features:
 * - Accept donations with optional messages
 * - Track total donations per address
 * - Owner-only fund withdrawal
 * - Minimum donation requirement (0.001 ETH)
 * - Event emission for frontend integration
 */
contract TipJar is Ownable, ITipJar {
    
    // ============ STATE VARIABLES ============
    
    /**
     * @dev Minimum donation amount required (0.001 ETH)
     * @notice Donations below this amount will be rejected
     */
    uint256 public constant MINIMUM_DONATION = 0.001 ether;
    
    /**
     * @dev Mapping to track total amount donated by each address
     * @notice This accumulates across multiple donations from same address
     */
    mapping(address => uint256) public totalDonated;
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Sets up the TipJar with an initial owner
     * @param initialOwner The address that will own this contract
     * @notice The initial owner can withdraw funds and transfer ownership
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        // Ownable constructor handles setting the owner
        // Our TipJar is now ready to accept donations!
    }
    
    // ============ ERRORS ============
    
    /**
     * @dev Error thrown when donation amount is below minimum requirement
     * @param sent The amount that was sent (in wei)
     * @param required The minimum required amount (in wei)
     */
    error DonationTooSmall(uint256 sent, uint256 required);
    
    /**
     * @dev Error thrown when trying to withdraw zero amount
     */
    error ZeroAmount();
    
    /**
     * @dev Error thrown when trying to withdraw more than available balance
     * @param requested The amount requested for withdrawal
     * @param available The current contract balance
     */
    error InsufficientBalance(uint256 requested, uint256 available);
    
    /**
     * @dev Error thrown when ETH transfer to owner fails
     */
    error TransferFail();
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Allows anyone to donate ETH to the contract with an optional message
     * @param message Optional message from the donor (can be empty string)
     * 
     * Requirements:
     * - Must send at least MINIMUM_DONATION amount
     * - Function must be payable to receive ETH
     * 
     * Effects:
     * - Increases contract's ETH balance by msg.value
     * - Updates totalDonated[msg.sender] by adding msg.value
     * - Emits NewTip event with donor details
     * 
     * @notice This function follows Checks-Effects-Interactions pattern for security
     */
    function donate(string memory message) external payable override {
        // ===== CHECKS (Validate inputs) =====
        
        if (msg.value < MINIMUM_DONATION) {
            revert DonationTooSmall(msg.value, MINIMUM_DONATION);
        }

        
        // ===== EFFECTS (Update state) =====
        // Update donor's total donation amount
        totalDonated[msg.sender] += msg.value;
        
        // ===== INTERACTIONS (Emit events) =====
        // Emit event for frontend integration
        emit NewTip(
            msg.sender,           // donor address
            msg.value,            // donation amount in wei
            message,              // donor's message
            block.timestamp       // when donation was made
        );
        
        // Note: ETH is automatically added to contract balance by the payable function
    }
    
    // ============ INTERNAL WITHDRAWAL LOGIC ============
    
    /**
     * @dev Internal function containing the core withdrawal logic
     * @param amount The amount of ETH to withdraw in wei
     * 
     * Requirements:
     * - Amount must be greater than 0
     * - Amount must not exceed current contract balance
     * 
     * Effects:
     * - Transfers specified amount to owner's address
     * - Emits Withdrawal event
     * 
     * @notice This is internal so it can be called directly by other functions in this contract
     * @notice Uses low-level call for safe ETH transfer
     */
    function _withdraw(uint256 amount) internal {
        // ===== CHECKS (Validate inputs) =====
        if (amount == 0) {
            revert ZeroAmount();
        }
        
        if (amount > address(this).balance) {
            revert InsufficientBalance(amount, address(this).balance);
        }
        
        // ===== EFFECTS (No state changes needed for withdrawal) =====
        
        // ===== INTERACTIONS (External calls) =====
        // Safe ETH transfer using low-level call
        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) {
            revert TransferFail();
        }
        
        // Emit event for transparency
        emit Withdrawal(owner(), amount, block.timestamp);
    }
    
    // ============ PUBLIC WITHDRAWAL INTERFACE ============
    
    /**
     * @dev Allows contract owner to withdraw a specific amount of ETH
     * @param amount The amount of ETH to withdraw in wei
     * 
     * Requirements:
     * - Only contract owner can call this function (enforced by onlyOwner)
     * 
     * @notice This is a thin wrapper around the internal _withdraw function
     */
    function withdraw(uint256 amount) external onlyOwner override {
        _withdraw(amount);
    }
    
    /**
     * @dev Allows contract owner to withdraw all available ETH
     * 
     * Requirements:
     * - Only contract owner can call this function (enforced by onlyOwner)
     * 
     * @notice This is a thin wrapper that gets current balance and calls _withdraw
     */
    function withdrawAll() external onlyOwner override {
        uint256 contractBalance = address(this).balance;
        _withdraw(contractBalance);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Returns the current ETH balance held in the contract
     * @return balance The contract's current balance in wei
     */
    function getBalance() external view override returns (uint256 balance) {
        return address(this).balance;
    }
    
    /**
     * @dev Returns the total amount a specific address has donated over time
     * @param donor The address to check donation history for
     * @return total The cumulative amount this address has donated in wei
     */
    function totalDonations(address donor) external view override returns (uint256 total) {
        return totalDonated[donor];
    }
}