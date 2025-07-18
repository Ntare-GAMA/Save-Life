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

    if (!fileInput) {
        alert('Error: RBC certificate file input element not found in the form.');
        return;
    }
    if (!fileInput.files.length) {
        alert('Please upload RBC certificate');
        return;
    }
    const file = fileInput.files[0];
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(result => {
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

function renderHospitalsWeWorkWith() {
    const container = document.getElementById('kigali-hospitals-list');
    if (!container) return;
    if (!hospitals || hospitals.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">No partner hospitals available.</p>';
        return;
    }
    container.innerHTML = hospitals.map(h => `
        <div class="hospital-item">
            <strong>${h.name}</strong>
            <span><b>Location:</b> ${h.location}</span>
            <span><b>Email:</b> ${h.email}</span>
        </div>
    `).join('');
}

// Call this after hospitals are loaded
function loadDashboardData() {
    fetch('http://localhost/savelife/get_dashboard_data.php') // Back to real API
    .then(res => res.json())
    .then(data => {
        donors = data.donors;
        hospitals = data.hospitals;
        pendingHospitals = data.pendingHospitals;
        bloodRequests = data.bloodRequests;
        renderHospitalsWeWorkWith();
        if (currentUser && currentUser.type === 'hospital') updateHospitalDashboard();
        else if (currentUser && currentUser.type === 'admin') updateAdminDashboard();
    });
}

function updateAdminDashboard() {
    const stats = document.querySelectorAll('#admin-dashboard .stat-card .number');
    stats[0].textContent = hospitals.length;
    stats[1].textContent = pendingHospitals.length;
    stats[2].textContent = donors.length;
    stats[3].textContent = bloodRequests.length;
    const section = document.querySelector('#admin-dashboard .donors-section');
    const noData = section.querySelector('.no-donors');
    if (pendingHospitals.length === 0) {
        noData.innerHTML = `<span style="font-size: 60px;">📋</span><p>No pending hospital registrations</p>`;
    } else {
        const list = document.createElement('div');
        list.className = 'hospitals-list';
        list.innerHTML = pendingHospitals.map(h => `
            <div class="hospital-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <h3>${h.name}</h3>
                <p><strong>Email:</strong> ${h.email}</p>
                <p><strong>Location:</strong> ${h.location}</p>
                <p><strong>Certificate:</strong> ${h.certificate}</p>
                <div style="margin-top: 15px;">
                    <button class="btn btn-primary" onclick="approveHospital('${h.id}')">Approve</button>
                    <button class="btn btn-outline" onclick="rejectHospital('${h.id}')" style="margin-left: 10px;">Reject</button>
                </div>
            </div>
        `).join('');
        noData.replaceWith(list);
    }
}

function updateHospitalDashboard() {
    const myRequests = bloodRequests.filter(req => req.hospitalEmail === currentUser.email);
    const stats = document.querySelectorAll('#hospital-dashboard .stat-card .number');
    stats[0].textContent = myRequests.length;
    stats[1].textContent = myRequests.filter(r => r.status === 'pending').length;
    stats[2].textContent = donors.length;
    stats[3].textContent = myRequests.filter(r => r.status === 'completed').length;
    const section = document.querySelector('#hospital-dashboard .donors-section');
    const noData = section.querySelector('.no-donors');
    if (donors.length === 0) {
        noData.innerHTML = `<span style="font-size: 60px;">👥</span><p>No donors available</p>`;
    } else {
        const list = document.createElement('div');
        list.className = 'donors-list';
        list.innerHTML = donors.map(d => `
            <div class="donor-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <h3>${d.name}</h3>
                <p><strong>Blood Type:</strong> ${d.bloodType}</p>
                <p><strong>Phone:</strong> ${d.phone}</p>
                <p><strong>Location:</strong> ${d.location}</p>
                <button class="btn btn-primary" onclick="contactDonor('${d.phone}')">Contact</button>
            </div>
        `).join('');
        noData.replaceWith(list);
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
            alert('Hospital approved');
            loadDashboardData();
        } else {
            alert('Approval failed');
        }
    });
}

function rejectHospital(id) {
    if (!confirm('Are you sure?')) return; 
    fetch('http://localhost/savelife/reject_hospital.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id })
    })
    .then(res => res.text())
    .then(result => {
        if (result === 'success') {
            alert('Hospital rejected');
            loadDashboardData();
        } else {
            alert('Rejection failed');
        }
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
