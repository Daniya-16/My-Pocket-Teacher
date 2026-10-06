// --- DOM Nodes Core Registry ---
const noteContent = document.getElementById('noteContent');
const noteTags = document.getElementById('noteTags');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesGrid = document.getElementById('notesGrid');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const micBtn = document.getElementById('micBtn');
const recordingStatus = document.getElementById('recordingStatus');
const filterLabel = document.getElementById('filterLabel');
const inputFormTitle = document.getElementById('inputFormTitle');

// --- Memory Layer State Management ---
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let activeTagFilter = "";
let editIndex = null; // Tracks index when editing a note

// --- Web Speech API System Implementation ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;

    recognition.onstart = () => {
        recordingStatus.textContent = "🔴 Listening to voice input...";
        micBtn.textContent = "Stop Engine";
        micBtn.style.background = "#ff4757";
    };

    recognition.onresult = (event) => {
        const textTranscript = event.results[0][0].transcript;
        noteContent.value += (noteContent.value ? " " : "") + textTranscript;
    };

    recognition.onend = () => {
        recordingStatus.textContent = "Speech captured successfully!";
        micBtn.textContent = "🎤 Start Recording";
        micBtn.style.background = "#00b4d8";
    };

    micBtn.addEventListener('click', () => {
        if (micBtn.textContent.includes("Start")) {
            recognition.start();
        } else {
            recognition.stop();
        }
    });
} else {
    micBtn.style.display = "none";
    recordingStatus.textContent = "Speech Engine unsupported in browser.";
}

// --- Data Operations Layer (CRUD Engine) ---
function renderNotes(searchQuery = "") {
    notesGrid.innerHTML = "";
    
    let processedNotes = notes;

    // Filter rules
    if (activeTagFilter) {
        processedNotes = processedNotes.filter(n => n.tags.toLowerCase().includes(activeTagFilter.toLowerCase()));
    }

    if (searchQuery) {
        processedNotes = processedNotes.filter(n => 
            n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.tags.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (processedNotes.length === 0) {
        notesGrid.innerHTML = `<p style="padding:15px; text-align:center; color:var(--text-muted)">No active notes found.</p>`;
        return;
    }

    processedNotes.forEach((note) => {
        // Find absolute matching index within master source state
        const originalIndex = notes.findIndex(n => n.id === note.id);
        
        const row = document.createElement('div');
        row.classList.add('todo-row');
        row.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="checkbox-custom" title="Complete & Archive Note" onclick="deleteNote(${originalIndex})">
                <div>
                    <p style="font-weight:500; white-space: pre-wrap;">${note.content}</p>
                    <span class="note-tag-badge">${note.tags ? '#' + note.tags.split(',').join(' #') : '#General'}</span>
                </div>
            </div>
            <div class="note-actions-btns">
                <button class="row-btn" title="Modify Note" onclick="editNote(${originalIndex})">✏️</button>
            </div>
        `;
        notesGrid.appendChild(row);
    });
}

function saveAndSync() {
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes(searchInput.value);
}

function handleNoteSubmission() {
    const contentText = noteContent.value.trim();
    const tagsText = noteTags.value.trim();

    if (!contentText) return alert("Note text content cannot be blank!");

    if (editIndex !== null) {
        // Update operational step
        notes[editIndex].content = contentText;
        notes[editIndex].tags = tagsText;
        editIndex = null;
        addNoteBtn.textContent = "Save Note";
        inputFormTitle.textContent = "Create New Note";
    } else {
        // Creation standard execution 
        notes.unshift({
            id: Date.now(),
            content: contentText,
            tags: tagsText,
            timestamp: new Date().toISOString()
        });
    }

    noteContent.value = "";
    noteTags.value = "";
    saveAndSync();
}

window.deleteNote = function(index) {
    // Fades or flashes complete prior to delete array splicing
    notes.splice(index, 1);
    // Reset inputs if you delete a note currently being edited
    if (editIndex === index) {
        editIndex = null;
        addNoteBtn.textContent = "Save Note";
        inputFormTitle.textContent = "Create New Note";
        noteContent.value = "";
        noteTags.value = "";
    }
    saveAndSync();
};

window.editNote = function(index) {
    const targetNote = notes[index];
    noteContent.value = targetNote.content;
    noteTags.value = targetNote.tags;
    
    editIndex = index;
    addNoteBtn.textContent = "Update Note";
    inputFormTitle.textContent = "Editing Selected Note";
    noteContent.focus();
};

window.filterByTag = function(tagName) {
    if (activeTagFilter === tagName) {
        activeTagFilter = "";
        filterLabel.textContent = "Showing: All";
    } else {
        activeTagFilter = tagName;
        filterLabel.textContent = `Showing Tag: ${tagName}`;
    }
    renderNotes();
};

// --- Calendar State Engine ---
const currentMonthYearText = document.getElementById('currentMonthYear');
const calendarDaysGrid = document.getElementById('calendarDaysGrid');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const clearDateFilterBtn = document.getElementById('clearDateFilterBtn');
const todayBtn = document.getElementById('todayBtn');

let calendarDate = new Date(); // Tracks the currently browsed month
let selectedDateStr = "";      // Stores the filter string 'YYYY-MM-DD'

const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

function renderCalendar() {
    calendarDaysGrid.innerHTML = "";
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    currentMonthYearText.textContent = `${months[month]} ${year}`;

    // First day of the targeted month execution step
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Shift index calculation to match Monday-first row alignment layout
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Inject padding spacing cells for empty spaces
    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('cal-day-cell', 'empty');
        calendarDaysGrid.appendChild(emptyCell);
    }

    // Generate active clickable calendar dates
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('cal-day-cell');
        dayCell.textContent = day;

        // Build absolute date identity profile token
        const padMonth = String(month + 1).padStart(2, '0');
        const padDay = String(day).padStart(2, '0');
        const cellDateStr = `${year}-${padMonth}-${padDay}`;

        if (cellDateStr === selectedDateStr) {
            dayCell.classList.add('selected-date');
        }

        dayCell.addEventListener('click', () => {
            if (selectedDateStr === cellDateStr) {
                selectedDateStr = ""; // Toggle selection off
                filterLabel.textContent = "Showing: All";
            } else {
                selectedDateStr = cellDateStr;
                const formattedDisplay = new Date(cellDateStr).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
                filterLabel.textContent = `Showing Date: ${formattedDisplay}`;
            }
            renderCalendar();
            
            // Re-bind parent note grid execution filtering
            applyMasterFilters();
        });

        calendarDaysGrid.appendChild(dayCell);
    }
}

// Intercept original script rendering routines to append calendar compliance adjustments
function applyMasterFilters() {
    let searchQuery = searchInput.value;
    notesGrid.innerHTML = "";
    
    let processedNotes = notes;

    // Filter by tag if selected
    if (activeTagFilter) {
        processedNotes = processedNotes.filter(n => n.tags.toLowerCase().includes(activeTagFilter.toLowerCase()));
    }

    // Filter by calendar date if selected
    if (selectedDateStr) {
        processedNotes = processedNotes.filter(n => {
            if (!n.timestamp) return false;
            return n.timestamp.startsWith(selectedDateStr);
        });
    }

    // Filter by textual input queries
    if (searchQuery) {
        processedNotes = processedNotes.filter(n => 
            n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.tags.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (processedNotes.length === 0) {
        notesGrid.innerHTML = `<p style="padding:15px; text-align:center; color:var(--text-muted)">No notes match this view layout.</p>`;
        return;
    }

    // Redraw view elements bound onto state list arrays
    processedNotes.forEach((note) => {
        const originalIndex = notes.findIndex(n => n.id === note.id);
        const row = document.createElement('div');
        row.classList.add('todo-row');
        row.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="checkbox-custom" onclick="deleteNote(${originalIndex})">
                <div>
                    <p style="font-weight:500; white-space: pre-wrap;">${note.content}</p>
                    <span class="note-tag-badge">${note.tags ? '#' + note.tags.split(',').join(' #') : '#General'}</span>
                </div>
            </div>
            <div class="note-actions-btns">
                <button class="row-btn" onclick="editNote(${originalIndex})">✏️</button>
            </div>
        `;
        notesGrid.appendChild(row);
    });
}

// Override root rendering function with composite pipeline hook architecture
window.renderNotes = applyMasterFilters;

// --- Calendar Navigation Actions ---
prevMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

todayBtn.addEventListener('click', () => {
    calendarDate = new Date();
    renderCalendar();
});

clearDateFilterBtn.addEventListener('click', () => {
    selectedDateStr = "";
    filterLabel.textContent = "Showing: All";
    renderCalendar();
    applyMasterFilters();
});

// Initialize component setup sequences
renderCalendar();

// --- View State Listeners and Initializer ---
addNoteBtn.addEventListener('click', handleNoteSubmission);
searchInput.addEventListener('input', (e) => renderNotes(e.target.value));

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Updates button text display strings dynamically
    const isLight = document.body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
    
    // Core adjustment: Save theme selection to browser storage memory
    localStorage.setItem('dashboard-theme', isLight ? 'light-mode' : 'dark-mode');
});

// Also make sure to check state right when loading the home page:
const activeThemeState = localStorage.getItem('dashboard-theme') || 'dark-mode';
if (activeThemeState === 'light-mode') {
    document.body.classList.add('light-mode');
    if(themeToggle) themeToggle.textContent = "🌙 Dark Mode";
}
// Launch instance tracking setup
renderNotes();