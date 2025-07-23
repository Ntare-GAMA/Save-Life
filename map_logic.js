document.addEventListener('DOMContentLoaded', function () {

    let map;
    let markers = []; 

    const initialCoords = [-1.944, 30.058]; 
    const initialZoom = 12;

    map = L.map('map').setView(initialCoords, initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const bloodTypeIcons = {
        'A+': L.icon({ iconUrl: 'icons/A_plus.png', iconSize: [32, 32], iconAnchor: [16, 32] }),
        'A-': L.icon({ iconUrl: 'icons/A_minus.png', iconSize: [32, 32], iconAnchor: [16, 32] }),
        'B+': L.icon({ iconUrl: 'icons/B_plus.png', iconSize: [32, 32], iconAnchor: [16, 32] }),
        'B-': L.icon({ iconUrl: 'icons/B_minus.png', iconSize: [32, 32], iconAnchor: [16, 32] }),
        'O+': L.icon({ iconUrl: 'icons/O_plus.png', iconSize: [32, 32], iconAnchor: [16, 32] }),
        'O-': L.icon({ iconUrl: 'icons/O_minus.png', iconSize: [32, 32], iconAnchor: [16, 32] }),
        'AB+': L.icon({ iconUrl: 'icons/AB_plus.png', iconSize: [32, 32], iconAnchor: [16, 32] }),
        'AB-': L.icon({ iconUrl: 'icons/AB_minus.png', iconSize: [32, 32], iconAnchor: [16, 32] })
    };
    
    function fetchAndDisplayDonors(bloodType) {
        // --- THIS IS THE FIX ---
        // This line ensures special characters like '+' are converted to a safe
        // format (e.g., %2B) before being put in the URL.
        const encodedBloodType = encodeURIComponent(bloodType);
        
        // We use the new, safe variable to build the URL.
        const apiUrl = `getDonors.php?bloodType=${encodedBloodType}`;

        clearAllMarkers();

        fetch(apiUrl)
            .then(response => response.json()) 
            .then(donors => {
                donors.forEach(donor => {
                    const customIcon = bloodTypeIcons[donor.blood_type];
                    const marker = L.marker([donor.donor_lat, donor.donor_lng], { icon: customIcon })
                        .addTo(map)
                        .bindPopup(`<strong>${donor.donor_name}</strong><br>Blood Type: ${donor.blood_type}`);
                    
                    markers.push(marker);
                });
            })
            .catch(error => console.error('Error fetching donor data:', error));
    }

    function clearAllMarkers() {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }

    const bloodTypeFilter = document.getElementById('bloodTypeFilter');
    bloodTypeFilter.addEventListener('change', function () {
        fetchAndDisplayDonors(this.value);
    });

    fetchAndDisplayDonors('all');
});