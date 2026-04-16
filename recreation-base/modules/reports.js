function showLoadReport() {
    const rooms = getAll('rooms');
    const bookings = getAll('bookings');
    const start = document.getElementById('loadStartDate')?.value;
    const end = document.getElementById('loadEndDate')?.value;
    
    let totalRooms = rooms.length;
    let occupiedRooms = rooms.filter(r => r.status === 'Занят').length;
    let freeRooms = rooms.filter(r => r.status === 'Свободен').length;
    let occupancyPercent = (occupiedRooms / totalRooms * 100).toFixed(1);
    
    let html = `
        <div class="report-summary">
            <div class="summary-card">
                <h4>📊 Всего номеров</h4>
                <div class="value">${totalRooms}</div>
            </div>
            <div class="summary-card">
                <h4>🏠 Занято</h4>
                <div class="value">${occupiedRooms}</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${occupancyPercent}%"></div></div>
            </div>
            <div class="summary-card">
                <h4>🟢 Свободно</h4>
                <div class="value">${freeRooms}</div>
            </div>
            <div class="summary-card">
                <h4>📈 Загрузка</h4>
                <div class="value">${occupancyPercent}%</div>
            </div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>Номер</th><th>Тип</th><th>Вместимость</th><th>Цена/день</th><th>Статус</th></tr></thead>
                <tbody>
    `;
    
    rooms.forEach(r => {
        const isOccupied = bookings.some(b => b.roomId === r.id && b.status === 'Подтверждена' && 
            (!start || b.checkInDate >= start) && (!end || b.checkOutDate <= end));
        html += `<tr>
            <td>${r.roomNumber}</td>
            <td>${r.roomType}</td>
            <td>${r.capacity}</td>
            <td>${r.pricePerDay.toLocaleString()} ₽</td>
            <td><span class="status-badge ${r.status === 'Свободен' ? 'status-free' : 'status-occupied'}">${r.status}</span></td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('loadReportTable').innerHTML = html;
}

function showRevenueReport() {
    const stays = getAll('stays').filter(s => s.actualCheckOut);
    const rooms = getAll('rooms');
    const stayServices = getAll('stayServices');
    const services = getAll('services');
    
    const start = document.getElementById('revenueStartDate')?.value;
    const end = document.getElementById('revenueEndDate')?.value;
    
    let totalStay = 0, totalServ = 0;
    
    stays.forEach(s => {
        if ((!start || s.actualCheckOut >= start) && (!end || s.actualCheckOut <= end)) {
            const room = rooms.find(r => r.id === s.roomId);
            const days = Math.max(1, Math.floor((new Date(s.actualCheckOut) - new Date(s.actualCheckIn)) / 86400000));
            totalStay += days * (room?.pricePerDay || 0);
        }
    });
    
    stayServices.forEach(ss => {
        if ((!start || ss.serviceDate >= start) && (!end || ss.serviceDate <= end)) {
            const serv = services.find(s => s.id === ss.serviceId);
            totalServ += (serv?.price || 0) * ss.quantity;
        }
    });
    
    let html = `
        <div class="report-summary">
            <div class="summary-card"><h4>🏨 Выручка от проживания</h4><div class="value">${totalStay.toLocaleString()} ₽</div></div>
            <div class="summary-card"><h4>🍽️ Выручка от услуг</h4><div class="value">${totalServ.toLocaleString()} ₽</div></div>
            <div class="summary-card"><h4>💰 ИТОГО</h4><div class="value">${(totalStay + totalServ).toLocaleString()} ₽</div></div>
        </div>
        <div class="table-container">
            <table class="data-table"><thead><tr><th>Период</th><th>Проживание</th><th>Услуги</th><th>Итого</th></tr></thead>
            <tbody><tr><td>${start || 'все'} — ${end || 'все'}</td>
            <td>${totalStay.toLocaleString()} ₽</td><td>${totalServ.toLocaleString()} ₽</td>
            <td><strong>${(totalStay + totalServ).toLocaleString()} ₽</strong></td></tr></tbody></table></div>`;
    
    document.getElementById('revenueReportTable').innerHTML = html;
}