let db = null;

// Initialize SQL engine
async function initSql() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        db = new SQL.Database();
        console.log("Database initialized successfully!");
    } catch (err) {
        showPopup("Initialization Error", "Failed to load SQL engine: " + err.message, true);
    }
}
initSql();

document.addEventListener('DOMContentLoaded', loadHistory);

// Run Query Button Event
document.getElementById('run-btn').addEventListener('click', () => {
    const query = document.getElementById('sql-input').value.trim();
    const outputBox = document.getElementById('output-box');

    if (!query) {
        showPopup("Warning", "Please enter an SQL query before running.", true);
        return;
    }

    if (!db) {
        showPopup("Please Wait", "Database is still initializing. Try again in a moment.", true);
        return;
    }

    try {
        // db.exec() saari A to Z queries handle karta hai (CREATE, INSERT, SELECT, DROP, etc.)
        const results = db.exec(query);
        
        // Save to History (LocalStorage)
        saveToHistory(query);

        if (results.length === 0) {
            outputBox.innerHTML = `<p style="color: #4CAF50; font-weight: bold;">✔ Query executed successfully! (No tabular data returned, e.g., CREATE/INSERT/UPDATE)</p>`;
            return;
        }

        // Render Table Output for SELECT queries
        let htmlOutput = '';
        results.forEach(res => {
            htmlOutput += '<table><thead><tr>';
            res.columns.forEach(col => {
                htmlOutput += `<th>${col}</th>`;
            });
            htmlOutput += '</tr></thead><tbody>';

            res.values.forEach(row => {
                htmlOutput += '<tr>';
                row.forEach(val => {
                    htmlOutput += `<td>${val !== null ? val : 'NULL'}</td>`;
                });
                htmlOutput += '</tr>';
            });
            htmlOutput += '</tbody></table><br>';
        });

        outputBox.innerHTML = htmlOutput;

    } catch (err) {
        // Agar query me koi bhi error hoga toh yeh popup show karega
        showPopup("SQL Syntax / Execution Error", err.message, true);
        outputBox.innerHTML = `<p style="color: #ff5252;"><strong>Error occurred. Check popup for details.</strong></p>`;
    }
});

// Popup Modal Functions
function showPopup(title, message, isError = false) {
    const modal = document.getElementById('popup-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    modalTitle.textContent = title;
    modalTitle.style.color = isError ? '#ff5252' : '#4CAF50';
    modalMessage.textContent = message;

    modal.style.display = 'flex';
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('popup-modal').style.display = 'none';
});

window.onclick = (event) => {
    const modal = document.getElementById('popup-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Clear Editor Button
document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('sql-input').value = '';
});

// History Functions
function saveToHistory(query) {
    let history = JSON.parse(localStorage.getItem('sql_history')) || [];
    history = history.filter(item => item !== query);
    history.unshift(query);
    
    if (history.length > 50) history.pop();

    localStorage.setItem('sql_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('sql_history')) || [];
    
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => {
            document.getElementById('sql-input').value = item;
        };
        historyList.appendChild(li);
    });
}

document.getElementById('clear-history').addEventListener('click', () => {
    localStorage.removeItem('sql_history');
    loadHistory();
});
