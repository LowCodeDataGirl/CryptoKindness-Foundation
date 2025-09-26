export { isWalletInstalled, requestConnection };

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isWalletInstalled() {
     return window.ethereum || isMobile();
}

async function requestConnection() {
     if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            console.log("Connected account:", accounts);
            alert("Wallet connected successfully!");
            document.getElementById("connect-wallet").textContent = "Connected";
            return accounts;
        } catch (error) {
            console.error("User rejected the connection request", error);
        }
    }
     else if (isMobile()) {
        const currentUrl = window.location.href;
        const metamaskDeepLink = `https://metamask.app.link/dapp/${currentUrl.replace('https://', '')}`;
        
        window.open(metamaskDeepLink, '_blank');
        alert("Opening MetaMask app. Please approve the connection and return to this page.");
    }
    else {
        alert("No wallet found. Please install MetaMask or another wallet.");
    }
}


 
