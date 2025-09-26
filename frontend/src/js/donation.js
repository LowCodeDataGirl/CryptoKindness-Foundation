import { ethers } from 'https://cdn.skypack.dev/ethers@5.7.2';
import { CONTRACT_ADDRESS, CONTRACT_ABI, MIN_DONATION_ETH } from './utils/constants.js';
import { getProvider, getSigner } from './wallet.js';

function validateDonation(amount, message) {
    if (!amount) return "Please enter an amount";
    if (isNaN(amount)) return "Please enter a valid number";
    if (amount < MIN_DONATION_ETH) return "Minimum donation is 0.001 ETH";

    return null;
}

async function sendDonation() {
    const amount = document.getElementById("amount").value;
    const message = document.getElementById("message").value;
    
    const validationError = validateDonation(amount, message);
    if (validationError) {
        alert(validationError);
        return;
    }

    try {
        // Get provider and signer from Web3Modal
        const provider = getProvider();
        const signer = getSigner();
        
        if (!provider || !signer) {
            alert("Please connect your wallet first");
            return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.donate(message, {
            value: ethers.utils.parseEther(amount)
        });

        alert("Donation sent! Transaction hash: " + tx.hash);

    } catch (error) {
        console.error("Donation error:", error);
        alert("Error: " + error.message);
    }
}

export { sendDonation };