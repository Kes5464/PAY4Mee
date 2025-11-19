// Airtime page specific JavaScript

document.getElementById('airtimeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!authToken) {
        showModal('Please login to continue', false);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const network = document.getElementById('airtimeNetwork').value;
    const phone = document.getElementById('airtimePhone').value;
    const amount = document.getElementById('airtimeAmount').value;
    
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    // Show processing message
    showModal('Processing your airtime recharge...', true);
    
    // Make API call
    const result = await apiRequest('/airtime/purchase', 'POST', {
        network,
        phone,
        amount
    });
    
    if (result.success) {
        showModal(`${result.message}<br>Reference: ${result.transaction.reference} ✅`, true);
        this.reset();
    } else {
        showModal(result.message, false);
    }
});
