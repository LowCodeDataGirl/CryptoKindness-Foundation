import { isWalletInstalled,requestConnection } from './wallet.js';
import { sendDonation } from './donation.js';
import { withdrawAmount, withdrawAll, updateBalanceDisplay } from './owner.js';

document.addEventListener("DOMContentLoaded", function() {
    const connectBtn = document.getElementById("connect-wallet");
    const donateBtn = document.getElementById("donate-btn");
    const withdrawBtn = document.getElementById("withdraw-btn");
    const withdrawAllBtn = document.getElementById("withdraw-all-btn");
    
    if (connectBtn) connectBtn.addEventListener("click", requestConnection);
    if (donateBtn) donateBtn.addEventListener("click", sendDonation);
    if (withdrawBtn) withdrawBtn.addEventListener("click", withdrawAmount);
    if (withdrawAllBtn) withdrawAllBtn.addEventListener("click", withdrawAll);
    
    if (withdrawBtn) {
        updateBalanceDisplay();
    }
});