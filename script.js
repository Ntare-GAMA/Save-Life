let currentUser = null;
let donors = [];
let hospitals = [];
let bloodRequests = [];
let pendingHospitals = [];


function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');
}



function adminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    if (email === 'admin@savelife.com' && password === 'admin123') {
        currentUser = { type: 'admin', email };
        showPage('admin-dashboard');
        loadDashboardData();
    } else {
        alert('Invalid admin credentials');
    }
}


function hospitalLogin(event) {
    event.preventDefault();
    const email = document.getElementById('hospital-email').value;
    const password = document.getElementById('hospital-password').value;

    fetch('http://localhost/savelife/hospital_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            currentUser = { type: 'hospital', email };
            showPage('hospital-dashboard');
            loadDashboardData();
        } else {
            alert('Invalid credentials or hospital not approved yet');
        }
    })
    .catch(() => alert('Login error. Check connection.'));
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

    fetch('http://localhost/savelife/donor_register.php', {

        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data)
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            alert('Donor registered successfully!');
            form.reset();
            showPage('homepage');
            loadDashboardData();
        } else {
            alert('Error: ' + result);
        }
    })
    .catch(() => alert('Connection error.'));
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
                alert('Hospital registration submitted for review.');
                form.reset();

                const uploadArea = document.querySelector('.upload-area');
                if (uploadArea) {
                    uploadArea.innerHTML = `
                        <p>📄 Click to upload RBC certificate</p>
                        <small>(PDF, JPG, or PNG files)</small>
                    `;
                }
                showPage('homepage');
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            } else {
                alert('Error: ' + result);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            

            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            alert('Connection error: ' + error.message);
        });
    } else {
        alert('Error: Submit button not found');
    }
}



function createBloodRequest(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
        hospitalEmail: currentUser.email,
        bloodType: form.querySelector('select').value,
        urgency: form.querySelectorAll('select')[1].value,
        quantity: form.querySelector('input[type="number"]').value,
        notes: form.querySelector('textarea').value
    };

    fetch('http://localhost/savelife/create_request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data)
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            alert('Blood request submitted.');
            closeModal();
            form.reset();
            loadDashboardData();
        } else {
            alert('Error: ' + result);
        }
    })
    .catch(() => alert('Failed to send request.'));
}

function loadDashboardData() {
    fetch('http://localhost/savelife/get_dashboard_data.php')
    .then(res => res.json())
    .then(data => {
        donors = data.donors;
        hospitals = data.hospitals;
        pendingHospitals = data.pendingHospitals;
        bloodRequests = data.bloodRequests;

        if (currentUser.type === 'hospital') updateHospitalDashboard();
        else if (currentUser.type === 'admin') updateAdminDashboard();
    });
}

let dashboardData = null;

// Update the loadDashboardData function
function loadDashboardData() {
    fetch('http://localhost/savelife/get_dashboard_data.php')
    .then(res => res.json())
    .then(data => {
        donors = data.donors;
        hospitals = data.hospitals;
        pendingHospitals = data.pendingHospitals;
        bloodRequests = data.bloodRequests;
        dashboardData = data; // Store the data globally

        if (currentUser && currentUser.type === 'hospital') updateHospitalDashboard();
        else if (currentUser && currentUser.type === 'admin') updateAdminDashboard();
    })
    .catch(error => {
        console.error('Error loading dashboard data:', error);
    });
}

// Update the updateAdminDashboard function
function updateAdminDashboard() {
    const stats = document.querySelectorAll('#admin-dashboard .stat-card .number');
    if (stats.length >= 4) {
        stats[0].textContent = hospitals.length;
        stats[1].textContent = pendingHospitals.length;
        stats[2].textContent = donors.length;
        stats[3].textContent = bloodRequests.length;
    }

    // Initialize with pending hospitals view
    viewAdminSection('pending');
}

// New function to handle section viewing in admin dashboard
function viewAdminSection(type) {
    if (!dashboardData) return;
    
    const section = document.querySelector('#admin-dashboard .donors-section');
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
    
    // Update the title
    if (titleElement) {
        titleElement.textContent = title;
    }
    
    // Update the content
    const existingContent = section.querySelector('.no-donors, .donors-list, .hospitals-list, .requests-list');
    if (existingContent) {
        existingContent.outerHTML = html;
    } else {
        // If no existing content found, append to section
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = html;
        section.appendChild(contentDiv.firstElementChild);
    }
}

function approveHospital(id) {
    fetch('http://localhost/savelife/approve_hospital.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id })
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            alert('Hospital approved successfully!');
            loadDashboardData(); // Reload data
            setTimeout(() => viewAdminSection('pending'), 100); // Refresh the pending view
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
            loadDashboardData(); // Reload data
            setTimeout(() => viewAdminSection('pending'), 100); // Refresh the pending view
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
    alert('Contact donor at: ' + phone);
}

function showBloodRequestModal() {
    document.getElementById('blood-request-modal').style.display = 'block';
}
function closeModal() {
    document.getElementById('blood-request-modal').style.display = 'none';
}

function logout() {
    currentUser = null;
    showPage('homepage');
}

function submitHelpRequest(event) {
    event.preventDefault();
    const email = document.getElementById('help-email').value;
    const question = document.getElementById('help-question').value;
    alert('Thank you! We will get back to you.');
    document.getElementById('help-email').value = '';
    document.getElementById('help-question').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('rbc-file');
    const uploadArea = document.querySelector('.upload-area');

    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                uploadArea.innerHTML = `<p>✅ ${file.name}</p><small>File selected successfully</small>`;
            }
        });
    }

    window.addEventListener('click', e => {
        if (e.target === document.getElementById('blood-request-modal')) {
            closeModal();
        }
    });
});
