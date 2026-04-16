let currentBookingSort = { field: 'id', direction: 'asc' };
let currentBookingPage = 1;
const bookingsPerPage = 10;
let filteredBookingsCache = [];

function loadBookings() {
    let bookings = getAll('bookings');
    const guests = getAll('guests');
    const rooms = getAll('rooms');
    
    // Фильтрация
    const startDate = document.getElementById('filterStartDate')?.value;
    const endDate = document.getElementById('filterEndDate')?.value;
    const status = document.getElementById('filterStatus')?.value;
    const searchText = document.getElementById('bookingSearch')?.value.toLowerCase() || '';
    
    if (startDate) bookings = bookings.filter(b => b.checkInDate >= startDate);
    if (endDate) bookings = bookings.filter(b => b.checkOutDate <= endDate);
    if (status) bookings = bookings.filter(b => b.status === status);
    if (searchText) {
        bookings = bookings.filter(b => {
            const guest = guests.find(g => g.id === b.guestId);
            const room = rooms.find(r => r.id === b.roomId);
            return (guest?.lastName?.toLowerCase().includes(searchText)) ||
                   (guest?.firstName?.toLowerCase().includes(searchText)) ||
                   (room?.roomNumber?.includes(searchText));
        });
    }
    
    filteredBookingsCache = bookings;
    
    // Сортировка
    filteredBookingsCache.sort((a, b) => {
        let valA = a[currentBookingSort.field];
        let valB = b[currentBookingSort.field];
        if (currentBookingSort.field === 'checkInDate' || currentBookingSort.field === 'checkOutDate') {
            valA = new Date(valA);
            valB = new Date(valB);
        }
        if (valA < valB) return currentBookingSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentBookingSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Пагинация
    const totalPages = Math.ceil(filteredBookingsCache.length / bookingsPerPage);
    const start = (currentBookingPage - 1) * bookingsPerPage;
    const paginatedBookings = filteredBookingsCache.slice(start, start + bookingsPerPage);
    
    let html = `
        <div class="filter-bar">
            <div class="filter-group">
                <label>🔍 Поиск</label>
                <input type="text" id="bookingSearch" placeholder="Гость или номер..." class="search-input" oninput="loadBookings()">
            </div>
            <div class="filter-group">
                <label>📅 Дата заезда с</label>
                <input type="date" id="filterStartDate" onchange="loadBookings()">
            </div>
            <div class="filter-group">
                <label>📅 по</label>
                <input type="date" id="filterEndDate" onchange="loadBookings()">
            </div>
            <div class="filter-group">
                <label>🏷️ Статус</label>
                <select id="filterStatus" onchange="loadBookings()">
                    <option value="">Все</option>
                    <option value="Подтверждена">Подтверждена</option>
                    <option value="Отменена">Отменена</option>
                </select>
            </div>
            <button class="btn-small" onclick="resetBookingFilters()">Сбросить</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="sortable" onclick="sortBookings('id')">ID ${currentBookingSort.field === 'id' ? (currentBookingSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                        <th class="sortable" onclick="sortBookings('guestId')">Гость</th>
                        <th class="sortable" onclick="sortBookings('roomId')">Номер</th>
                        <th class="sortable" onclick="sortBookings('checkInDate')">Заезд ${currentBookingSort.field === 'checkInDate' ? (currentBookingSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                        <th class="sortable" onclick="sortBookings('checkOutDate')">Выезд</th>
                        <th class="sortable" onclick="sortBookings('status')">Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    paginatedBookings.forEach(b => {
        const guest = guests.find(g => g.id === b.guestId);
        const room = rooms.find(r => r.id === b.roomId);
        html += `<tr>
            <td> data-label="ID">${b.id}</td>
            <td> data-label="Гость">${guest ? `${guest.lastName} ${guest.firstName}` : ''}</td>
            <td> data-label="Номер">${room ? room.roomNumber : ''}</td>
            <td> data-label="Заезд">${b.checkInDate}</td>
            <td> data-label="Выезд">${b.checkOutDate}</td>
            <td> data-label="Статус"><span class="status-badge status-${b.status === 'Подтверждена' ? 'confirmed' : 'cancelled'}">${b.status}</span></td>
            <td> data-label="Действия"><button class="btn-small" onclick="cancelBooking(${b.id})">❌ Отменить</button></td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    // Пагинация
    if (totalPages > 1) {
        html += `<div class="pagination">`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentBookingPage ? 'active' : ''}" onclick="goToBookingPage(${i})">${i}</button>`;
        }
        html += `</div>`;
    }
    
    document.getElementById('bookingsTable').innerHTML = html;
}

function sortBookings(field) {
    if (currentBookingSort.field === field) {
        currentBookingSort.direction = currentBookingSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentBookingSort.field = field;
        currentBookingSort.direction = 'asc';
    }
    currentBookingPage = 1;
    loadBookings();
}

function goToBookingPage(page) {
    currentBookingPage = page;
    loadBookings();
}

function resetBookingFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('bookingSearch').value = '';
    currentBookingPage = 1;
    loadBookings();
}