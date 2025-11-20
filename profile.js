// Profile Page JavaScript

// Check if user is logged in
if (!currentUser) {
    window.location.href = 'login.html';
}

// Load profile data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    loadProfilePicture();
    loadAboutMe();
});

// Load profile data
function loadProfileData() {
    if (currentUser) {
        document.getElementById('displayName').textContent = currentUser.name || 'N/A';
        document.getElementById('displayEmail').textContent = currentUser.email || 'N/A';
        document.getElementById('displayPhone').textContent = currentUser.phone || 'N/A';
        
        // Format join date
        const joinDate = currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A';
        document.getElementById('displayJoinDate').textContent = joinDate;
    }
}

// Load profile picture from localStorage
function loadProfilePicture() {
    const savedPicture = localStorage.getItem('profilePicture_' + currentUser.email);
    if (savedPicture) {
        document.getElementById('profilePicture').src = savedPicture;
    }
}

// Load About Me from localStorage
function loadAboutMe() {
    const savedAboutMe = localStorage.getItem('aboutMe_' + currentUser.email);
    if (savedAboutMe) {
        document.getElementById('aboutMeText').textContent = savedAboutMe;
    }
}

// Handle profile picture upload
document.getElementById('profilePictureInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showModal('Image size should be less than 2MB', false);
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            showModal('Please select an image file', false);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            document.getElementById('profilePicture').src = imageData;
            
            // Save to localStorage
            localStorage.setItem('profilePicture_' + currentUser.email, imageData);
            showModal('Profile picture updated successfully! 📸', true);
        };
        reader.readAsDataURL(file);
    }
});

// Toggle edit mode
function toggleEditMode() {
    const editForm = document.getElementById('editForm');
    const isHidden = editForm.style.display === 'none';
    
    if (isHidden) {
        // Populate form with current data
        document.getElementById('editName').value = currentUser.name;
        document.getElementById('editEmail').value = currentUser.email;
        document.getElementById('editPhone').value = currentUser.phone;
        editForm.style.display = 'block';
    } else {
        editForm.style.display = 'none';
    }
}

// Handle profile update form
document.getElementById('updateProfileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    
    // Validate phone number
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    // Update local user object
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update display
    loadProfileData();
    toggleEditMode();
    
    showModal('Profile updated successfully! ✅', true);
});

// Toggle About Me edit mode
function toggleAboutEdit() {
    const display = document.getElementById('aboutMeDisplay');
    const edit = document.getElementById('aboutMeEdit');
    
    const isEditing = edit.style.display === 'block';
    
    if (isEditing) {
        edit.style.display = 'none';
        display.style.display = 'block';
    } else {
        const currentText = document.getElementById('aboutMeText').textContent;
        if (currentText !== 'No bio added yet. Click edit to add something about yourself!') {
            document.getElementById('aboutMeTextarea').value = currentText;
        }
        edit.style.display = 'block';
        display.style.display = 'none';
    }
}

// Save About Me
function saveAboutMe() {
    const aboutMeText = document.getElementById('aboutMeTextarea').value.trim();
    
    if (aboutMeText) {
        document.getElementById('aboutMeText').textContent = aboutMeText;
        localStorage.setItem('aboutMe_' + currentUser.email, aboutMeText);
        showModal('Bio updated successfully! ✅', true);
    } else {
        document.getElementById('aboutMeText').textContent = 'No bio added yet. Click edit to add something about yourself!';
        localStorage.removeItem('aboutMe_' + currentUser.email);
    }
    
    toggleAboutEdit();
}
