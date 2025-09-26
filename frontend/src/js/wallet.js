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
    // Desktop: Try injected wallet first (MetaMask, Coinbase, etc.)
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Switch to correct network
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }]
                });
            } catch (switchError) {
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
            
            updateUI();
            return true;
            
        } catch (error) {
            console.error("Injected wallet connection failed:", error);
        }
    }
    
    // Mobile/Universal: Try WalletConnect
    if (walletConnectClient) {
        try {
            const { uri, approval } = await walletConnectClient.connect({
                requiredNamespaces: {
                    eip155: {
                        methods: ['eth_sendTransaction', 'eth_signTransaction', 'eth_sign', 'personal_sign'],
                        chains: [`eip155:${NETWORK_CONFIG.chainId}`],
                        events: ['accountsChanged', 'chainChanged']
                    }
                }
            });
            
            if (uri) {
                // Show QR code or deep link
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                if (isMobile) {
                    // Mobile: Open wallet app
                    window.open(`https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`, '_blank');
                    alert('Opening wallet app. Please approve the connection and return to this page.');
                } else {
                    // Desktop: Show QR code
                    alert(`Please scan this QR code with your mobile wallet:\n${uri}`);
                }
            }
            
            const session = await approval();
            console.log('WalletConnect session established:', session);
            
            // Set up provider for WalletConnect
            provider = new window.ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
            // Note: WalletConnect transactions require special handling
            
            updateUI();
            return true;
            
        } catch (error) {
            console.error("WalletConnect failed:", error);
        }
    }
    
    // Fallback message
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