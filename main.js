//=========================== mencegah scroll untuk reload ==========================
const chatContainer = document.getElementById('chatContainer');

chatContainer.addEventListener('touchstart', function(e) {
    const chatContainer = e.currentTarget;
    if (chatContainer.scrollTop === 0) {
        chatContainer.scrollTop += 1;
    } else if (chatContainer.scrollHeight === chatContainer.scrollTop + chatContainer.clientHeight) {
        chatContainer.scrollTop -= 1;
    }
});

chatContainer.addEventListener('touchmove', function(e) {
    const chatContainer = e.currentTarget;
    if ((chatContainer.scrollTop === 0 && e.touches[0].clientY > e.touches[0].startY) ||
        (chatContainer.scrollHeight === chatContainer.scrollTop + chatContainer.clientHeight && e.touches[0].clientY < e.touches[0].startY)) {
        e.preventDefault();
    }
}, {passive: false});
//=================== logic file input ============================================

let allMessages = [];

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            allMessages = parseMessages(content);
            applyFilters();
        };
        reader.readAsText(file);
    }
});

document.getElementById('toggleButtonClosed').addEventListener('click', function() {
    const controls = document.getElementById('controls');
    const toggleOpen = document.getElementById('toggleButtonOpen');
    const chatContainer = document.getElementById('chatContainer');
    if (!controls.classList.contains('hiddenControl')) {
        controls.classList.add('hiddenControl');
        toggleOpen.classList.remove('hiddenControl');
        chatContainer.style.height = `calc(100vh - 3rem)`;
    }
});
document.getElementById('toggleButtonOpen').addEventListener('click', function() {
    const controls = document.getElementById('controls');
    const toggleOpen = document.getElementById('toggleButtonOpen');
    const chatContainer = document.getElementById('chatContainer');
    if (controls.classList.contains('hiddenControl')) {
        controls.classList.remove('hiddenControl');
        toggleOpen.classList.add('hiddenControl');
        chatContainer.style.height = `calc(100vh - 170px)`;
    }
});


//=================filter dengan change sangat lambat ketika input============
// document.getElementById('dateFilter').addEventListener('change', function() {
//     applyFilters();
// });

// document.getElementById('searchInput').addEventListener('input', function() {
//     applyFilters();
// });


//=========filter dengan button===========
document.getElementById('submitButton').addEventListener('click', function(event) {
    event.preventDefault();
    applyFilters();
});

document.getElementById('chatContainer').addEventListener('scroll', function() {
    updateStickyDate();
});


//========= parsing txt dan urutkan dari tanggal terbaru ke yang lama =============

function parseMessages(content) {
    const lines = content.split('\n');
    const messages = [];

    for (const line of lines) {
        const match = line.match(/^(\d{2}\/\d{2}\/\d{2}) (\d{2}\.\d{2}) - ([^:]+): (.+)$/);
        if (match) {
            messages.push({
                date: match[1],
                time: match[2],
                user: match[3],
                message: match[4]
            });
        }

    }

    //sorting pesan dari yang tua itu diatas dan terbawah adalah terbaru
    messages.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-') + 'T' + a.time.replace('.', ':'));
        const dateB = new Date(b.date.split('/').reverse().join('-') + 'T' + b.time.replace('.', ':'));
        return dateA - dateB;
    });

    return messages;
}

//========= untuk menerapkan filter =============

function applyFilters() {
    const filterDate = document.getElementById('dateFilter').value.split('-').reverse().map((part, index) => index === 2 ? part.slice(2) : part).join('/');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    const filteredMessages = allMessages.filter(msg => {
        const matchesDate = !filterDate || msg.date == filterDate;
        const matchesSearch = !searchTerm || msg.message.toLowerCase().includes(searchTerm);
        return matchesDate && matchesSearch;
    });

    displayMessages(filteredMessages);
}

//========= nampilin chat saat ini, ada beberapa printilan untuk pembeda user =============
const userColors = {};
let lastUser = null;
let lastColor = null;

function displayMessages(messages) {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = '<div id="currentDate"></div>';

    let currentDate = '';
    messages.forEach(msg => {
        if (msg.date !== currentDate) {
            currentDate = msg.date;
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            dateGroup.textContent = currentDate;
            chatContainer.appendChild(dateGroup);
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.setAttribute('data-date', msg.date);
        messageElement.innerHTML = `<div class="meta"><strong>${msg.user}</strong></div><div class="user-chat">${msg.message}</div><div class="time">${msg.time}</div>`;
        messageElement.style.backgroundColor = getUserColor(msg.user); // Menetapkan warna balon pesan berdasarkan pengguna
        chatContainer.appendChild(messageElement);
    });

    //scroll ke bottom setelah rendering (jadi nanti scroll nya keatas)
    chatContainer.scrollTop = chatContainer.scrollHeight;
    updateStickyDate();
}

function getUserColor(username) {
    if (!userColors[username]) {
        userColors[username] = (lastColor === '#dcf8c6') ? '#ffffff' : '#dcf8c6';
    }
    lastUser = username;
    lastColor = userColors[username];
    return userColors[username];
}


//========================= Update keterangan tanggal saat ini =============

function updateStickyDate() {
    const chatContainer = document.getElementById('chatContainer');
    const messages = Array.from(chatContainer.getElementsByClassName('message'));
    const currentDateElem = document.getElementById('currentDate');

    for (const message of messages) {
        const rect = message.getBoundingClientRect();
        if (rect.top >= chatContainer.getBoundingClientRect().top) {
            const date = message.getAttribute('data-date');
            currentDateElem.textContent = date;
            break;
        }
    }
}