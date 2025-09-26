import { NETWORK_CONFIG, WALLETCONNECT_PROJECT_ID } from '/src/js/utils/constants.js';

 
let web3Modal;
let provider;
let signer;

function initWeb3Modal() {
    const { createWeb3Modal, defaultConfig } = window.Web3Modal;
    
    const sepolia = {
        chainId: NETWORK_CONFIG.chainId,
        name: NETWORK_CONFIG.chainName,
        currency: 'ETH',
        explorerUrl: NETWORK_CONFIG.blockExplorer,
        rpcUrl: NETWORK_CONFIG.rpcUrl
    };
    
    const metadata = {
        name: 'CryptoKindness Foundation',
        description: 'Transparent crypto donations',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`]
    };
    
    const config = defaultConfig({ metadata });
    
    web3Modal = createWeb3Modal({
        ethersConfig: config,
        chains: [sepolia],
        projectId: WALLETCONNECT_PROJECT_ID
    });
}

 
document.addEventListener('DOMContentLoaded', initWeb3Modal);

export async function requestConnection() {
    try {
        await web3Modal.open();
        
        
        provider = new window.ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
 
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