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

    fetch('http://localhost/savelife/hospital_login.php', {
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

    fetch('http://localhost/savelife/donor_register.php', {
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

        fetch('http://localhost/savelife/hospital_register.php', {
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
                        <p><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 2v4M16 2v4M4 10h16"/></svg> Click to upload RBC certificate</p>
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
                    if (errorText) errorText.textContent = result;
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

        fetch('http://localhost/savelife/create_request.php', {
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

function loadDashboardData() {
    fetch('http://localhost/savelife/get_dashboard_data.php')
    .then(res => res.json())
    .then(data => {
        donors = data.donors;
        hospitals = data.hospitals;
        pendingHospitals = data.pendingHospitals;
        bloodRequests = data.bloodRequests;
        dashboardData = data;

        if (currentUser && currentUser.type === 'hospital') {
            updateHospitalDashboard();
        } else if (currentUser && currentUser.type === 'admin') {
            updateAdminDashboard();
        }
    })
    .catch(error => {
        console.error('Error loading dashboard data:', error);
    });
}

function updateHospitalDashboard() {
    if (!currentUser || currentUser.type !== 'hospital') return;
    
    const stats = document.querySelectorAll('#hospital-dashboard .stat-card .number');
    if (stats.length >= 4) {
        const hospitalRequests = bloodRequests.filter(r => r.hospitalEmail === currentUser.email);
        const pendingRequests = hospitalRequests.filter(r => r.status === 'pending');
        
        stats[0].textContent = hospitalRequests.length;
        stats[1].textContent = pendingRequests.length;
        stats[2].textContent = donors.length;
        stats[3].textContent = hospitalRequests.filter(r => r.status === 'completed').length;
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
                            const certUrl = `http://localhost/savelife/uploads/certificates/${h.certificate}`;
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
    
    fetch('http://localhost/savelife/approve_hospital.php', {
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
    
    fetch('http://localhost/savelife/reject_hospital.php', {
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
                uploadArea.innerHTML = `<p><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${file.name}</p><small>File selected successfully</small>`;
            } else {
                uploadArea.innerHTML = `<p><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 2v4M16 2v4M4 10h16"/></svg> Click to upload RBC certificate</p><small>(PDF, JPG, or PNG files)</small>`;
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
    
    // Dark mode toggle logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const body = document.body;

    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIcon) sunIcon.style.display = '';
        } else {
            body.classList.remove('dark-mode');
            if (moonIcon) moonIcon.style.display = '';
            if (sunIcon) sunIcon.style.display = 'none';
        }
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = !body.classList.contains('dark-mode');
            setTheme(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // Info dropdown logic
    const infoDropdownBtn = document.getElementById('info-dropdown-btn');
    const infoDropdownContent = document.getElementById('info-dropdown-content');
    if (infoDropdownBtn && infoDropdownContent) {
        infoDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = infoDropdownContent.style.display === 'block';
            infoDropdownContent.style.display = isOpen ? 'none' : 'block';
        });
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!infoDropdownContent.contains(e.target) && e.target !== infoDropdownBtn) {
                infoDropdownContent.style.display = 'none';
            }
        });
    }

    console.log('Initialization complete');
});
