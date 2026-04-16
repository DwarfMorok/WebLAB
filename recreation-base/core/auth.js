let currentUser = null;

async function login() {
    const loginInput = document.getElementById('loginInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value;
    
    console.log('Попытка входа:', loginInput);
    
    if (!loginInput || !passwordInput) {
        showError('Введите логин и пароль');
        return;
    }
    
    // Ждём, пока данные загрузятся
    if (!DB.users || DB.users.length === 0) {
        console.log('Данные пользователей ещё не загружены, ждём...');
        await loadAllData();
    }
    
    const users = getAll('users');
    console.log('Пользователи в БД:', users.map(u => u.login));
    
    // Сравниваем пароль как есть (без хеширования для простоты)
    const user = users.find(u => u.login === loginInput && u.isActive);
    
    if (!user) {
        console.log('Пользователь не найден:', loginInput);
        showError('Неверный логин');
        return;
    }
    
    // Простое сравнение паролей (без MD5 для отладки)
    if (user.password !== passwordInput) {
        console.log('Неверный пароль для:', loginInput);
        showError('Неверный пароль');
        return;
    }
    
    console.log('Успешный вход!', user.fullName);
    
    currentUser = user;
    
    // Загружаем роль
    const roles = getAll('roles');
    const role = roles.find(r => r.id === user.roleId);
    if (role) user.roleName = role.roleName;
    
    // Запись в аудит
    addAuditLog('Вход в систему', 'Users', user.id);
    
    // Показываем главное приложение
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    document.getElementById('currentUserName').innerText = user.fullName;
    document.getElementById('currentUserRole').innerText = user.roleName;
    
    // Настройка меню по ролям
    const reportsMenu = document.getElementById('reportsMenu');
    const adminMenu = document.getElementById('adminMenu');
    
    if (reportsMenu) {
        reportsMenu.style.display = (user.roleName === 'Администратор системы' || user.roleName === 'Управляющий') ? 'block' : 'none';
    }
    if (adminMenu) {
        adminMenu.style.display = (user.roleName === 'Администратор системы') ? 'block' : 'none';
    }
    
    // Установка дат по умолчанию
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const bookingCheckIn = document.getElementById('bookingCheckIn');
    const bookingCheckOut = document.getElementById('bookingCheckOut');
    const checkinDate = document.getElementById('checkinDate');
    
    if (bookingCheckIn) bookingCheckIn.value = today;
    if (bookingCheckOut) bookingCheckOut.value = future;
    if (checkinDate) checkinDate.value = today;
    
    // Загружаем стартовую панель
    showPanel('bookingsList');
}

function logout() {
    if (currentUser) {
        addAuditLog('Выход из системы', 'Users', currentUser.id);
    }
    currentUser = null;
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginInput').value = '';
    document.getElementById('passwordInput').value = '';
    
    // Сброс выбора демо-пользователя
    const demoSelect = document.getElementById('demoUserSelect');
    if (demoSelect) demoSelect.value = '';
    
    console.log('Выход из системы');
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
    console.error('Ошибка:', message);
}

function addAuditLog(action, table, recordId) {
    if (!currentUser) {
        console.warn('Нет текущего пользователя для аудита');
        return;
    }
    
    const audits = getAll('auditLogs');
    const newId = audits.length > 0 ? Math.max(...audits.map(a => a.id)) + 1 : 1;
    audits.push({
        id: newId,
        userId: currentUser.id,
        action: action,
        table: table,
        recordId: recordId,
        timestamp: new Date().toISOString()
    });
    saveTable('auditLogs', audits);
    console.log(`📝 Аудит: ${action} (${table}/${recordId})`);
}