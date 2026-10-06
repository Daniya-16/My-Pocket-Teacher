const localTheme = localStorage.getItem('dashboard-theme') || 'dark-mode';
if (localTheme === 'light-mode') {
    document.body.classList.add('light-mode');
} else {
    document.body.classList.remove('light-mode');
}
const tbody = document.getElementById('timeBlockBody');
tbody.innerHTML = ""; // Clear out old contents
for (let hour = 5; hour <= 22; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const nextDisplayHour = (hour + 1) > 12 ? (hour + 1) - 12 : (hour + 1);
    const nextAmpm = (hour + 1) >= 12 ? 'pm' : 'am';
    const rowStr = `
        <tr>
            <!-- Replaced text-muted with planner-time-cell to fix visibility -->
            <td class="planner-time-cell font-monospace" style="font-size:0.8rem;">
                ${displayHour}:00 - ${nextDisplayHour}:00 ${nextAmpm}
            </td>
            <td><input type="text" class="form-control-plaintext text-center small"></td>
            <td><input type="text" class="form-control-plaintext text-center small"></td>
            <td><input type="text" class="form-control-plaintext text-center small"></td>
            <td><input type="text" class="form-control-plaintext text-center small"></td>
            <td><input type="text" class="form-control-plaintext text-center small"></td>
            <td><input type="text" class="form-control-plaintext text-center small"></td>
            <td><input type="text" class="form-control-plaintext text-center small"></td>
        </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', rowStr);
}
