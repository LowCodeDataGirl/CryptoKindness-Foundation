import { NETWORK_CONFIG, WALLETCONNECT_PROJECT_ID } from '/src/js/utils/constants.js';

// Web3Modal configuration
let web3Modal;
let provider;
let signer;

// Initialize Web3Modal
function initWeb3Modal() {
    // Check if Web3Modal loaded correctly
    if (!window.Web3Modal) {
        console.error('Web3Modal not loaded');
        return;
    }

    const { createWeb3Modal, defaultWagmiConfig } = window.Web3Modal;
    
    if (!createWeb3Modal) {
        console.error('createWeb3Modal not found');
        return;
    }

    try {
        web3Modal = createWeb3Modal({
            projectId: WALLETCONNECT_PROJECT_ID,
            chains: [{
                id: NETWORK_CONFIG.chainId,
                name: NETWORK_CONFIG.chainName,
                network: 'sepolia',
                nativeCurrency: {
                    decimals: 18,
                    name: 'ETH',
                    symbol: 'ETH',
                },
                rpcUrls: {
                    default: {
                        http: [NETWORK_CONFIG.rpcUrl],
                    },
                    public: {
                        http: [NETWORK_CONFIG.rpcUrl],
                    },
                },
                blockExplorers: {
                    default: { name: 'Sepolia', url: NETWORK_CONFIG.blockExplorer },
                },
            }],
            metadata: {
                name: 'CryptoKindness Foundation',
                description: 'Transparent crypto donations',
                url: window.location.origin,
                icons: [`${window.location.origin}/favicon.ico`]
            }
        });
    } catch (error) {
        console.error('Web3Modal initialization failed:', error);
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initWeb3Modal);

export async function requestConnection() {
    if (!web3Modal) {
        alert('Web3Modal not initialized');
        return false;
    }

    try {
        await web3Modal.open();
        
        // Get the connected provider and signer
        if (window.ethereum) {
            provider = new window.ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
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
        }
        
        return true;
    } catch (error) {
        console.error("Connection failed:", error);
        return false;
    }
}

export function isWalletInstalled() {
    return true;
}

export function getProvider() {
    return provider;
}

export function getSigner() {
    return signer;
}