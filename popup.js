// popup.js
const btn = document.getElementById("fetchScheduleBtn");
const statusEl = document.getElementById("status");

btn.addEventListener("click", async () => {
    statusEl.innerText = "🔄 Getting token...";
    btn.disabled = true;

    try {
        const tokenResponse = await new Promise(resolve => {
            chrome.runtime.sendMessage({action: "getAuthToken"}, resolve);
        });

        if (!tokenResponse.success) {
            alert("⚠️ " + tokenResponse.error);
            statusEl.innerText = "❌ " + tokenResponse.error;
            btn.disabled = false;
            return;
        }

        const token = tokenResponse.token;

        const {start, end} = getDateRange();
        const url = `https://my.itmo.ru/api/schedule/schedule/personal?date_start=${start}&date_end=${end}`;

        statusEl.innerText = "📡 Fetching schedule...";

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            credentials: "include"
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("✅ Fetched:", data);

        const ics = convertToICS(data.data || []);
        saveFile(ics, "ics");

        alert("✅ Schedule downloaded as .ics!");
        statusEl.innerText = "✅ Downloaded!";
    } catch (err) {
        alert("❌ Error: " + err.message);
        statusEl.innerText = "❌ Failed: " + err.message;
    } finally {
        btn.disabled = false;
    }
});

function getDateRange() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 4);

    const format = date => date.toISOString().split("T")[0];
    return {
        start: format(startDate),
        end: format(endDate)
    };
}

function saveFile(content, type) {
    const blob = new Blob([content], {type: type === "ics" ? "text/calendar" : "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date().toISOString().split("T")[0];
    a.download = `ITMO_Schedule_${today}.${type}`;
    a.click();
    URL.revokeObjectURL(url);
}

function convertToICS(data) {
    const pad = num => String(num).padStart(2, '0');

    function formatDateTime(date, time) {
        const dt = new Date(`${date}T${time}:00`);
        return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
    }

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'CALSCALE:GREGORIAN',
        'PRODID:-//ITMO Schedule Export//EN'
    ];

    data.forEach(day => {
        day.lessons.forEach(lesson => {
            const uid = `${lesson.pair_id}@itmo.ru`;
            const start = formatDateTime(day.date, lesson.time_start);
            const end = formatDateTime(day.date, lesson.time_end);
            const summary = lesson.group || 'Пара';
            const location = `${lesson.building || ''} ${lesson.room || ''}`.trim();
            const description = `Преподаватель: ${lesson.teacher_name || '—'}\nФормат: ${lesson.format || ''}`;

            lines.push('BEGIN:VEVENT');
            lines.push(`UID:${uid}`);
            lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
            lines.push(`DTSTART:${start}`);
            lines.push(`DTEND:${end}`);
            lines.push(`SUMMARY:${summary}`);
            if (location) lines.push(`LOCATION:${location}`);
            lines.push(`DESCRIPTION:${description}`);
            lines.push('END:VEVENT');
        });
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}
