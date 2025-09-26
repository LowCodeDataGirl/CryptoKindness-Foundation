import { ethers } from 'https://cdn.skypack.dev/ethers@5.7.2';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from 'src/js/utils/constants.js';
export {withdrawAmount, withdrawAll, updateBalanceDisplay};

function validateWithdrawAmount(amount) {
    if (!amount) return "Please enter an amount";
    if (isNaN(amount)) return "Please enter a valid number";
    if (amount <= 0) return "Amount must be greater than 0";
    
    return null;
}

async function checkIfOwner() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const contractOwner = await contract.owner();
    const connectedAddress = await signer.getAddress();

    if (contractOwner.toLowerCase() === connectedAddress.toLowerCase()){
        return true;
    } else {
        alert("You are not the owner");
        return false;
    }
}

async function withdrawAmount() {
    const amount = document.getElementById("withdraw-amount").value;

    const validationError = validateWithdrawAmount(amount);
    if (validationError) {
        alert(validationError);
        return;
    }
    const isOwner = await checkIfOwner();
    if (!isOwner) return;

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.withdraw(ethers.utils.parseEther(amount));

        alert("Withdrawal successful! Transaction hash: " + tx.hash);
        updateBalanceDisplay();
    } catch (error) {
        alert("Error:" + error.message);
    }
    
}

async function withdrawAll() {
    const isOwner = await checkIfOwner();
    if (!isOwner) return;

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.withdrawAll();

        alert("Withdrawal successful! Transaction hash: " + tx.hash);
        updateBalanceDisplay();
    } catch (error) {
        alert("Error:" + error.message);
    }
}

async function getContractBalance() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const balance = await contract.getBalance();
        return ethers.utils.formatEther(balance);

     } catch (error) {
        console.error("Error getting balance:", error);
        return "0";
     }
    }


async function updateBalanceDisplay() {
    const balance = await getContractBalance();
    document.getElementById("contract-balance").textContent = balance + " ETH";
}