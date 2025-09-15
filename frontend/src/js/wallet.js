export { isWalletInstalled, requestConnection };

function isWalletInstalled() {
     return window.ethereum;
}

async function requestConnection() {
    if (isWalletInstalled()) {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            console.log("Connected account:", accounts);
            alert("Wallet connected successfully!");
            document.getElementById("connect-wallet").textContent = "Connected";

        } catch (error) {
            console.error("User rejected the connection request", error);
        }
    } else {
        alert("No wallet found. Please install Metamask or another Wallet.")

    }
}

 
