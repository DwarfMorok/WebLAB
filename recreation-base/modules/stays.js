let currentStayPage = 1;
const staysPerPage = 10;
let filteredStaysCache = [];

function loadCurrentStays() {
    const stays = getAll('stays').filter(s => !s.actualCheckOut);
    const guests = getAll('guests');
    const rooms = getAll('rooms');
    const stayServices = getAll('stayServices');
    const services = getAll('services');
    const searchText = document.getElementById('staySearch')?.value.toLowerCase() || '';
    
    let staysWithData = stays.map(s => {
        const guest = guests.find(g => g.id === s.guestId);
        const room = rooms.find(r => r.id === s.roomId);
        const days = Math.max(1, Math.floor((new Date() - new Date(s.actualCheckIn)) / 86400000));
        const roomCost = days * (room?.pricePerDay || 0);
        const servSum = stayServices.filter(ss => ss.stayId === s.id).reduce((sum, ss) => {
            const serv = services.find(sv => sv.id === ss.serviceId);
            return sum + (serv?.price || 0) * ss.quantity;
        }, 0);
        return {
            ...s,
            guestName: guest ? `${guest.lastName} ${guest.firstName}` : '',
            guestPhone: guest?.phone || '',
            roomNumber: room?.roomNumber || '',
            days,
            total: roomCost + servSum,
            checkInDate: new Date(s.actualCheckIn).toLocaleDateString()
        };
    });
    
    if (searchText) {
        staysWithData = staysWithData.filter(s => 
            s.guestName.toLowerCase().includes(searchText) || 
            s.roomNumber.includes(searchText) ||
            s.guestPhone.includes(searchText)
        );
    }
    
    filteredStaysCache = staysWithData;
    
    const totalPages = Math.ceil(filteredStaysCache.length / staysPerPage);
    const start = (currentStayPage - 1) * staysPerPage;
    const paginatedStays = filteredStaysCache.slice(start, start + staysPerPage);
    
    let html = `
        <div class="filter-bar">
            <div class="filter-group">
                <label>🔍 Поиск</label>
                <input type="text" id="staySearch" placeholder="Гость, номер или телефон..." class="search-input" oninput="loadCurrentStays()">
            </div>
            <button class="btn-small" onclick="resetStayFilters()">Сбросить</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Гость</th>
                        <th>Телефон</th>
                        <th>Номер</th>
                        <th>Дата заезда</th>
                        <th>Дней</th>
                        <th>Сумма</th>
                        <th>Услуги</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    paginatedStays.forEach(s => {
        html += `<tr>
            <td> data-label="Гость">${s.guestName}</td>
            <td> data-label="Телефон">${s.guestPhone}</td>
            <td> data-label="Номер">${s.roomNumber}</td>
            <td> data-label="Дата заезда">${s.checkInDate}</td>
            <td> data-label="Дней">${s.days}</td>
            <td> data-label="Сумма"><strong>${s.total.toLocaleString()} ₽</strong></td>
            <td> data-label="Услуги"><button class="btn-small info" onclick="openServiceModal(${s.id})">➕ Услуга</button></td>
            <td> data-label="Действия"><button class="btn-small danger" onclick="checkoutGuest(${s.id})">🚪 Выселить</button></td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    if (totalPages > 1) {
        html += `<div class="pagination">`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentStayPage ? 'active' : ''}" onclick="goToStayPage(${i})">${i}</button>`;
        }
        html += `</div>`;
    }
    
    document.getElementById('currentStaysTable').innerHTML = html;
}

function goToStayPage(page) {
    currentStayPage = page;
    loadCurrentStays();
}

function resetStayFilters() {
    document.getElementById('staySearch').value = '';
    currentStayPage = 1;
    loadCurrentStays();
}