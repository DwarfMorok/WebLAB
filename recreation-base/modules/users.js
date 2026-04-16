let currentUserPage = 1;
const usersPerPage = 10;
let filteredUsersCache = [];

function loadUsers() {
    let users = getAll('users');
    const searchText = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('userRoleFilter')?.value || '';
    
    if (searchText) {
        users = users.filter(u => 
            u.login.toLowerCase().includes(searchText) || 
            u.fullName.toLowerCase().includes(searchText) ||
            (u.phone && u.phone.includes(searchText))
        );
    }
    if (roleFilter) {
        users = users.filter(u => u.roleName === roleFilter);
    }
    
    filteredUsersCache = users;
    
    const totalPages = Math.ceil(filteredUsersCache.length / usersPerPage);
    const start = (currentUserPage - 1) * usersPerPage;
    const paginatedUsers = filteredUsersCache.slice(start, start + usersPerPage);
    
    let html = `
        <div class="filter-bar">
            <div class="filter-group">
                <label>🔍 Поиск</label>
                <input type="text" id="userSearch" placeholder="Логин, ФИО или телефон..." class="search-input" oninput="loadUsers()">
            </div>
            <div class="filter-group">
                <label>🎭 Роль</label>
                <select id="userRoleFilter" onchange="loadUsers()">
                    <option value="">Все роли</option>
                    <option value="Администратор системы">Администратор</option>
                    <option value="Управляющий">Управляющий</option>
                    <option value="Ресепшн">Ресепшн</option>
                    <option value="Обслуживающий персонал">Обслуживающий персонал</option>
                </select>
            </div>
            <button class="btn-small" onclick="resetUserFilters()">Сбросить</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Логин</th>
                        <th>ФИО</th>
                        <th>Роль</th>
                        <th>Телефон</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    paginatedUsers.forEach(u => {
        html += `<tr>
            <td> data-label="ID">${u.id}</td>
            <td> data-label="Логин">${u.login}</td>
            <td> data-label="ФИО">${u.fullName}</td>
            <td> data-label="Роль">${u.roleName}</td>
            <td> data-label="Телефон">${u.phone || '-'}</td>
            <td> data-label="Статус"><span class="status-badge ${u.isActive ? 'status-active' : 'status-inactive'}">${u.isActive ? 'Активен' : 'Заблокирован'}</span></td>
            <td> data-label="Действия">
                <button class="btn-small" onclick="editUser(${u.id})">✏️</button>
                <button class="btn-small warning" onclick="toggleUserActive(${u.id})">🔒</button>
                <button class="btn-small info" onclick="resetUserPassword(${u.id})">🔑</button>
                <button class="btn-small danger" onclick="deleteUser(${u.id})">🗑️</button>
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    if (totalPages > 1) {
        html += `<div class="pagination">`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentUserPage ? 'active' : ''}" onclick="goToUserPage(${i})">${i}</button>`;
        }
        html += `</div>`;
    }
    
    document.getElementById('usersTable').innerHTML = html;
    loadUserRoleFilter();
}

function loadUserRoleFilter() {
    const users = getAll('users');
    const roles = [...new Set(users.map(u => u.roleName))];
    const select = document.getElementById('userRoleFilter');
    if (select && roles.length) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Все роли</option>' + roles.map(r => `<option value="${r}">${r}</option>`).join('');
        if (currentValue) select.value = currentValue;
    }
}

function goToUserPage(page) {
    currentUserPage = page;
    loadUsers();
}

function resetUserFilters() {
    document.getElementById('userSearch').value = '';
    document.getElementById('userRoleFilter').value = '';
    currentUserPage = 1;
    loadUsers();
}