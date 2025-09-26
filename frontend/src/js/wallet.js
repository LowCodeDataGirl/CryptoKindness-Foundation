import { NETWORK_CONFIG, WALLETCONNECT_PROJECT_ID } from '/src/js/utils/constants.js';

let provider;
let signer;
let walletConnectClient;

// Initialize WalletConnect
async function initWalletConnect() {
    try {
        if (window.WalletConnectSignClient) {
            walletConnectClient = await window.WalletConnectSignClient.init({
                projectId: WALLETCONNECT_PROJECT_ID,
                metadata: {
                    name: 'CryptoKindness Foundation',
                    description: 'Transparent crypto donations',
                    url: window.location.origin,
                    icons: [`${window.location.origin}/favicon.ico`]
                }
            });
        }
    } catch (error) {
        console.log('WalletConnect init failed, will use injected wallet only:', error);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initWalletConnect, 500);
});

export async function requestConnection() {
    console.log('Window.ethereum exists:', !!window.ethereum);
    console.log('WalletConnect client exists:', !!walletConnectClient);
    
    // Desktop: Try injected wallet first (MetaMask, Coinbase, etc.)
    if (window.ethereum) {
        console.log('Attempting injected wallet connection...');
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Accounts received:', accounts);
            
            // Switch to correct network
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }]
                });
            } catch (switchError) {
                console.log('Network switch error:', switchError);
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                            chainName: NETWORK_CONFIG.chainName,
                            rpcUrls: [NETWORK_CONFIG.rpcUrl],
                            blockExplorerUrls: [NETWORK_CONFIG.blockExplorer]
                        }]
                    });
                }
            }
            
            provider = new window.ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            console.log('Connection successful!');
            updateUI();
            return true;
            
        } catch (error) {
            console.error("Injected wallet connection failed:", error);
            alert("Wallet connection failed: " + error.message);
            return false; // Add explicit return here
        }
    }
    
    // If we get here, no injected wallet was found
    console.log('No injected wallet found, checking WalletConnect...');
    
    // Mobile/Universal: Try WalletConnect (rest of WalletConnect code...)
    
    // Only show this error if both methods fail
    alert("Please install a Web3 wallet like MetaMask, or use a wallet app that supports WalletConnect");
    return false;
}

function updateUI() {
    const connectBtn = document.getElementById("connect-wallet");
    if (connectBtn) connectBtn.textContent = "Connected";
    
    const walletStatus = document.getElementById("wallet-status");
    if (walletStatus && signer) {
        signer.getAddress().then(address => {
            walletStatus.textContent = `Connected: ${address.substring(0, 6)}...${address.substring(38)}`;
        });
    }
}

export function getProvider() { return provider; }
export function getSigner() { return signer; }
export function isWalletInstalled() { return !!window.ethereum || !!walletConnectClient; }

