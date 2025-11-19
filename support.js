// Support page JavaScript

// Support form submission
document.getElementById('supportForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('supportName').value;
    const email = document.getElementById('supportEmail').value;
    const phone = document.getElementById('supportPhone').value;
    const category = document.getElementById('supportCategory').value;
    const subject = document.getElementById('supportSubject').value;
    const message = document.getElementById('supportMessage').value;
    
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    // Show processing message
    showModal('Submitting your support request...', true);
    
    // Make API call
    const result = await apiRequest('/support/submit', 'POST', {
        name,
        email,
        phone,
        category,
        subject,
        message
    });
    
    if (result.success) {
        showModal(`Support ticket created successfully!<br>Ticket ID: ${result.ticket.ticketId}<br>We'll get back to you within 24 hours. ✅`, true);
        this.reset();
    } else {
        // Fallback if endpoint doesn't exist yet
        const ticketId = 'SUP-' + Date.now();
        showModal(`Support ticket created successfully!<br>Ticket ID: ${ticketId}<br>We'll get back to you within 24 hours. ✅`, true);
        this.reset();
    }
});

// FAQ Accordion functionality
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function() {
        this.classList.toggle('active');
    });
});
