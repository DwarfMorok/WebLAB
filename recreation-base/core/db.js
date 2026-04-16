// База данных на JSON-файлах + fallback
const DB = {};

// Встроенные тестовые данные (на случай, если JSON не загрузились)
const FALLBACK_DATA = {
    roles: [
        { id: 1, roleName: "Администратор системы", description: "Полный доступ" },
        { id: 2, roleName: "Управляющий", description: "Отчёты, просмотр" },
        { id: 3, roleName: "Ресепшн", description: "Бронирования, заселение" },
        { id: 4, roleName: "Обслуживающий персонал", description: "Уборка" }
    ],
    users: [
        { id: 1, login: "admin", password: "12345", fullName: "Администратор", roleId: 1, roleName: "Администратор системы", phone: "", isActive: true },
        { id: 2, login: "manager", password: "12345", fullName: "Управляющий", roleId: 2, roleName: "Управляющий", phone: "", isActive: true },
        { id: 3, login: "reception", password: "12345", fullName: "Иванова Мария", roleId: 3, roleName: "Ресепшн", phone: "+7-999-123-4567", isActive: true },
        { id: 4, login: "housekeep", password: "12345", fullName: "Зайцева Елена", roleId: 4, roleName: "Обслуживающий персонал", phone: "", isActive: true }
    ],
    guests: [
        { id: 1, lastName: "Иванов", firstName: "Иван", patronymic: "Иванович", phone: "+7-916-123-4567", passportSeries: "4512", passportNumber: "123456", registrationDate: "2025-01-15T10:00:00" },
        { id: 2, lastName: "Петров", firstName: "Петр", patronymic: "Петрович", phone: "+7-916-234-5678", passportSeries: "4513", passportNumber: "234567", registrationDate: "2025-02-10T14:30:00" }
    ],
    rooms: [
        { id: 1, roomNumber: "101", roomType: "Эконом", floor: 1, capacity: 1, pricePerDay: 2500, status: "Свободен" },
        { id: 2, roomNumber: "102", roomType: "Эконом", floor: 1, capacity: 1, pricePerDay: 2500, status: "Свободен" },
        { id: 3, roomNumber: "201", roomType: "Стандарт", floor: 2, capacity: 2, pricePerDay: 4000, status: "Свободен" },
        { id: 4, roomNumber: "202", roomType: "Стандарт", floor: 2, capacity: 2, pricePerDay: 4000, status: "Занят" },
        { id: 5, roomNumber: "301", roomType: "Люкс", floor: 3, capacity: 2, pricePerDay: 7500, status: "Свободен" },
        { id: 6, roomNumber: "401", roomType: "Семейный", floor: 4, capacity: 4, pricePerDay: 6000, status: "Свободен" }
    ],
    services: [
        { id: 1, name: "Питание (комплексное)", price: 800, unit: "день" },
        { id: 2, name: "Прокат лодки", price: 500, unit: "час" },
        { id: 3, name: "Сауна", price: 2000, unit: "час" }
    ],
    bookings: [
        { id: 1, guestId: 1, roomId: 3, checkInDate: "2025-05-10", checkOutDate: "2025-05-15", bookingDate: "2025-04-01T10:30:00", status: "Подтверждена", createdBy: "admin" }
    ],
    stays: [
        { id: 1, guestId: 1, roomId: 4, bookingId: null, actualCheckIn: "2025-04-10T14:00:00", actualCheckOut: null, totalCost: 0, checkedInBy: "reception", checkedOutBy: null }
    ],
    stayServices: [],
    auditLogs: []
};

// Загрузка всех данных из JSON-файлов
async function loadAllData() {
    const tables = ['guests', 'rooms', 'bookings', 'stays', 'services', 'stayServices', 'users', 'roles', 'auditLogs'];
    
    for (const table of tables) {
        try {
            const response = await fetch(`data/${table}.json`);
            if (response.ok) {
                DB[table] = await response.json();
                console.log(`✅ Загружен ${table}:`, DB[table].length, 'записей');
            } else {
                console.warn(`⚠️ Файл ${table}.json не найден, использую fallback`);
                DB[table] = FALLBACK_DATA[table] || [];
            }
        } catch (error) {
            console.error(`❌ Ошибка загрузки ${table}:`, error);
            DB[table] = FALLBACK_DATA[table] || [];
        }
    }
    
    // Дополнительная проверка: если users пустые — подставляем fallback
    if (!DB.users || DB.users.length === 0) {
        console.warn('⚠️ Пользователи не загружены, использую fallback');
        DB.users = FALLBACK_DATA.users;
    }
    
    console.log('✅ Все данные загружены. Доступные таблицы:', Object.keys(DB));
}

// Сохранение таблицы в памяти
function saveTable(tableName, data) {
    DB[tableName] = data;
    console.log(`📝 Таблица ${tableName} обновлена в памяти, записей: ${data.length}`);
}

// Получение всех данных
function getAll(tableName) {
    return DB[tableName] || [];
}

// Поиск по ID
function getById(tableName, id) {
    const table = DB[tableName];
    if (!table) return null;
    return table.find(item => item.id === id);
}

// Добавление записи
function addRecord(tableName, record) {
    const table = DB[tableName] || [];
    const newId = table.length > 0 ? Math.max(...table.map(r => r.id)) + 1 : 1;
    const newRecord = { ...record, id: newId };
    table.push(newRecord);
    DB[tableName] = table;
    console.log(`➕ Добавлена запись в ${tableName}, новый ID: ${newId}`);
    return newRecord;
}

// Обновление записи
function updateRecord(tableName, id, newData) {
    const table = DB[tableName] || [];
    const index = table.findIndex(r => r.id === id);
    if (index !== -1) {
        const oldRecord = { ...table[index] };
        table[index] = { ...table[index], ...newData };
        DB[tableName] = table;
        console.log(`✏️ Обновлена запись ${id} в ${tableName}`);
        return true;
    }
    console.warn(`⚠️ Запись ${id} не найдена в ${tableName}`);
    return false;
}

// Удаление записи
function deleteRecord(tableName, id) {
    const table = DB[tableName] || [];
    const filtered = table.filter(r => r.id !== id);
    const deleted = filtered.length !== table.length;
    if (deleted) {
        DB[tableName] = filtered;
        console.log(`🗑️ Удалена запись ${id} из ${tableName}`);
    }
    return deleted;
}

// Экспорт всех данных в JSON
function exportAllToJSON() {
    const exportData = {};
    for (const key in DB) {
        if (DB[key] && Array.isArray(DB[key])) {
            exportData[key] = DB[key];
        }
    }
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('💾 Данные экспортированы');
}

// Импорт данных из JSON
function importFromJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            for (const key in imported) {
                if (Array.isArray(imported[key])) {
                    DB[key] = imported[key];
                    console.log(`📥 Импортирована таблица ${key}: ${imported[key].length} записей`);
                }
            }
            callback(true, 'Данные успешно восстановлены');
        } catch (error) {
            console.error('❌ Ошибка импорта:', error);
            callback(false, 'Ошибка при импорте: ' + error.message);
        }
    };
    reader.readAsText(file);
}