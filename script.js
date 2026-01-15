// DOM Elements
const resetForm = document.getElementById('resetForm');
const keyInput = document.getElementById('key');
const submitBtn = document.getElementById('submitBtn');
const togglePasswordBtn = document.getElementById('togglePassword');
const statusContainer = document.getElementById('statusContainer');
const statusMessage = document.getElementById('statusMessage');
const statusDetails = document.getElementById('statusDetails');
const successMessage = document.getElementById('successMessage');
const mainCard = document.querySelector('.main-card');
const newResetBtn = document.getElementById('newResetBtn');

const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Service
const SERVICE = 'purgeoff';

// API Configuration
const API_BASE = 'https://pandadevelopment.net/api/reset-hwid';

// Toggle Password Visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = keyInput.getAttribute('type') === 'password' ? 'text' : 'password';
    keyInput.setAttribute('type', type);
});

// Handle Form Submission
resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const key = keyInput.value.trim();

    if (!key) {
        showStatus('error', 'Validation Error', 'Please enter your API key');
        return;
    }

    await resetHWID(SERVICE, key);
});

// Reset Form and Show New Reset Button
newResetBtn.addEventListener('click', () => {
    resetForm.reset();
    successMessage.classList.add('hidden');
    mainCard.classList.remove('hidden');
    statusContainer.classList.add('hidden');
    keyInput.focus();
});

// API Call Function
async function resetHWID(service, key) {
    showStatus('loading', 'Processing...', 'Sending reset request to server');
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    try {
        const url = `${API_BASE}?service=${encodeURIComponent(service)}&key=${encodeURIComponent(key)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            showSuccess(service, key, data);
        } else {
            // Error from API
            const errorMsg = data.message || data.error || 'Reset failed. Please check your key.';
            showStatus('error', 'Reset Failed', errorMsg);
        }
    } catch (error) {
        // Network or parsing error
        console.error('Error:', error);
        let errorMsg = error.message;
        
        if (error instanceof TypeError) {
            errorMsg = 'Network error: Unable to connect to the reset service. Please check your internet connection.';
        }
        
        showStatus('error', 'Connection Error', errorMsg);
    } finally {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

// Show Status Message
function showStatus(type, title, message) {
    statusContainer.classList.remove('hidden', 'error', 'success', 'loading');
    statusContainer.classList.add(type);
    
    statusMessage.textContent = title;
    statusDetails.textContent = message;
    
    // Auto-hide success messages after 3 seconds (if not for success card)
    if (type === 'success') {
        setTimeout(() => {
            statusContainer.classList.add('hidden');
        }, 3000);
    }
}

// Show Success Screen
function showSuccess(service, key, responseData) {
    const successText = document.getElementById('successText');
    
    // Create detailed response message
    let details = `Service: ${service}\n`;
    details += `Status: Successful Reset\n`;
    
    if (responseData.hwid) {
        details += `New HWID: ${responseData.hwid}\n`;
    }
    if (responseData.message) {
        details += `Message: ${responseData.message}`;
    }
    
    successText.textContent = 'Your HWID has been successfully reset. You can now use your service with the new hardware ID.';
    
    mainCard.classList.add('hidden');
    successMessage.classList.remove('hidden');
    statusContainer.classList.add('hidden');
    
    // Log successful reset
    console.log('Reset successful:', {
        service,
        timestamp: new Date().toISOString(),
        response: responseData
    });
}

// Auto-focus first input on load
window.addEventListener('load', () => {
    keyInput.focus();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        resetForm.dispatchEvent(new Event('submit'));
    }
});
