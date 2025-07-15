
let currentUser = null;
let donors = [];
let hospitals = [];
let bloodRequests = [];
let pendingHospitals = [];

//  admin credentials


const adminCredentials = {
    email: 'admin@savelife.com',
    password: 'admin123'
};

// page navigation

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));


    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
}

// Admin login


function adminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if (email === adminCredentials.email && password === adminCredentials.password) {
        currentUser = { type: 'admin', email: email };
        showPage('admin-dashboard');
        updateAdminDashboard();
    } else {
        alert('Invalid admin credentials');
    }
}

// hospital login

function hospitalLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('hospital-email').value;
    const password = document.getElementById('hospital-password').value;
    
    const hospital = hospitals.find(h => h.email === email && h.password === password && h.approved);
    
    if (hospital) {
        currentUser = { type: 'hospital', email: email, data: hospital };
        showPage('hospital-dashboard');
        updateHospitalDashboard();
    } else {
        alert('Invalid credentials or hospital not approved yet');
    }
}

// Donor registration


function donorRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const donor = {
        id: Date.now(),
        name: form.querySelector('input[type="text"]').value,
        phone: form.querySelector('input[type="tel"]').value,
        whatsapp: form.querySelectorAll('input[type="tel"]')[1].value,
        bloodType: form.querySelector('select').value,
        location: form.querySelector('textarea').value,
        registeredAt: new Date().toISOString()
    };
    
    donors.push(donor);
    alert('Registration successful! You will receive alerts when your blood type is needed.');
    form.reset();
    showPage('homepage');
}

// Hospital registration


function hospitalRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const fileInput = document.getElementById('rbc-file');
    
    if (!fileInput.files.length) {
        alert('Please upload RBC certificate');
        return;
    }
    
    const hospital = {
        id: Date.now(),
        name: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        password: form.querySelector('input[type="password"]').value,
        location: form.querySelector('textarea').value,
        certificate: fileInput.files[0].name,
        approved: false,
        registeredAt: new Date().toISOString()
    };
    
    pendingHospitals.push(hospital);
    alert('Registration submitted! Your application will be reviewed by our admin team.');
    form.reset();
    showPage('homepage');
}

// Create blood request


function createBloodRequest(event) {
    event.preventDefault();
    
    const form = event.target;
    const bloodType = form.querySelector('select').value;
    const urgency = form.querySelectorAll('select')[1].value;
    const quantity = form.querySelector('input[type="number"]').value;
    const notes = form.querySelector('textarea').value;
    
    const request = {
        id: Date.now(),
        hospitalEmail: currentUser.email,
        bloodType: bloodType,
        urgency: urgency,
        quantity: quantity,
        notes: notes,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    bloodRequests.push(request);
    
    // Send alerts to matching donors

    const matchingDonors = donors.filter(donor => donor.bloodType === bloodType);
    if (matchingDonors.length > 0) {
        alert(`Blood request created! Alert sent to ${matchingDonors.length} matching donors.`);
    } else {
        alert('Blood request created! No matching donors found at the moment.');
    }
    
    closeModal();
    form.reset();
    updateHospitalDashboard();
}

// Update hospital dashboard

function updateHospitalDashboard() {
    if (!currentUser || currentUser.type !== 'hospital') return;
    
    const hospitalRequests = bloodRequests.filter(req => req.hospitalEmail === currentUser.email);
    const pendingRequests = hospitalRequests.filter(req => req.status === 'pending');
    
    // Update stats
    const statCards = document.querySelectorAll('#hospital-dashboard .stat-card .number');
    if (statCards.length >= 4) {
        statCards[0].textContent = hospitalRequests.length;
        statCards[1].textContent = pendingRequests.length;
        statCards[2].textContent = donors.length;
        statCards[3].textContent = hospitalRequests.filter(req => req.status === 'completed').length;
    }
    
    // Update available donors section
    updateAvailableDonors();
}

// Update admin dashboard

function updateAdminDashboard() {
    if (!currentUser || currentUser.type !== 'admin') return;
    
    // Update stats
    const statCards = document.querySelectorAll('#admin-dashboard .stat-card .number');
    if (statCards.length >= 4) {
        statCards[0].textContent = hospitals.length;
        statCards[1].textContent = pendingHospitals.length;
        statCards[2].textContent = donors.length;
        statCards[3].textContent = bloodRequests.length;
    }
    
    // update pending hospitals section
    
    updatePendingHospitals();
}

// Update available donors display


function updateAvailableDonors() {
    const donorsSection = document.querySelector('#hospital-dashboard .donors-section');
    const noDonorsDiv = donorsSection.querySelector('.no-donors');
    
    if (donors.length === 0) {
        noDonorsDiv.innerHTML = `
            <span style="font-size: 60px;">👥</span>
            <p>No donors available</p>
        `;
    } else {
        // Create donors list

        const donorsList = document.createElement('div');
        donorsList.className = 'donors-list';
        donorsList.innerHTML = donors.map(donor => `
            <div class="donor-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 15px;">
                <h3>${donor.name}</h3>
                <p><strong>Blood Type:</strong> ${donor.bloodType}</p>
                <p><strong>Phone:</strong> ${donor.phone}</p>
                <p><strong>Location:</strong> ${donor.location}</p>
                <button class="btn btn-primary" onclick="contactDonor('${donor.id}')">Contact</button>
            </div>
        `).join('');
        
        noDonorsDiv.replaceWith(donorsList);
    }
}

// Update pending hospitals display


function updatePendingHospitals() {
    const donorsSection = document.querySelector('#admin-dashboard .donors-section');
    const noDonorsDiv = donorsSection.querySelector('.no-donors');
    
    if (pendingHospitals.length === 0) {
        noDonorsDiv.innerHTML = `
            <span style="font-size: 60px;">📋</span>
            <p>No pending hospital registrations</p>
        `;
    } else {

        // Create pending hospitals list

        const hospitalsList = document.createElement('div');
        hospitalsList.className = 'hospitals-list';
        hospitalsList.innerHTML = pendingHospitals.map(hospital => `
            <div class="hospital-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 15px;">
                <h3>${hospital.name}</h3>
                <p><strong>Email:</strong> ${hospital.email}</p>
                <p><strong>Location:</strong> ${hospital.location}</p>
                <p><strong>Certificate:</strong> ${hospital.certificate}</p>
                <div style="margin-top: 15px;">
                    <button class="btn btn-primary" onclick="approveHospital('${hospital.id}')">Approve</button>
                    <button class="btn btn-outline" onclick="rejectHospital('${hospital.id}')" style="margin-left: 10px;">Reject</button>
                </div>
            </div>
        `).join('');
        
        noDonorsDiv.replaceWith(hospitalsList);
    }
}

// Approve hospital


function approveHospital(hospitalId) {
    const hospital = pendingHospitals.find(h => h.id == hospitalId);
    if (hospital) {
        hospital.approved = true;
        hospitals.push(hospital);
        pendingHospitals = pendingHospitals.filter(h => h.id != hospitalId);
        alert(`Hospital "${hospital.name}" has been approved!`);
        updateAdminDashboard();
    }
}

// Reject hospital


function rejectHospital(hospitalId) {
    const hospital = pendingHospitals.find(h => h.id == hospitalId);
    if (hospital && confirm(`Are you sure you want to reject "${hospital.name}"?`)) {
        pendingHospitals = pendingHospitals.filter(h => h.id != hospitalId);
        alert(`Hospital "${hospital.name}" has been rejected.`);
        updateAdminDashboard();
    }
}

// Contact donor

function contactDonor(donorId) {
    const donor = donors.find(d => d.id == donorId);
    if (donor) {
        alert(`Contact ${donor.name} at ${donor.phone}`);
    }
}

// Show blood request modal


function showBloodRequestModal() {
    const modal = document.getElementById('blood-request-modal');
    modal.style.display = 'block';
}

// Close modal


function closeModal() {
    const modal = document.getElementById('blood-request-modal');
    modal.style.display = 'none';
}

// Logout

function logout() {
    currentUser = null;
    showPage('homepage');
}

// File upload handling

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('rbc-file');
    const uploadArea = document.querySelector('.upload-area');
    
    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                uploadArea.innerHTML = `
                    <p>✅ ${file.name}</p>
                    <small>File selected successfully</small>
                `;
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('blood-request-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Initialize some sample data for testing
function initializeSampleData() {
    // A sample donors
    donors = [
        {
            id: 1,
            name: 'Mugabe',
            phone: '+250788123456',
            whatsapp: '+250788123456',
            bloodType: 'O+',
            location: 'Kigali, Rwanda',
            registeredAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Jane',
            phone: '+250788654321',
            whatsapp: '+250788654321',
            bloodType: 'A+',
            location: 'Kigali, Rwanda',
            registeredAt: new Date().toISOString()
        }
    ];
    
    // a sample approved hospital

    hospitals = [
        {
            id: 1,
            name: 'Kigali Hospital',
            email: 'kigali@hospital.com',
            password: 'hospital123',
            location: 'Kigali, Rwanda',
            certificate: 'kigali_rbc_cert.pdf',
            approved: true,
            registeredAt: new Date().toISOString()
        }
    ];
}

// Initialize sample data when page loads

document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
});