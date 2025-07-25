let currentUser = null;
let donors = [];
let hospitals = [];
let bloodRequests = [];
let pendingHospitals = [];
let dashboardData = null;

function showPage(pageId) {
 
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');


    const heroSection = document.querySelector('.hero-section');
    if (pageId === 'homepage') {
        heroSection.classList.remove('hidden');
    } else {
        heroSection.classList.add('hidden');
    }

    if (pageId === 'admin-login') {
        setTimeout(() => {
            const adminEmail = document.getElementById('admin-email');
            if (adminEmail) adminEmail.focus();
        }, 100);
    }
}

function adminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    const loadingDiv = document.getElementById('admin-loading');
    const errorDiv = document.getElementById('admin-error');
    const form = document.getElementById('admin-login-form');
    
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');
    if (form) form.style.display = 'none';


    setTimeout(() => {
        if (email === 'admin@savelife.com' && password === 'admin123') {
            currentUser = { type: 'admin', email };
            showPage('admin-dashboard');
            loadDashboardData();
        } else {
            if (errorDiv) errorDiv.classList.remove('hidden');
        }
        
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (form) form.style.display = 'block';
    }, 1000);
}

function hospitalLogin(event) {
    event.preventDefault();
    const email = document.getElementById('hospital-email').value;
    const password = document.getElementById('hospital-password').value;

    const loadingDiv = document.getElementById('hospital-loading');
    const errorDiv = document.getElementById('hospital-error');
    
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');

    fetch('hospital_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
    })
    .then(res => res.text())
    .then(result => {
        if (loadingDiv) loadingDiv.classList.add('hidden');
        
        if (result === 'success') {
            currentUser = { type: 'hospital', email };
            showPage('hospital-dashboard');
            loadDashboardData();
        } else {
            if (errorDiv) errorDiv.classList.remove('hidden');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (errorDiv) errorDiv.classList.remove('hidden');
    });
}



function viewHospitalSection(type) {
    if (!dashboardData || !currentUser || currentUser.type !== 'hospital') return;
    
    const section = document.querySelector('#hospital-dashboard .donors-section');
    if (!section) return;
    
    const titleElement = section.querySelector('h2');
    
    let html = '';
    let title = '';
    
   
    const hospitalRequests = dashboardData.bloodRequests.filter(r => r.hospitalEmail === currentUser.email);
    
    switch(type) {
        case 'blood-inventory':
            title = 'Blood Inventory Status';
            html = `
                <div class="blood-inventory">
                    <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3 style="color: #9b59b6; margin-bottom: 15px;">Current Blood Inventory</h3>
                        <p style="margin-bottom: 15px; color: #666;">
                            This section shows the current blood inventory status. Monitoring your blood inventory helps ensure you have adequate supplies for emergency situations.
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/A_plus.png" alt="A+" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>A+</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">5 units</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/A_minus.png" alt="A-" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>A-</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">3 units</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/B_plus.png" alt="B+" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>B+</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">4 units</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/B_minus.png" alt="B-" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>B-</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">2 units</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/AB_plus.png" alt="AB+" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>AB+</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">1 unit</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/AB_minus.png" alt="AB-" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>AB-</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">1 unit</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/O_plus.png" alt="O+" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>O+</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">6 units</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 3px solid #e74c3c;">
                                <img src="icons/O_minus.png" alt="O-" style="width: 40px; height: 40px; margin-bottom: 10px;">
                                <h4>O-</h4>
                                <p style="font-size: 1.2rem; font-weight: bold; color: #333;">3 units</p>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <h4 style="color: #333; margin-bottom: 10px;">Need More Blood?</h4>
                            <p style="color: #666; margin-bottom: 15px;">Running low on certain blood types? Create a blood request to alert nearby donors.</p>
                            <button class="btn btn-primary" onclick="showBloodRequestModal()">Create Blood Request</button>
                            <a href="hospital_map.html" class="btn btn-outline" style="margin-left: 10px;">
                                <i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i> Find Donors
                            </a>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'donors':
            title = 'Available Donors';
            if (dashboardData.donors.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">👥</span>
                        <p>No donors available</p>
                    </div>
                `;
            } else {
                html = `
                    <div class="donors-list">
                        ${dashboardData.donors.map(d => `
                            <div class="donor-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h3 style="color: #e74c3c; margin-bottom: 10px;">${d.name}</h3>
                                <p style="margin: 4px 0; color: #555;"><strong>Blood Type:</strong> ${d.bloodType}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Phone:</strong> ${d.phone}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Location:</strong> ${d.location}</p>
                                <button class="btn btn-secondary" onclick="contactDonor('${d.phone}')" style="margin-top: 10px;">Contact</button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        case 'requests':
            title = 'All My Blood Requests';
            if (hospitalRequests.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">🩸</span>
                        <p>No blood requests found</p>
                        <button class="btn btn-primary" onclick="showBloodRequestModal()" style="margin-top: 15px;">Create New Request</button>
                    </div>
                `;
            } else {
                html = `
                    <div class="requests-list">
                        <button class="btn btn-primary" onclick="showBloodRequestModal()" style="margin-bottom: 20px;">Create New Request</button>
                        ${hospitalRequests.map(r => `
                            <div class="request-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h3 style="color: #e74c3c; margin-bottom: 10px;">Blood Request #${r.id || 'N/A'}</h3>
                                <p style="margin: 4px 0; color: #555;"><strong>Blood Type:</strong> ${r.bloodType}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Quantity:</strong> ${r.quantity} units</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Urgency:</strong> <span style="color: ${r.urgency === 'Critical' ? '#e74c3c' : r.urgency === 'High' ? '#f39c12' : '#27ae60'};">${r.urgency}</span></p>
                                <p style="margin: 4px 0; color: #555;"><strong>Status:</strong> <span style="color: ${r.status === 'completed' ? '#27ae60' : r.status === 'pending' ? '#f39c12' : '#e74c3c'};">${r.status}</span></p>
                                <p style="margin: 4px 0; color: #555;"><strong>Date:</strong> ${r.created_at || 'N/A'}</p>
                                ${r.notes ? `<p style="margin: 4px 0; color: #555;"><strong>Notes:</strong> ${r.notes}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        case 'pending':
            title = 'Pending Blood Requests';
            const pendingRequests = hospitalRequests.filter(r => r.status === 'pending');
            if (pendingRequests.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">⏳</span>
                        <p>No pending requests</p>
                        <button class="btn btn-primary" onclick="showBloodRequestModal()" style="margin-top: 15px;">Create New Request</button>
                    </div>
                `;
            } else {
                html = `
                    <div class="requests-list">
                        <button class="btn btn-primary" onclick="showBloodRequestModal()" style="margin-bottom: 20px;">Create New Request</button>
                        ${pendingRequests.map(r => `
                            <div class="request-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #f39c12;">
                                <h3 style="color: #e74c3c; margin-bottom: 10px;">Pending Request #${r.id || 'N/A'}</h3>
                                <p style="margin: 4px 0; color: #555;"><strong>Blood Type:</strong> ${r.bloodType}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Quantity:</strong> ${r.quantity} units</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Urgency:</strong> <span style="color: ${r.urgency === 'Critical' ? '#e74c3c' : r.urgency === 'High' ? '#f39c12' : '#27ae60'};">${r.urgency}</span></p>
                                <p style="margin: 4px 0; color: #555;"><strong>Date Created:</strong> ${r.created_at || 'N/A'}</p>
                                ${r.notes ? `<p style="margin: 4px 0; color: #555;"><strong>Notes:</strong> ${r.notes}</p>` : ''}
                                <p style="margin: 10px 0 0 0; color: #f39c12; font-style: italic;"><strong>Status:</strong> Waiting for donor responses...</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        case 'completed':
            title = 'Successful Donations';
            const completedRequests = hospitalRequests.filter(r => r.status === 'completed');
            if (completedRequests.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">✅</span>
                        <p>No completed donations yet</p>
                        <p style="color: #666; margin-top: 10px;">Create blood requests to start receiving donations</p>
                        <button class="btn btn-primary" onclick="showBloodRequestModal()" style="margin-top: 15px;">Create New Request</button>
                    </div>
                `;
            } else {
                html = `
                    <div class="requests-list">
                        ${completedRequests.map(r => `
                            <div class="request-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #27ae60;">
                                <h3 style="color: #27ae60; margin-bottom: 10px;">✅ Completed Donation #${r.id || 'N/A'}</h3>
                                <p style="margin: 4px 0; color: #555;"><strong>Blood Type:</strong> ${r.bloodType}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Quantity:</strong> ${r.quantity} units</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Urgency:</strong> ${r.urgency}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Date Completed:</strong> ${r.updated_at || r.created_at || 'N/A'}</p>
                                ${r.notes ? `<p style="margin: 4px 0; color: #555;"><strong>Notes:</strong> ${r.notes}</p>` : ''}
                                <p style="margin: 10px 0 0 0; color: #27ae60; font-weight: bold;">Thank you for saving lives! 💚</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        default:
            title = 'Dashboard Overview';
            html = `
                <div class="no-donors">
                    <span style="font-size: 60px;">📊</span>
                    <p>Click on a stat card above to view detailed information</p>
                </div>
            `;
    }

   
    if (titleElement) {
        titleElement.textContent = title;
    }
    
    
    const existingContent = section.querySelector('.no-donors, .donors-list, .hospitals-list, .requests-list');
    if (existingContent) {
        existingContent.outerHTML = html;
    } else {
       
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = html;
        section.appendChild(contentDiv.firstElementChild);
    }
}


function updateHospitalDashboard() {
    if (!currentUser || currentUser.type !== 'hospital') return;
    
    const stats = document.querySelectorAll('#hospital-dashboard .stat-card .number');
    if (stats.length >= 4) {
        const hospitalRequests = bloodRequests.filter(r => r.hospitalEmail === currentUser.email);
        const pendingRequests = hospitalRequests.filter(r => r.status === 'pending');
        const completedRequests = hospitalRequests.filter(r => r.status === 'completed');
        
        stats[0].textContent = hospitalRequests.length; 
        stats[1].textContent = pendingRequests.length; 
        stats[2].textContent = donors.length; 
        stats[3].textContent = completedRequests.length; 
    }

   
    viewHospitalSection('default');
}

function donorRegister(event) {
    event.preventDefault();
    const form = event.target;

    const data = {
        name: form.querySelector('input[type="text"]').value,
        phone: form.querySelector('input[type="tel"]').value,
        whatsapp: form.querySelectorAll('input[type="tel"]')[1].value,
        bloodType: form.querySelector('select').value,
        location: form.querySelector('textarea').value
    };

    const successDiv = document.getElementById('donor-success');
    const errorDiv = document.getElementById('donor-error');
    
    if (successDiv) successDiv.classList.add('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');

    fetch('donor_register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data)
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            if (successDiv) successDiv.classList.remove('hidden');
            form.reset();
            setTimeout(() => {
                showPage('homepage');
                if (successDiv) successDiv.classList.add('hidden');
            }, 2000);
            loadDashboardData();
        } else {
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                const errorText = document.getElementById('donor-error-text');
                if (errorText) errorText.textContent = result;
            }
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        if (errorDiv) {
            errorDiv.classList.remove('hidden');
            const errorText = document.getElementById('donor-error-text');
            if (errorText) errorText.textContent = 'Connection error. Please try again.';
        }
    });
}

function hospitalRegister(event) {
    event.preventDefault();
    const form = event.target;
    
    const fileInput = document.getElementById('rbc-file');
    
    console.log('Form submission started');
    console.log('File input:', fileInput);
    
    if (!fileInput) {
        alert('Error: RBC certificate file input element not found in the form.');
        return;
    }
    
    console.log('Files selected:', fileInput.files);
    
    if (!fileInput.files.length) {
        alert('Please upload RBC certificate');
        return;
    }

    const file = fileInput.files[0];
    console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type
    });

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const fileName = file.name.toLowerCase();
    const isValidFile = allowedTypes.includes(file.type) || 
                       fileName.endsWith('.pdf') || 
                       fileName.endsWith('.jpg') || 
                       fileName.endsWith('.jpeg') || 
                       fileName.endsWith('.png');
    
    if (!isValidFile) {
        alert('Please upload only PDF, JPG, or PNG files');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    const nameInput = form.querySelector('input[placeholder*="hospital name"]') || form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const locationInput = form.querySelector('textarea');
    
    if (!nameInput || !emailInput || !passwordInput || !locationInput) {
        alert('Error: Some form fields are missing. Please refresh the page and try again.');
        return;
    }

    if (!nameInput.value.trim() || !emailInput.value.trim() || !passwordInput.value.trim() || !locationInput.value.trim()) {
        alert('Please fill in all required fields');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', nameInput.value.trim());
    formData.append('email', emailInput.value.trim());
    formData.append('password', passwordInput.value.trim());
    formData.append('location', locationInput.value.trim());
    formData.append('certificate', file);

    console.log('FormData prepared:', {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        location: locationInput.value.trim(),
        file: file.name
    });

    const successDiv = document.getElementById('hospital-success');
    const errorDiv = document.getElementById('hospital-reg-error');
    
    if (successDiv) successDiv.classList.add('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Uploading...';
        submitButton.disabled = true;

        fetch('hospital_register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(result => {
            console.log('Server response:', result);
            
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            if (result.trim() === 'success') {
                if (successDiv) successDiv.classList.remove('hidden');
                form.reset();

                const uploadArea = document.querySelector('.upload-area');
                if (uploadArea) {
                    uploadArea.innerHTML = `
                        <p>📄 Click to upload RBC certificate</p>
                        <small>(PDF, JPG, or PNG files)</small>
                    `;
                }
                
                setTimeout(() => {
                    showPage('homepage');
                    if (successDiv) successDiv.classList.add('hidden');
                }, 2000);
                
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            } else {
                if (errorDiv) {
                    errorDiv.classList.remove('hidden');
                    const errorText = document.getElementById('hospital-reg-error-text');
                    if (errorText) {
                        // Show the full server response for debugging
                        errorText.textContent = result.startsWith('Error:') ? result : 'Registration failed: ' + result;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                const errorText = document.getElementById('hospital-reg-error-text');
                if (errorText) errorText.textContent = 'Connection error: ' + error.message;
            }
        });
    } else {
        alert('Error: Submit button not found');
    }
}

function createBloodRequest(event) {
    event.preventDefault();
    const form = event.target;
    
    if (!currentUser || currentUser.type !== 'hospital') {
        alert('Only hospitals can create blood requests');
        return;
    }
    
    const data = {
        hospitalEmail: currentUser.email,
        bloodType: form.querySelector('select').value,
        urgency: form.querySelectorAll('select')[1].value,
        quantity: form.querySelector('input[type="number"]').value,
        notes: form.querySelector('textarea').value || ''
    };

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        fetch('create_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
        .then(res => res.text())
        .then(result => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            if (result === 'success') {
                alert('Blood request submitted successfully!');
                closeModal();
                form.reset();
                loadDashboardData();
            } else {
                alert('Error: ' + result);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            alert('Failed to send request. Please try again.');
        });
    }
}

function sendAlertsToDonors(bloodType) {
    const filteredDonors = donors.filter(d => {
        return d.bloodType.toLowerCase() === bloodType.toLowerCase() &&
               d.location === currentUser.location;
             
    });

    
    const logContainer = document.getElementById("alert-log");
    logContainer.innerHTML = ""; // clear previous logs

    if (filteredDonors.length === 0) {
        logContainer.innerHTML = `<p>No matching donors found for blood type <strong>${bloodType}</strong> in your area.</p>`;
        return;
    }

    const message = `🩸 Urgent need for ${bloodType} blood at ${currentUser.name}. Please help!`;

    const list = document.createElement('ul');

    filteredDonors.forEach(donor => {
        const entry = document.createElement('li');
        entry.innerHTML = `
            ✔️ Alert to <strong>${donor.name}</strong> 
            (<code>${donor.phone}</code>${donor.whatsapp ? `, WhatsApp: <code>${donor.whatsapp}</code>` : ''}) – 
            Message: "<em>${message}</em>"
        `;
        list.appendChild(entry);
    });

    logContainer.appendChild(list);
}


function loadDashboardData() {
    fetch('get_dashboard_data.php')
    .then(res => res.json())
    .then(data => {
        donors = data.donors;
        hospitals = data.hospitals;
        pendingHospitals = data.pendingHospitals;
        bloodRequests = data.bloodRequests;
        dashboardData = data;

        if (currentUser && currentUser.type === 'hospital') {
            updateHospitalDashboard();
            
            // Ensure the blood inventory card shows data even if database doesn't provide it
            const bloodInventoryNumber = document.querySelector('#hospital-dashboard .stat-card.purple .number');
            if (bloodInventoryNumber && bloodInventoryNumber.textContent === '0') {
                bloodInventoryNumber.textContent = '25'; // Default value if not provided by database
            }
        } else if (currentUser && currentUser.type === 'admin') {
            updateAdminDashboard();
        }
        
        // Update the Analysis Corner charts with the latest data
        updateAnalysisCornerCharts();
    })
    .catch(error => {
        console.error('Error loading dashboard data:', error);
        
        // If there's an error loading data, still initialize the blood inventory
        if (currentUser && currentUser.type === 'hospital') {
            const bloodInventoryNumber = document.querySelector('#hospital-dashboard .stat-card.purple .number');
            if (bloodInventoryNumber) {
                bloodInventoryNumber.textContent = '25';
            }
        }
    });
}

function updateHospitalDashboard() {
    if (!currentUser || currentUser.type !== 'hospital') return;
    
    const stats = document.querySelectorAll('#hospital-dashboard .stat-card .number');
    if (stats.length >= 5) {
        const hospitalRequests = bloodRequests.filter(r => r.hospitalEmail === currentUser.email);
        const pendingRequests = hospitalRequests.filter(r => r.status === 'pending');
        
        stats[0].textContent = hospitalRequests.length;
        stats[1].textContent = pendingRequests.length;
        stats[2].textContent = donors.length;
        stats[3].textContent = hospitalRequests.filter(r => r.status === 'completed').length;
        stats[4].textContent = '25'; // Total blood inventory units
    }

    // Make sure to show the blood inventory section when clicking on the card
    const bloodInventoryCard = document.querySelector('#hospital-dashboard .stat-card.purple');
    if (bloodInventoryCard) {
        bloodInventoryCard.addEventListener('click', function() {
            viewHospitalSection('blood-inventory');
        });
    }

    const donorsSection = document.querySelector('#hospital-dashboard .donors-section');
    if (donorsSection) {
        const existingContent = donorsSection.querySelector('.no-donors, .donors-list');
        
        if (donors.length === 0) {
            const html = `
                <div class="no-donors">
                    <span style="font-size: 60px;">👥</span>
                    <p>No donors available</p>
                </div>
            `;
            if (existingContent) {
                existingContent.outerHTML = html;
            } else {
                donorsSection.innerHTML += html;
            }
        } else {
            const html = `
                <div class="donors-list">
                    ${donors.map(d => `
                        <div class="donor-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h3 style="color: #e74c3c; margin-bottom: 10px;">${d.name}</h3>
                            <p style="margin: 4px 0; color: #555;"><strong>Blood Type:</strong> ${d.bloodType}</p>
                            <p style="margin: 4px 0; color: #555;"><strong>Phone:</strong> ${d.phone}</p>
                            <p style="margin: 4px 0; color: #555;"><strong>Location:</strong> ${d.location}</p>
                            <button class="btn btn-secondary" onclick="contactDonor('${d.phone}')" style="margin-top: 10px;">Contact</button>
                        </div>
                    `).join('')}
                </div>
            `;
            if (existingContent) {
                existingContent.outerHTML = html;
            } else {
                donorsSection.innerHTML += html;
            }
        }
    }
}

function updateAdminDashboard() {
    if (!currentUser || currentUser.type !== 'admin') return;
    
    const stats = document.querySelectorAll('#admin-dashboard .stat-card .number');
    if (stats.length >= 4) {
        stats[0].textContent = hospitals.length;
        stats[1].textContent = pendingHospitals.length;
        stats[2].textContent = donors.length;
        stats[3].textContent = bloodRequests.length;
    }

    viewAdminSection('pending');
}

function viewAdminSection(type) {
    if (!dashboardData) return;
    
    const section = document.querySelector('#admin-dashboard .donors-section');
    if (!section) return;
    
    const titleElement = section.querySelector('h2');
    
    let html = '';
    let title = '';
    
    switch(type) {
        case 'donors':
            title = 'All Donors';
            if (dashboardData.donors.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">👥</span>
                        <p>No donors registered</p>
                    </div>
                `;
            } else {
                html = `
                    <div class="donors-list">
                        ${dashboardData.donors.map(d => `
                            <div class="donor-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h3 style="color: #e74c3c; margin-bottom: 10px;">${d.name}</h3>
                                <p style="margin: 4px 0; color: #555;"><strong>Blood Type:</strong> ${d.bloodType}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Phone:</strong> ${d.phone}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Location:</strong> ${d.location}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        case 'hospitals':
            title = 'All Approved Hospitals';
            if (dashboardData.hospitals.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">🏥</span>
                        <p>No hospitals approved</p>
                    </div>
                `;
            } else {
                html = `
                    <div class="hospitals-list">
                        ${dashboardData.hospitals.map(h => `
                            <div class="hospital-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h3 style="color: #e74c3c; margin-bottom: 10px;">${h.name}</h3>
                                <p style="margin: 4px 0; color: #555;"><strong>Email:</strong> ${h.email}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Location:</strong> ${h.location}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Status:</strong> <span style="color: #27ae60;">Approved</span></p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        case 'pending':
            title = 'Pending Hospital Registrations';
            if (dashboardData.pendingHospitals.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">📋</span>
                        <p>No pending hospital registrations</p>
                    </div>
                `;
            } else {
                html = `
                    <div class="hospitals-list">
                        ${dashboardData.pendingHospitals.map(h => {
                            const certUrl = `uploads/certificates/${h.certificate}`;
                            return `
                                <div class="hospital-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                    <h3 style="color: #e74c3c; margin-bottom: 10px;">${h.name}</h3>
                                    <p style="margin: 4px 0; color: #555;"><strong>Email:</strong> ${h.email}</p>
                                    <p style="margin: 4px 0; color: #555;"><strong>Location:</strong> ${h.location}</p>
                                    <p style="margin: 4px 0; color: #555;"><strong>Certificate:</strong> <a href="${certUrl}" target="_blank" style="color: #3498db; text-decoration: underline;">View Certificate</a></p>
                                    <div style="margin-top: 15px;">
                                        <button class="btn btn-primary" onclick="approveHospital('${h.id}')" style="margin-right: 10px;">Approve</button>
                                        <button class="btn btn-outline" onclick="rejectHospital('${h.id}')">Reject</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            break;
            
        case 'requests':
            title = 'All Blood Requests';
            if (dashboardData.bloodRequests.length === 0) {
                html = `
                    <div class="no-donors">
                        <span style="font-size: 60px;">📊</span>
                        <p>No blood requests found</p>
                    </div>
                `;
            } else {
                html = `
                    <div class="requests-list">
                        ${dashboardData.bloodRequests.map(r => `
                            <div class="request-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h3 style="color: #e74c3c; margin-bottom: 10px;">Blood Request</h3>
                                <p style="margin: 4px 0; color: #555;"><strong>Hospital:</strong> ${r.hospitalEmail}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Blood Type:</strong> ${r.bloodType}</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Quantity:</strong> ${r.quantity} units</p>
                                <p style="margin: 4px 0; color: #555;"><strong>Urgency:</strong> <span style="color: ${r.urgency === 'Critical' ? '#e74c3c' : r.urgency === 'High' ? '#f39c12' : '#27ae60'};">${r.urgency}</span></p>
                                <p style="margin: 4px 0; color: #555;"><strong>Status:</strong> ${r.status}</p>
                                ${r.notes ? `<p style="margin: 4px 0; color: #555;"><strong>Notes:</strong> ${r.notes}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        default:
            title = 'Dashboard Overview';
            html = `
                <div class="no-donors">
                    <span style="font-size: 60px;">📊</span>
                    <p>Click on a stat card above to view detailed information</p>
                </div>
            `;
    }


    if (titleElement) {
        titleElement.textContent = title;
    }
    

    const existingContent = section.querySelector('.no-donors, .donors-list, .hospitals-list, .requests-list');
    if (existingContent) {
        existingContent.outerHTML = html;
    } else {

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = html;
        section.appendChild(contentDiv.firstElementChild);
    }
}

function approveHospital(id) {
    if (!confirm('Are you sure you want to approve this hospital?')) return;
    
    fetch('approve_hospital.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id })
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            alert('Hospital approved successfully!');
            loadDashboardData();
            setTimeout(() => viewAdminSection('pending'), 100);
        } else {
            alert('Approval failed: ' + result);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Network error occurred');
    });
}

function rejectHospital(id) {
    if (!confirm('Are you sure you want to reject this hospital registration?')) return;
    
    fetch('reject_hospital.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id })
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            alert('Hospital registration rejected');
            loadDashboardData();
            setTimeout(() => viewAdminSection('pending'), 100);
        } else {
            alert('Rejection failed: ' + result);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Network error occurred');
    });
}

function contactDonor(phone) {
    if (confirm(`Contact donor at ${phone}?`)) {
        window.open(`tel:${phone}`, '_self');
    }
}

function showBloodRequestModal() {
    const modal = document.getElementById('blood-request-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; 
        
        const firstInput = modal.querySelector('select, input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal() {
    const modal = document.getElementById('blood-request-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
        
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

function logout() {
    currentUser = null;
    showPage('homepage');
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) heroSection.classList.remove('hidden');
}

function submitHelpRequest(event) {
    event.preventDefault();
    const email = document.getElementById('help-email').value;
    const question = document.getElementById('help-question').value;
    
    alert('Thank you! We will get back to you soon.');
    

    document.getElementById('help-email').value = '';
    document.getElementById('help-question').value = '';
    
    const helpPopup = document.getElementById('help-popup');
    if (helpPopup) helpPopup.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    showPage('homepage');
    
    const fileInput = document.getElementById('rbc-file');
    const uploadArea = document.querySelector('.upload-area');

    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                uploadArea.innerHTML = `<p>✅ ${file.name}</p><small>File selected successfully</small>`;
            } else {
                uploadArea.innerHTML = `<p>📄 Click to upload RBC certificate</p><small>(PDF, JPG, or PNG files)</small>`;
            }
        });
    }

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('blood-request-modal');
        if (e.target === modal) {
            closeModal();
        }
    });

    const helpIcon = document.querySelector('.help-icon');
    const helpPopup = document.getElementById('help-popup');

    if (helpIcon && helpPopup) {
        helpIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            helpPopup.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!helpPopup.contains(e.target) && !helpIcon.contains(e.target)) {
                helpPopup.classList.remove('show');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            const helpPopup = document.getElementById('help-popup');
            if (helpPopup) helpPopup.classList.remove('show');
        }
    });
    
    console.log('Initialization complete');
    
    // Initialize the blood donation graph animation
    initBloodDonationGraph();
    
    // Initialize the analysis corner charts
    initAnalysisCornerCharts();
    
    // Load dashboard data on page load
    loadDashboardData();
});

// Function to initialize the Analysis Corner charts
function initAnalysisCornerCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Initialize the donors chart
    const donorsCtx = document.getElementById('donorsChart');
    if (donorsCtx) {
        window.donorsChart = new Chart(donorsCtx, {
            type: 'doughnut',
            data: {
                labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                datasets: [{
                    data: [25, 15, 20, 10, 5, 5, 15, 5],
                    backgroundColor: [
                        '#e74c3c', '#c0392b', '#3498db', '#2980b9',
                        '#9b59b6', '#8e44ad', '#2ecc71', '#27ae60'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 9
                            },
                            boxWidth: 10,
                            padding: 5
                        }
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Initialize the blood donated chart
    const bloodDonatedCtx = document.getElementById('bloodDonatedChart');
    if (bloodDonatedCtx) {
        window.bloodDonatedChart = new Chart(bloodDonatedCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Units Donated',
                    data: [65, 59, 80, 81, 56, 55],
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 8
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 8
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: {
                                size: 9
                            },
                            boxWidth: 10,
                            padding: 5
                        }
                    }
                }
            }
        });
    }
    
    // Initialize the pending requests chart
    const pendingRequestsCtx = document.getElementById('pendingRequestsChart');
    if (pendingRequestsCtx) {
        window.pendingRequestsChart = new Chart(pendingRequestsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Pending Requests',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderColor: '#ffc107',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 8
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 8
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: {
                                size: 9
                            },
                            boxWidth: 10,
                            padding: 5
                        }
                    }
                }
            }
        });
    }
}

// Function to update the Analysis Corner charts with real data
function updateAnalysisCornerCharts() {
    if (!dashboardData) return;
    
    // Update donors chart
    if (window.donorsChart) {
        // Count donors by blood type
        const bloodTypeCounts = {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
        };
        
        dashboardData.donors.forEach(donor => {
            if (bloodTypeCounts.hasOwnProperty(donor.bloodType)) {
                bloodTypeCounts[donor.bloodType]++;
            }
        });
        
        window.donorsChart.data.datasets[0].data = [
            bloodTypeCounts['A+'], bloodTypeCounts['A-'],
            bloodTypeCounts['B+'], bloodTypeCounts['B-'],
            bloodTypeCounts['AB+'], bloodTypeCounts['AB-'],
            bloodTypeCounts['O+'], bloodTypeCounts['O-']
        ];
        
        window.donorsChart.update();
    }
    
    // Update blood donated chart
    if (window.bloodDonatedChart) {
        // In a real application, this would use actual donation data
        // For now, we'll use the number of completed requests per blood type
        const completedRequests = dashboardData.bloodRequests.filter(r => r.status === 'completed');
        const bloodTypeQuantities = {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
        };
        
        completedRequests.forEach(request => {
            if (bloodTypeQuantities.hasOwnProperty(request.bloodType)) {
                bloodTypeQuantities[request.bloodType] += parseInt(request.quantity) || 0;
            }
        });
        
        window.bloodDonatedChart.data.labels = Object.keys(bloodTypeQuantities);
        window.bloodDonatedChart.data.datasets[0].data = Object.values(bloodTypeQuantities);
        window.bloodDonatedChart.update();
    }
    
    // Update pending requests chart
    if (window.pendingRequestsChart) {
        // Count pending requests by blood type
        const pendingRequests = dashboardData.bloodRequests.filter(r => r.status === 'pending');
        const pendingByBloodType = {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
        };
        
        pendingRequests.forEach(request => {
            if (pendingByBloodType.hasOwnProperty(request.bloodType)) {
                pendingByBloodType[request.bloodType] += parseInt(request.quantity) || 0;
            }
        });
        
        window.pendingRequestsChart.data.labels = Object.keys(pendingByBloodType);
        window.pendingRequestsChart.data.datasets[0].data = Object.values(pendingByBloodType);
        window.pendingRequestsChart.update();
    }
}

// Function to initialize and animate the blood donation graph
function initBloodDonationGraph() {
    // This function will be called when the page loads
    // It sets up the blood donation graph and makes it dynamic
    
    const timeOptions = document.querySelectorAll('.graph-time-selector .time-option');
    if (timeOptions.length > 0) {
        timeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                timeOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');
                
                // Update graph data based on selected time period
                updateGraphData(this.textContent);
            });
        });
    }
    
    // Initial graph update
    updateGraphData('1M');
}

// Function to update the graph data based on time period
function updateGraphData(timePeriod) {
    // In a real application, this would fetch data from the server
    // For now, we'll simulate different data for different time periods
    
    let pathData = '';
    
    switch(timePeriod) {
        case '1D':
            pathData = "M0,50 C10,45 20,40 30,35 L30,35 C40,30 50,25 60,30 L60,30 C70,35 80,40 90,45 L90,45 C100,50 110,55 120,50 L120,50 C130,45 140,40 150,35 L150,35 C160,30 170,25 180,20 L180,20 C190,15 200,10 210,15 L210,15 C220,20 230,25 240,30 L240,30 C250,35 260,40 270,45 L270,45 C280,50 290,55 300,50";
            break;
        case '5D':
            pathData = "M0,60 C10,55 20,50 30,45 L30,45 C40,40 50,35 60,30 L60,30 C70,25 80,20 90,25 L90,25 C100,30 110,35 120,40 L120,40 C130,45 140,50 150,55 L150,55 C160,60 170,65 180,60 L180,60 C190,55 200,50 210,45 L210,45 C220,40 230,35 240,30 L240,30 C250,25 260,20 270,25 L270,25 C280,30 290,35 300,40";
            break;
        case '1M':
            pathData = "M0,80 C10,70 20,30 30,20 L30,20 C40,25 50,40 60,35 L60,35 C70,35 80,40 90,40 L90,40 C100,40 110,45 120,45 L120,45 C130,45 140,40 150,40 L150,40 C160,40 170,35 180,30 L180,30 C190,30 200,25 210,30 L210,30 C220,35 230,40 240,35 L240,35 C250,35 260,80 270,40 L270,40 C280,10 290,10 300,10";
            break;
        case '1Y':
            pathData = "M0,70 C10,65 20,60 30,55 L30,55 C40,50 50,45 60,40 L60,40 C70,35 80,30 90,25 L90,25 C100,20 110,15 120,20 L120,20 C130,25 140,30 150,35 L150,35 C160,40 170,45 180,50 L180,50 C190,55 200,60 210,55 L210,55 C220,50 230,45 240,40 L240,40 C250,35 260,30 270,25 L270,25 C280,20 290,15 300,10";
            break;
        case '5Y':
            pathData = "M0,90 C10,85 20,80 30,75 L30,75 C40,70 50,65 60,60 L60,60 C70,55 80,50 90,45 L90,45 C100,40 110,35 120,30 L120,30 C130,25 140,20 150,15 L150,15 C160,10 170,15 180,20 L180,20 C190,25 200,30 210,35 L210,35 C220,40 230,45 240,50 L240,50 C250,55 260,60 270,65 L270,65 C280,70 290,75 300,70";
            break;
        case 'Max':
            pathData = "M0,90 C10,80 20,70 30,60 L30,60 C40,50 50,40 60,30 L60,30 C70,20 80,10 90,20 L90,20 C100,30 110,40 120,50 L120,50 C130,60 140,70 150,80 L150,80 C160,90 170,80 180,70 L180,70 C190,60 200,50 210,40 L210,40 C220,30 230,20 240,10 L240,10 C250,20 260,30 270,40 L270,40 C280,50 290,60 300,50";
            break;
        default:
            pathData = "M0,80 C10,70 20,30 30,20 L30,20 C40,25 50,40 60,35 L60,35 C70,35 80,40 90,40 L90,40 C100,40 110,45 120,45 L120,45 C130,45 140,40 150,40 L150,40 C160,40 170,35 180,30 L180,30 C190,30 200,25 210,30 L210,30 C220,35 230,40 240,35 L240,35 C250,35 260,80 270,40 L270,40 C280,10 290,10 300,10";
    }
    
    // Function to initialize the Analysis Corner charts
    function initAnalysisCornerCharts() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Initialize the donors chart
        const donorsCtx = document.getElementById('donorsChart');
        if (donorsCtx) {
            window.donorsChart = new Chart(donorsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                    datasets: [{
                        data: [25, 15, 20, 10, 5, 5, 15, 5],
                        backgroundColor: [
                            '#e74c3c', '#c0392b', '#3498db', '#2980b9',
                            '#9b59b6', '#8e44ad', '#2ecc71', '#27ae60'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#fff'
                            }
                        },
                        title: {
                            display: false
                        }
                    }
                }
            });
        }
        
        // Initialize the blood donated chart
        const bloodDonatedCtx = document.getElementById('bloodDonatedChart');
        if (bloodDonatedCtx) {
            window.bloodDonatedChart = new Chart(bloodDonatedCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Units Donated',
                        data: [65, 59, 80, 81, 56, 55],
                        backgroundColor: '#e74c3c',
                        borderColor: '#c0392b',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#fff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#fff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#fff'
                            }
                        }
                    }
                }
            });
        }
        
        // Initialize the pending requests chart
        const pendingRequestsCtx = document.getElementById('pendingRequestsChart');
        if (pendingRequestsCtx) {
            window.pendingRequestsChart = new Chart(pendingRequestsCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Pending Requests',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: 'rgba(255, 193, 7, 0.2)',
                        borderColor: '#ffc107',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#fff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#fff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#fff'
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Function to update the Analysis Corner charts with real data
    function updateAnalysisCornerCharts() {
        if (!dashboardData) return;
        
        // Update donors chart
        if (window.donorsChart) {
            // Count donors by blood type
            const bloodTypeCounts = {
                'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
                'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
            };
            
            dashboardData.donors.forEach(donor => {
                if (bloodTypeCounts.hasOwnProperty(donor.bloodType)) {
                    bloodTypeCounts[donor.bloodType]++;
                }
            });
            
            window.donorsChart.data.datasets[0].data = [
                bloodTypeCounts['A+'], bloodTypeCounts['A-'],
                bloodTypeCounts['B+'], bloodTypeCounts['B-'],
                bloodTypeCounts['AB+'], bloodTypeCounts['AB-'],
                bloodTypeCounts['O+'], bloodTypeCounts['O-']
            ];
            
            window.donorsChart.update();
        }
        
        // Update blood donated chart
        if (window.bloodDonatedChart) {
            // In a real application, this would use actual donation data
            // For now, we'll use the number of completed requests per blood type
            const completedRequests = dashboardData.bloodRequests.filter(r => r.status === 'completed');
            const bloodTypeQuantities = {
                'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
                'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
            };
            
            completedRequests.forEach(request => {
                if (bloodTypeQuantities.hasOwnProperty(request.bloodType)) {
                    bloodTypeQuantities[request.bloodType] += parseInt(request.quantity) || 0;
                }
            });
            
            window.bloodDonatedChart.data.labels = Object.keys(bloodTypeQuantities);
            window.bloodDonatedChart.data.datasets[0].data = Object.values(bloodTypeQuantities);
            window.bloodDonatedChart.update();
        }
        
        // Update pending requests chart
        if (window.pendingRequestsChart) {
            // Count pending requests by blood type
            const pendingRequests = dashboardData.bloodRequests.filter(r => r.status === 'pending');
            const pendingByBloodType = {
                'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
                'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
            };
            
            pendingRequests.forEach(request => {
                if (pendingByBloodType.hasOwnProperty(request.bloodType)) {
                    pendingByBloodType[request.bloodType] += parseInt(request.quantity) || 0;
                }
            });
            
            window.pendingRequestsChart.data.labels = Object.keys(pendingByBloodType);
            window.pendingRequestsChart.data.datasets[0].data = Object.values(pendingByBloodType);
            window.pendingRequestsChart.update();
        }
    }
    
    // Update the SVG path with new data
    const graphPaths = document.querySelectorAll('.graph-line svg path');
    if (graphPaths.length >= 2) {
        // Update the line path
        graphPaths[0].setAttribute('d', pathData);
        
        // Update the fill path (same path data but with closing to the bottom)
        const fillPathData = pathData + " L300,100 L0,100 Z";
        graphPaths[1].setAttribute('d', fillPathData);
        
        // Reset the animation
        graphPaths[0].style.animation = 'none';
        graphPaths[1].style.animation = 'none';
        
        // Trigger reflow
        void graphPaths[0].offsetWidth;
        void graphPaths[1].offsetWidth;
        
        // Restart the animation
        graphPaths[0].style.animation = 'graphAnimation 2s ease-in-out forwards';
        graphPaths[1].style.animation = 'fadeIn 2s ease-in-out forwards';
    }
}