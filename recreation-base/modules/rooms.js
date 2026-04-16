let currentRoomSort = { field: 'id', direction: 'asc' };
let currentRoomPage = 1;
const roomsPerPage = 10;
let filteredRoomsCache = [];

function loadRooms() {
    let rooms = getAll('rooms');
    const typeFilter = document.getElementById('roomTypeFilter')?.value || '';
    const statusFilter = document.getElementById('roomStatusFilter')?.value || '';
    const searchText = document.getElementById('roomSearch')?.value.toLowerCase() || '';
    
    if (typeFilter) rooms = rooms.filter(r => r.roomType === typeFilter);
    if (statusFilter) rooms = rooms.filter(r => r.status === statusFilter);
    if (searchText) {
        rooms = rooms.filter(r => r.roomNumber.includes(searchText) || r.roomType.toLowerCase().includes(searchText));
    }
    
    filteredRoomsCache = rooms;
    
    // Сортировка
    filteredRoomsCache.sort((a, b) => {
        let valA = a[currentRoomSort.field];
        let valB = b[currentRoomSort.field];
        if (valA < valB) return currentRoomSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentRoomSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    const totalPages = Math.ceil(filteredRoomsCache.length / roomsPerPage);
    const start = (currentRoomPage - 1) * roomsPerPage;
    const paginatedRooms = filteredRoomsCache.slice(start, start + roomsPerPage);
    
    let html = `
        <div class="filter-bar">
            <div class="filter-group">
                <label>🔍 Поиск</label>
                <input type="text" id="roomSearch" placeholder="Номер или тип..." class="search-input" oninput="loadRooms()">
            </div>
            <div class="filter-group">
                <label>🏷️ Тип номера</label>
                <select id="roomTypeFilter" onchange="loadRooms()">
                    <option value="">Все типы</option>
                </select>
            </div>
            <div class="filter-group">
                <label>📊 Статус</label>
                <select id="roomStatusFilter" onchange="loadRooms()">
                    <option value="">Все статусы</option>
                    <option value="Свободен">Свободен</option>
                    <option value="Занят">Занят</option>
                    <option value="На уборке">На уборке</option>
                </select>
            </div>
            <button class="btn-small" onclick="resetRoomFilters()">Сбросить</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="sortable" onclick="sortRooms('id')">ID ${currentRoomSort.field === 'id' ? (currentRoomSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                        <th class="sortable" onclick="sortRooms('roomNumber')">Номер</th>
                        <th class="sortable" onclick="sortRooms('roomType')">Тип</th>
                        <th class="sortable" onclick="sortRooms('floor')">Этаж</th>
                        <th class="sortable" onclick="sortRooms('capacity')">Вместимость</th>
                        <th class="sortable" onclick="sortRooms('pricePerDay')">Цена/день</th>
                        <th class="sortable" onclick="sortRooms('status')">Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    paginatedRooms.forEach(r => {
        let statusClass = r.status === 'Свободен' ? 'free' : (r.status === 'Занят' ? 'occupied' : 'cleaning');
        html += `<tr>
            <td> data-label="ID">${r.id}</td>
            <td> data-label="Номер">${r.roomNumber}</td>
            <td> data-label="Тип">${r.roomType}</td>
            <td> data-label="Этаж">${r.floor}</td>
            <td> data-label="Вместимость">${r.capacity} чел.</td>
            <td> data-label="Цена/день">${r.pricePerDay.toLocaleString()} ₽</td>
            <td> data-label="Статус"><span class="status-badge status-${statusClass}">${r.status}</span></td>
            <td> data-label="Действия"><button class="btn-small" onclick="changeRoomStatus(${r.id})">🔄 Сменить</button></td>
        </tr>`;
    });
    
    html += `</tbody></td></div>`;
    
    if (totalPages > 1) {
        html += `<div class="pagination">`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentRoomPage ? 'active' : ''}" onclick="goToRoomPage(${i})">${i}</button>`;
        }
        html += `</div>`;
    }
    
    document.getElementById('roomsTable').innerHTML = html;
    loadRoomTypeFilter();
}

function loadRoomTypeFilter() {
    const types = [...new Set(getAll('rooms').map(r => r.roomType))];
    const select = document.getElementById('roomTypeFilter');
    if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Все типы</option>' + types.map(t => `<option value="${t}">${t}</option>`).join('');
        if (currentValue) select.value = currentValue;
    }
}

function sortRooms(field) {
    if (currentRoomSort.field === field) {
        currentRoomSort.direction = currentRoomSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentRoomSort.field = field;
        currentRoomSort.direction = 'asc';
    }
    currentRoomPage = 1;
    loadRooms();
}

function goToRoomPage(page) {
    currentRoomPage = page;
    loadRooms();
}

function resetRoomFilters() {
    document.getElementById('roomTypeFilter').value = '';
    document.getElementById('roomStatusFilter').value = '';
    document.getElementById('roomSearch').value = '';
    currentRoomPage = 1;
    loadRooms();
}