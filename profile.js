// Profile Page JavaScript

// Check if user is logged in
if (!currentUser) {
    window.location.href = 'login.html';
}

// Load profile data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfileFromServer();
});

// Load profile data from server
async function loadProfileFromServer() {
    try {
        const result = await apiRequest('/profile', 'GET');
        
        if (result.success && result.user) {
            const user = result.user;
            
            // Update current user
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Display profile data
            document.getElementById('displayName').textContent = user.name || 'N/A';
            document.getElementById('displayEmail').textContent = user.email || 'N/A';
            document.getElementById('displayPhone').textContent = user.phone || 'N/A';
            
            // Format join date
            const joinDate = user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A';
            document.getElementById('displayJoinDate').textContent = joinDate;
            
            // Load profile picture
            if (user.profilePicture) {
                document.getElementById('profilePicture').src = user.profilePicture;
            }
            
            // Load About Me
            if (user.aboutMe) {
                document.getElementById('aboutMeText').textContent = user.aboutMe;
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to localStorage data
        loadProfileData();
    }
}

// Fallback: Load profile data from localStorage
function loadProfileData() {
    if (currentUser) {
        document.getElementById('displayName').textContent = currentUser.name || 'N/A';
        document.getElementById('displayEmail').textContent = currentUser.email || 'N/A';
        document.getElementById('displayPhone').textContent = currentUser.phone || 'N/A';
        
        const joinDate = currentUser.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString() : 'N/A';
        document.getElementById('displayJoinDate').textContent = joinDate;
        
        if (currentUser.profilePicture) {
            document.getElementById('profilePicture').src = currentUser.profilePicture;
        }
        
        if (currentUser.aboutMe) {
            document.getElementById('aboutMeText').textContent = currentUser.aboutMe;
        }
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
        reader.onload = async function(event) {
            const imageData = event.target.result;
            document.getElementById('profilePicture').src = imageData;
            
            // Save to server
            const result = await apiRequest('/profile', 'PUT', {
                profilePicture: imageData
            });
            
            if (result.success) {
                currentUser.profilePicture = imageData;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showModal('Profile picture updated successfully! 📸', true);
            } else {
                showModal('Failed to save profile picture', false);
            }
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
    const phone = document.getElementById('editPhone').value;
    
    // Validate phone number
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    // Save to server
    const result = await apiRequest('/profile', 'PUT', {
        name: name,
        phone: phone
    });
    
    if (result.success) {
        // Update local user object
        currentUser.name = name;
        currentUser.phone = phone;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update display
        loadProfileData();
        toggleEditMode();
        
        showModal('Profile updated successfully! ✅', true);
    } else {
        showModal(result.message || 'Failed to update profile', false);
    }
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
async function saveAboutMe() {
    const aboutMeText = document.getElementById('aboutMeTextarea').value.trim();
    
    // Save to server
    const result = await apiRequest('/profile', 'PUT', {
        aboutMe: aboutMeText
    });
    
    if (result.success) {
        if (aboutMeText) {
            document.getElementById('aboutMeText').textContent = aboutMeText;
            currentUser.aboutMe = aboutMeText;
        } else {
            document.getElementById('aboutMeText').textContent = 'No bio added yet. Click edit to add something about yourself!';
            currentUser.aboutMe = '';
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showModal('Bio updated successfully! ✅', true);
    } else {
        showModal(result.message || 'Failed to save bio', false);
    }
    
    toggleAboutEdit();
}
