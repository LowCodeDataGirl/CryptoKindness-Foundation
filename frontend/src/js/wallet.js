import { NETWORK_CONFIG, WALLETCONNECT_PROJECT_ID } from './utils/constants.js';

let provider;
let signer;
let thirdwebConnect;

// Initialize Thirdweb Connect
async function initThirdwebConnect() {
    if (!window.ThirdwebConnect) {
        console.error('Thirdweb Connect not loaded');
        return;
    }

    try {
        thirdwebConnect = window.ThirdwebConnect.ConnectWallet({
            theme: "light",
            modalSize: "wide",
            welcomeScreen: {
                title: "Connect to CryptoKindness",
                subtitle: "Choose your wallet to start donating"
            },
            chains: [{
                chainId: NETWORK_CONFIG.chainId,
                name: NETWORK_CONFIG.chainName,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                blockExplorers: [{
                    name: "Etherscan",
                    url: NETWORK_CONFIG.blockExplorer
                }]
            }]
        });
        
        console.log('Thirdweb Connect initialized');
    } catch (error) {
        console.error('Thirdweb Connect initialization failed:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initThirdwebConnect, 1000);
});

export async function requestConnection() {
    if (!thirdwebConnect) {
        alert('Wallet connection not ready. Please refresh the page.');
        return false;
    }

    try {
        // Open wallet selection modal
        const wallet = await thirdwebConnect.connect();
        
        // Get ethers provider and signer
        provider = new window.ethers.providers.Web3Provider(wallet.getSigner().provider);
        signer = provider.getSigner();
        
        // Update UI
        const connectBtn = document.getElementById("connect-wallet");
        if (connectBtn) connectBtn.textContent = "Connected";
        
        const walletStatus = document.getElementById("wallet-status");
        if (walletStatus) {
            const address = await signer.getAddress();
            walletStatus.textContent = `Connected: ${address.substring(0, 6)}...${address.substring(38)}`;
        }
        
        console.log('Wallet connected successfully');
        return true;
        
    } catch (error) {
        console.error("Connection failed:", error);
        alert("Connection cancelled or failed");
        return false;
    }
}

export function getProvider() { return provider; }
export function getSigner() { return signer; }
export function isWalletInstalled() { return !!thirdwebConnect; }