// ========================================
// 1. KONFIGURASI SUPABASE
// ========================================

const SUPABASE_URL =
    'https://iywjshpafijejskmzmlm.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_COC1AvWTh_wid0XOvf2v0Q_SZtcZdGp';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ========================================
// 2. ELEMEN CHAT
// ========================================

const chatButton = document.getElementById('ashame-chat-button');
const chatWindow = document.getElementById('ashame-chat-window');
const chatClose = document.getElementById('ashame-chat-close');
const chatMessages = document.getElementById('ashame-chat-messages');
const chatForm = document.getElementById('ashame-chat-form');
const usernameInput = document.getElementById('ashame-chat-username');
const messageInput = document.getElementById('ashame-chat-input');
const sendButton = document.getElementById('ashame-chat-send');
const chatStatus = document.getElementById('ashame-chat-status');

const replyPreview = document.getElementById('ashame-chat-reply-preview');
const replyUsername = document.getElementById('ashame-chat-reply-username');
const replyText = document.getElementById('ashame-chat-reply-text');
const replyCancel = document.getElementById('ashame-chat-reply-cancel');


// ========================================
// 3. STATUS REPLY
// ========================================

// Menyimpan pesan yang sedang dipilih untuk dibalas.
let selectedReply = null;

// Menyimpan pesan yang sudah ditampilkan agar tidak
// terjadi duplikasi ketika menerima event Realtime.
const renderedMessageIds = new Set();

const messageCache = new Map();


// ========================================
// 4. BUKA DAN TUTUP CHAT
// ========================================

chatButton.addEventListener('click', () => {
    const isOpen = chatWindow.classList.toggle('is-open');

    chatButton.setAttribute('aria-expanded', String(isOpen));
    chatWindow.setAttribute('aria-hidden', String(!isOpen));
});

chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('is-open');

    chatButton.setAttribute('aria-expanded', 'false');
    chatWindow.setAttribute('aria-hidden', 'true');
});


// ========================================
// 5. MEMILIH DAN MEMBATALKAN REPLY
// ========================================

function selectReply(message) {
    selectedReply = message;

    replyUsername.textContent = message.username;

    // Batasi teks kutipan agar panel tidak terlalu panjang.
    replyText.textContent = message.message.length > 120
        ? message.message.slice(0, 120) + '…'
        : message.message;

    replyPreview.hidden = false;

    messageInput.focus();
}

function cancelReply() {
    selectedReply = null;

    replyPreview.hidden = true;
    replyUsername.textContent = '';
    replyText.textContent = '';
}

replyCancel.addEventListener('click', cancelReply);


// ========================================
// 6. MEMBUAT KUTIPAN DI GELEMBUNG PESAN
// ========================================

function createReplyQuote(message) {
    if (!message.reply_to_id) {
        return null;
    }

    const quote = document.createElement('div');
    quote.className = 'ashame-chat-reply-quote';

    const quoteUsername = document.createElement('div');
    quoteUsername.className = 'ashame-chat-reply-quote-username';

    const quoteMessage = document.createElement('div');
    quoteMessage.className = 'ashame-chat-reply-quote-text';

    const originalMessage = messageCache.get(
        String(message.reply_to_id)
    );

    if (originalMessage) {
        quoteUsername.textContent = originalMessage.username;
        quoteMessage.textContent = originalMessage.message;
    } else {
        quoteUsername.textContent = 'Pesan sebelumnya';
        quoteMessage.textContent = 'Memuat kutipan...';
    }

    // TAMBAHKAN DUA ELEMEN KE DALAM PANEL
    quote.append(quoteUsername, quoteMessage);

    quote.tabIndex = 0;
    quote.setAttribute('role', 'button');
    quote.setAttribute(
        'aria-label',
        'Lihat pesan yang dibalas'
    );

    function jumpToOriginal() {
        const original = document.querySelector(
            `[data-message-id="${String(message.reply_to_id)}"]`
        );

        if (!original) {
            chatStatus.textContent =
                'Pesan asli tidak tersedia di daftar chat.';
            return;
        }

        original.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        original.classList.add(
            'ashame-chat-message-highlight'
        );

        setTimeout(() => {
            original.classList.remove(
                'ashame-chat-message-highlight'
            );
        }, 1200);
    }

    quote.addEventListener('click', jumpToOriginal);

    quote.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            jumpToOriginal();
        }
    });

    return quote;
}

async function updateReplyQuote(messageElement, message) {
    if (!message.reply_to_id) return;

    const quote = messageElement.querySelector('.ashame-chat-reply-quote');

    if (!quote) return;

    const quoteUsername = quote.querySelector('.ashame-chat-reply-quote-username');
    const quoteMessage = quote.querySelector('.ashame-chat-reply-quote-text');

    if (!quoteUsername || !quoteMessage) {
        console.error('Elemen kutipan tidak ditemukan:', {
            quote,
            quoteUsername,
            quoteMessage
        });

        return;
    }

    let originalMessage = messageCache.get(String(message.reply_to_id));

    if (!originalMessage) {
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .select('id, username, message, created_at')
            .eq('id', message.reply_to_id)
            .maybeSingle();

        console.log('ID pesan yang dibalas:', message.reply_to_id);
        console.log('Hasil pencarian pesan asli:', { data, error });

        if (error) {
            console.error('Gagal memuat pesan yang dibalas:', error);

            quoteUsername.textContent = 'Pesan sebelumnya';
            quoteMessage.textContent = 'Kutipan tidak dapat dimuat.';

            return;
        }

        originalMessage = data;

        if (originalMessage) {
            messageCache.set(String(originalMessage.id), originalMessage);
        }
    }

    if (originalMessage) {
        quoteUsername.textContent = originalMessage.username;
        quoteMessage.textContent = originalMessage.message;
    } else {
        quoteUsername.textContent = 'Pesan sebelumnya';
        quoteMessage.textContent = 'Pesan asli tidak ditemukan.';
    }
}


// ========================================
// 7. MENAMPILKAN PESAN
// ========================================

function renderMessage(message) {
    const messageId = String(message.id);
    messageCache.set(messageId, message);

    // Cegah pesan yang sama ditampilkan dua kali.
    if (renderedMessageIds.has(messageId)) {
        return null;
    }

    renderedMessageIds.add(messageId);

    const messageElement = document.createElement('div');

    messageElement.className = 'ashame-chat-message';
    messageElement.dataset.messageId = messageId;

    // Nama pengirim.
    const usernameElement = document.createElement('div');

    usernameElement.className = 'ashame-chat-username';
    usernameElement.textContent = message.username;

    // Kutipan jika pesan merupakan balasan.
    const replyQuote = createReplyQuote(message);

    // Isi pesan.
    const textElement = document.createElement('div');

    textElement.className = 'ashame-chat-text';
    textElement.textContent = message.message;

    // Waktu pesan.
    const timeElement = document.createElement('div');

    timeElement.className = 'ashame-chat-time';

    timeElement.textContent = new Date(
        message.created_at
    ).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Tombol Reply.
    const replyButton = document.createElement('button');

    replyButton.type = 'button';
    replyButton.className = 'ashame-chat-reply-button';
    replyButton.textContent = '↩ Balas';

    replyButton.setAttribute(
        'aria-label',
        `Balas pesan dari ${message.username}`
    );

    replyButton.addEventListener('click', () => {
        selectReply(message);
    });

    // Susun elemen pesan.
    if (replyQuote) {
        messageElement.appendChild(replyQuote);
    }

    messageElement.append(
        usernameElement,
        textElement,
        timeElement,
        replyButton
    );

    if (message.reply_to_id && replyQuote) {
        updateReplyQuote(messageElement, message);
    }

    return messageElement;
}


// ========================================
// 8. MEMUAT RIWAYAT PESAN
// ========================================

async function loadMessages() {
    chatStatus.textContent = 'Memuat pesan...';

    const { data, error } = await supabaseClient
        .from('chat_messages')
        .select(`
            id,
            username,
            message,
            created_at,
            reply_to_id
        `)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Gagal memuat pesan:', error);

        chatStatus.textContent = 'Gagal memuat pesan.';

        return;
    }

    chatMessages.replaceChildren();
    renderedMessageIds.clear();
    messageCache.clear();

    // Tampilkan pesan dari yang paling lama.
    data.reverse().forEach(message => {
        const element = renderMessage(message);

        if (element) {
            chatMessages.appendChild(element);
        }
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatStatus.textContent = 'Terhubung ke chat Ashame.';
}


// ========================================
// 9. MENGIRIM PESAN ATAU REPLY
// ========================================

chatForm.addEventListener('submit', async event => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();

    if (!username || !message) {
        chatStatus.textContent = 'Nama dan pesan wajib diisi.';
        return;
    }

    if (username.length > 30 || message.length > 500) {
        chatStatus.textContent = 'Nama atau pesan terlalu panjang.';
        return;
    }

    sendButton.disabled = true;

    chatStatus.textContent = 'Mengirim pesan...';

    const newMessage = {
        username,
        message,
        reply_to_id: selectedReply
            ? selectedReply.id
            : null
    };

    const { error } = await supabaseClient
        .from('chat_messages')
        .insert([newMessage]);

    sendButton.disabled = false;

    if (error) {
        console.error('Gagal mengirim pesan:', error);

        chatStatus.textContent = 'Pesan gagal dikirim.';

        return;
    }

    messageInput.value = '';

    cancelReply();

    chatStatus.textContent = 'Pesan berhasil dikirim.';

    messageInput.focus();
});


// ========================================
// 10. REALTIME
// ========================================

supabaseClient
    .channel('ashame-public-chat')
    .on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
        },
        payload => {
            const element = renderMessage(payload.new);

            if (element) {
                chatMessages.appendChild(element);

                chatMessages.scrollTop =
                    chatMessages.scrollHeight;
            }
        }
    )
    .on(
        'postgres_changes',
        {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_messages'
        },
        payload => {
            const messageId = String(payload.old.id);

            const element = document.querySelector(
                `[data-message-id="${messageId}"]`
            );

            if (element) {
                element.remove();
            }

            renderedMessageIds.delete(messageId);
        }
    )
    .subscribe(status => {
        console.log('Status realtime:', status);
    });


// ========================================
// 11. JALANKAN CHAT
// ========================================

loadMessages();