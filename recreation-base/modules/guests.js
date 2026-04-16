let editingGuestId = null;
let currentGuestView = 'table'; // 'table' или 'cards'

function toggleGuestView() {
    currentGuestView = currentGuestView === 'table' ? 'cards' : 'table';
    loadGuests();
}

function loadGuests() {
    const guests = getAll('guests');
    const container = document.getElementById('guestsTable');
    
    if (currentGuestView === 'table') {
        // Табличный вид
        let html = `
            <div class="table-container">
                <table class="data-table" id="guestsDataTable">
                    <thead>
                        <tr><th onclick="sortGuests('id')">ID</th>
                            <th onclick="sortGuests('lastName')">Фамилия</th>
                            <th onclick="sortGuests('firstName')">Имя</th>
                            <th>Телефон</th>
                            <th>Паспорт</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        guests.forEach(g => {
            html += `<tr>
                <td>${g.id}</td>
                <td>${g.lastName}</td>
                <td>${g.firstName}</td>
                <td>${g.phone}</td>
                <td>${g.passportSeries} ${g.passportNumber}</td>
                <td>
                    <button class="btn-small" onclick="editGuest(${g.id})">✏️</button>
                    <button class="btn-small danger" onclick="deleteGuest(${g.id})">🗑️</button>
                 </td>
            </tr>`;
        });
        html += `</tbody></table></div>
                <div style="margin-top: 10px;">
                    <button class="btn-small" onclick="toggleGuestView()">📇 Переключить на карточки</button>
                </div>`;
        container.innerHTML = html;
    } else {
        // Карточный вид
        let html = `<div class="cards-grid">`;
        guests.forEach(g => {
            html += `
                <div class="guest-card">
                    <h3>${g.lastName} ${g.firstName} ${g.patronymic || ''}</h3>
                    <p class="phone">📞 ${g.phone}</p>
                    <p class="passport">🪪 ${g.passportSeries} ${g.passportNumber}</p>
                    <p>📅 Регистрация: ${new Date(g.registrationDate).toLocaleDateString()}</p>
                    <div style="margin-top: 12px;">
                        <button class="btn-small" onclick="editGuest(${g.id})">✏️ Редактировать</button>
                        <button class="btn-small danger" onclick="deleteGuest(${g.id})">🗑️ Удалить</button>
                    </div>
                </div>
            `;
        });
        html += `</div>
                <div style="margin-top: 10px;">
                    <button class="btn-small" onclick="toggleGuestView()">📋 Переключить на таблицу</button>
                </div>`;
        container.innerHTML = html;
    }
}

function sortGuests(field) {
    const guests = getAll('guests');
    guests.sort((a, b) => {
        if (a[field] < b[field]) return -1;
        if (a[field] > b[field]) return 1;
        return 0;
    });
    saveTable('guests', guests);
    loadGuests();
}