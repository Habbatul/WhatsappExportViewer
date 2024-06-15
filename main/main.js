 //styling input file ganti label text
 document.getElementById('fileInput').addEventListener('change', function(event) {
    const fileLabel = document.getElementById('fileLabel');
    if (event.target.files.length > 0) {
        fileLabel.textContent = 'File has uploaded';
    } else {
        fileLabel.textContent = 'Upload File';
    }
});


//=================== logic file input ============================================
let allMessages = [];
let filteredMessages = []; 
let displayedMessages = []; 
const chunkSize = 60;

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
        chatContainer.style.height = `calc(100vh - 3.5rem)`;
    }
});
document.getElementById('toggleButtonOpen').addEventListener('click', function() {
    const controls = document.getElementById('controls');
    const toggleOpen = document.getElementById('toggleButtonOpen');
    const chatContainer = document.getElementById('chatContainer');
    if (controls.classList.contains('hiddenControl')) {
        controls.classList.remove('hiddenControl');
        toggleOpen.classList.add('hiddenControl');
        chatContainer.style.height = `calc(100vh - 180px)`;
    }
});

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

    filteredMessages = allMessages.filter(msg => {
        const matchesDate = !filterDate || msg.date == filterDate;
        const matchesSearch = !searchTerm || msg.message.toLowerCase().includes(searchTerm);
        return matchesDate && matchesSearch;
    });

    displayedMessages = []; 
    displayMessages(filteredMessages.slice(-chunkSize).reverse()); 
}


//=========== TTS untuk SpeechSynthesisUtterance (API browser, support dibeberapa browser) ===============
function speakMessage(message) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'id-ID';
    utterance.rate = 1.1;
    speechSynthesis.speak(utterance);
}


//========= untuk dom manipulation (pesan yang ditampilkan) =============
const userColors = {};
let lastUser = null;
let lastColor = null;

function displayMessages(messages) {
    const chatContainer = document.getElementById('chatContainer');
    const currentDateElem = document.getElementById('currentDate');
    
    if (displayedMessages.length === 0) {
        chatContainer.innerHTML = '';
        chatContainer.appendChild(currentDateElem);
    }

    let currentDate = displayedMessages.length > 0 ? displayedMessages[0].date : '';
    const existingDateGroups = new Set(Array.from(chatContainer.getElementsByClassName('date-group')).map(group => group.textContent));

    const fragment = document.createDocumentFragment();

    messages.forEach(msg => {
        //kalo tanggal udah ada gausah dibuat lagi
        if (!existingDateGroups.has(msg.date) && msg.date !== currentDate) {
            currentDate = msg.date;
            existingDateGroups.add(currentDate);
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            const dateText = document.createElement('span');
            dateText.textContent = currentDate;
            
            const topSymbol = document.createElement('span');
            topSymbol.textContent = ' ⇧';
            topSymbol.style.fontSize = '1.26rem';
    
            dateGroup.appendChild(dateText);
            dateGroup.appendChild(topSymbol);
            fragment.prepend(dateGroup);
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.setAttribute('data-date', msg.date);
        
        messageElement.innerHTML = `<div class="meta"><strong>${msg.user}</strong></div><div class="user-chat">${msg.message}</div><div class="time">${msg.time}</div>`;
        messageElement.style.backgroundColor = getUserColor(msg.user);

        //panggil speech untuk massage
        messageElement.addEventListener('click', () => {
            speakMessage(msg.message);
        });
        
        fragment.prepend(messageElement);
    });

    chatContainer.prepend(fragment);

    //agar scroll dari bawah
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    //perbarui isi variable displayedMessages setelah menambahkan pesan baru
    displayedMessages = messages.concat(displayedMessages);
    
    //sticky date kudu tetep diatas
    chatContainer.prepend(currentDateElem);
}

//generate warna bubblechat color ijo putih (untuk saat ini hanya 2 warna)
function getUserColor(username) {
    if (!userColors[username]) {
        userColors[username] = (lastColor === '#dcf8c6') ? '#ffffff' : '#dcf8c6';
    }
    lastUser = username;
    lastColor = userColors[username];
    return userColors[username];
}

//========= logic lazy loadnya =============
function loadMoreMessages() {
    const chatContainer = document.getElementById('chatContainer');
    const scrollTop = chatContainer.scrollTop;
    if (scrollTop <= 800) {
        const start = Math.max(filteredMessages.length - displayedMessages.length - chunkSize, 0);
        const remainingMessages = filteredMessages.slice(start, filteredMessages.length - displayedMessages.length);

        if (remainingMessages.length > 0) {
            const currentHeight = chatContainer.scrollHeight;
            displayMessages(remainingMessages.reverse());
            chatContainer.scrollTop = chatContainer.scrollHeight - currentHeight;
        }
    }
}

document.getElementById('chatContainer').addEventListener('scroll', loadMoreMessages);

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
    //sticky date kudu tetep diatas
    chatContainer.prepend(currentDateElem);
}