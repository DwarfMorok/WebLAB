// ============================================
// ГЛАВНЫЙ КОНТРОЛЛЕР
// ============================================

function toggleSubmenu(element) {
    element.classList.toggle('active');
}

function initPanels() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div id="bookingsList" class="content-panel"><h2 class="panel-title">📋 Список бронирований</h2><div id="bookingsTable"></div></div>
        <div id="newBooking" class="content-panel"><h2 class="panel-title">➕ Новое бронирование</h2><div id="newBookingForm"></div></div>
        <div id="guests" class="content-panel"><h2 class="panel-title">👥 Гости</h2><button class="btn-small" onclick="openGuestModal()">➕ Добавить</button><div id="guestsTable"></div></div>
        <div id="rooms" class="content-panel"><h2 class="panel-title">🏨 Номера</h2><div id="roomsTable"></div></div>
        <div id="currentStays" class="content-panel"><h2 class="panel-title">🏠 Текущие гости</h2><div id="currentStaysTable"></div></div>
        <div id="checkin" class="content-panel"><h2 class="panel-title">✅ Заселение гостя</h2><div id="checkinForm"></div></div>
        <div id="loadReport" class="content-panel"><h2 class="panel-title">📈 Загрузка номеров</h2><div id="loadReportTable"></div></div>
        <div id="revenueReport" class="content-panel"><h2 class="panel-title">💰 Отчёт по выручке</h2><div id="revenueReportTable"></div></div>
        <div id="guestReport" class="content-panel"><h2 class="panel-title">👥 Аналитика гостей</h2><div id="guestReportTable"></div></div>
        <div id="auditReport" class="content-panel"><h2 class="panel-title">📝 Журнал аудита</h2><div id="auditReportTable"></div></div>
        <div id="users" class="content-panel"><h2 class="panel-title">👤 Пользователи</h2><button class="btn-small" onclick="openUserModal()">➕ Добавить</button><div id="usersTable"></div></div>
        <div id="backup" class="content-panel"><h2 class="panel-title">💾 Резервное копирование</h2><button class="btn btn-primary" onclick="openBackupModal()">Управление резервными копиями</button></div>
    `;
    
    // Форма нового бронирования
    document.getElementById('newBookingForm').innerHTML = `
        <div class="form-group"><label>Гость</label><select id="bookingGuest"></select></div>
        <div class="form-group"><label>Номер</label><select id="bookingRoom"></select></div>
        <div class="form-group"><label>Дата заезда</label><input type="date" id="bookingCheckIn"></div>
        <div class="form-group"><label>Дата выезда</label><input type="date" id="bookingCheckOut"></div>
        <button class="btn btn-primary" onclick="createBooking()">Создать бронирование</button>
    `;
    
    // Форма заселения
    document.getElementById('checkinForm').innerHTML = `
        <div class="form-group"><label>Поиск гостя</label><input type="text" id="guestSearch" placeholder="Фамилия или телефон" oninput="searchGuests()"></div>
        <div class="form-group"><select id="checkinGuest"></select></div>
        <button class="btn-small" onclick="openGuestModalFromCheckin()">➕ Новый гость</button>
        <div class="form-group"><label>Номер</label><select id="checkinRoom"></select></div>
        <div class="form-group"><label>Дата заезда</label><input type="date" id="checkinDate"></div>
        <button class="btn btn-primary" onclick="checkinGuest()">Заселить</button>
    `;
}

function showPanel(panelId) {
    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    
    // Загрузка данных
    if (panelId === 'bookingsList') loadBookings();
    if (panelId === 'guests') loadGuests();
    if (panelId === 'rooms') { loadRooms(); loadRoomTypes(); }
    if (panelId === 'currentStays') loadCurrentStays();
    if (panelId === 'users') loadUsers();
    if (panelId === 'newBooking') { loadGuestsForSelect(); loadRoomsForSelect(); }
    if (panelId === 'checkin') { loadAvailableRoomsForCheckin(); searchGuests(); }
    if (panelId === 'loadReport') showLoadReport();
    if (panelId === 'revenueReport') showRevenueReport();
    if (panelId === 'guestReport') showGuestReport();
    if (panelId === 'auditReport') showAuditReport();
}

function openBackupModal() {
    document.getElementById('backupModal').style.display = 'flex';
}

function closeBackupModal() {
    document.getElementById('backupModal').style.display = 'none';
}

function restoreFromJSON(input) {
    const file = input.files[0];
    if (!file) return;
    importFromJSON(file, (success, message) => {
        alert(message);
        if (success) location.reload();
    });
}

// ============================================
// ГАМБУРГЕР МЕНЮ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
// ============================================
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Автоматическое закрытие меню на телефонах при клике на пункт
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 576) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('open');
            }
        });
    });
});