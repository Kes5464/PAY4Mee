// Betting page specific JavaScript

document.getElementById('bettingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!authToken) {
        showModal('Please login to continue', false);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const platform = document.getElementById('bettingPlatform').value;
    const userId = document.getElementById('bettingUserId').value;
    const amount = document.getElementById('bettingAmount').value;
    
    // Show processing message
    showModal('Processing your betting account funding...', true);
    
    // Make API call
    const result = await apiRequest('/betting/fund', 'POST', {
        platform,
        userId,
        amount
    });
    
    if (result.success) {
        showModal(`${result.message}<br>Reference: ${result.transaction.reference} ✅`, true);
        this.reset();
    } else {
        showModal(result.message, false);
    }
});
