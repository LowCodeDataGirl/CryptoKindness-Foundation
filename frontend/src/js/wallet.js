import { NETWORK_CONFIG } from './utils/constants.js';

let provider;
let signer;

export async function requestConnection() {
    if (window.ethereum) {
        try {
            // Request accounts
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
                            blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18
                            }
                        }]
                    });
                }
            }
            
            provider = new window.ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            // Update UI
            const connectBtn = document.getElementById("connect-wallet");
            if (connectBtn) connectBtn.textContent = "Connected";
            
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
        alert("Please install MetaMask or another Web3 wallet");
        return false;
    }
}

export function getProvider() { return provider; }
export function getSigner() { return signer; }
export function isWalletInstalled() { return !!window.ethereum; }