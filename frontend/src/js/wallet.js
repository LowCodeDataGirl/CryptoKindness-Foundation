import { NETWORK_CONFIG, WALLETCONNECT_PROJECT_ID } from '/src/js/utils/constants.js';

let provider;
let signer;

// Test Web3Modal loading
function initWeb3Modal() {
    console.log('Checking Web3Modal:', window.Web3Modal);
    console.log('Available properties:', Object.keys(window.Web3Modal || {}));
    
    if (!window.Web3Modal) {
        console.error('Web3Modal not loaded - trying fallback to basic wallet connection');
        return;
    }
    
    console.log('Web3Modal loaded successfully');
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initWeb3Modal, 100); // Small delay to ensure script loaded
});

export async function requestConnection() {
    console.log('Attempting connection...');
    
    // Fallback to basic MetaMask connection for now
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            provider = new window.ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            console.log("Connected account:", accounts);
            
            // Update UI
            const connectBtn = document.getElementById("connect-wallet");
            if (connectBtn) {
                connectBtn.textContent = "Connected";
            }
            
            const walletStatus = document.getElementById("wallet-status");
            if (walletStatus) {
                const address = await signer.getAddress();
                walletStatus.textContent = `Connected: ${address.substring(0, 6)}...${address.substring(38)}`;
            }
            
            return true;
        } catch (error) {
            console.error("Connection failed:", error);
            alert("Connection failed: " + error.message);
            return false;
        }
    } else {
        alert("No wallet found. Please install MetaMask.");
        return false;
    }
}

export function isWalletInstalled() {
    return !!window.ethereum;
}

export function getProvider() {
    return provider;
}

export function getSigner() {
    return signer;
}