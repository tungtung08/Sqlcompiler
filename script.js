let db = null;

// Initialize SQL engine & load saved database if exists
async function initSql() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        const savedDb = localStorage.getItem('sql_db');
        if (savedDb) {
            const uInt8Array = Uint8Array.from(JSON.parse(savedDb));
            db = new SQL.Database(uInt8Array);
        } else {
            db = new SQL.Database();
        }
    } catch (err) {
        showPopup("Initialization Error", "Failed to load SQL engine: " + err.message, true);
    }
}
initSql();

// Run Query Button Event
document.getElementById('run-btn').addEventListener('click', () => {
    const queryInput = document.getElementById('sql-input');
    const query = queryInput.value.trim();
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
        // Run SQL query
        const results = db.exec(query);
        
        // Save database state to localStorage so tables/data aren't lost
        const data = db.export();
        localStorage.setItem('sql_db', JSON.stringify(Array.from(data)));

        // Query run hote hi textarea instant clear ho jayega
        queryInput.value = '';

        if (results.length === 0) {
            // Detailed success popup for DDL/DML queries (CREATE, INSERT, UPDATE, etc.)
            showPopup("Query Success", "✔ Query executed successfully! Database updated.", false);
            outputBox.innerHTML = `<p style="color: #4CAF50; font-weight: bold;">✔ Query executed successfully!</p>`;
            return;
        }

        // Calculate total rows returned for detailed popup message
        let totalRows = 0;
        results.forEach(res => {
            totalRows += res.values.length;
        });

        // Detailed success popup for SELECT queries
        showPopup("Query Success", `✔ Query executed successfully! Total ${totalRows} row(s) returned.`, false);

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
        // Error aane par bhi query turant erase ho jayegi aur detailed error popup aayega
        queryInput.value = '';
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

// Clear Editor Button manually
document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('sql-input').value = '';
});
