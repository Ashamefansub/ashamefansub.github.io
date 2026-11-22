/**
 * 🌸 Ashame Fansub — Episode Tracker
 * Menyimpan dan menandai episode dorama yang sudah pernah diunduh/diklik di browser (localStorage)
 */
(function () {
    'use strict';

    function initEpisodeTracker() {
        const buttonSeriesContainer = document.querySelector('.button-series');
        if (!buttonSeriesContainer) return;

        // Ambil identifier unik dorama dari pathname URL (slug)
        const path = window.location.pathname;
        const slugMatch = path.match(/([^\/\?#]+)\.html/);
        const slug = slugMatch ? slugMatch[1] : 'series-tracker';
        const storageKey = 'ashame_tracker_' + slug;

        // Ambil data tracker dari localStorage
        let trackedData = { episodes: [], last: null };
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed.episodes)) trackedData.episodes = parsed.episodes;
                if (parsed.last) trackedData.last = parsed.last;
            }
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }

        const episodeButtons = buttonSeriesContainer.querySelectorAll('.btn-download-series');
        if (!episodeButtons.length) return;

        // Inisialisasi Counter & Status Episode di samping judul "Download"
        setupDownloadSectionCounter(buttonSeriesContainer, episodeButtons);

        // Buat kontainer status bar jika belum ada
        let statusBar = document.querySelector('.tracker-status-bar');
        if (!statusBar) {
            statusBar = document.createElement('div');
            statusBar.className = 'tracker-status-bar';
            buttonSeriesContainer.parentNode.insertBefore(statusBar, buttonSeriesContainer);
        }

        function updateUI() {
            // Update tampilan setiap tombol episode
            episodeButtons.forEach(btn => {
                const epText = btn.textContent.trim();
                const parentLink = btn.closest('a');
                const isFinal = (parentLink && parentLink.getAttribute('title') && parentLink.getAttribute('title').toLowerCase().includes('final')) ||
                    (btn.getAttribute('title') && btn.getAttribute('title').toLowerCase().includes('final'));
                const baseLabel = isFinal ? `Episode ${epText} Final` : `Episode ${epText}`;

                if (trackedData.episodes.includes(epText)) {
                    btn.classList.add('is-downloaded');
                    const fullTitle = `${baseLabel} (Sudah diunduh/diklik)`;
                    btn.setAttribute('title', fullTitle);
                    if (parentLink) parentLink.setAttribute('title', fullTitle);
                } else {
                    btn.classList.remove('is-downloaded');
                    btn.setAttribute('title', baseLabel);
                    if (parentLink) parentLink.setAttribute('title', baseLabel);
                }
            });

            // Update info status bar di atas tombol
            if (trackedData.last) {
                statusBar.style.display = 'flex';
                statusBar.innerHTML = `
                    <span class="tracker-badge">Terakhir diunduh: Ep. ${escapeHtml(trackedData.last)}</span>
                    <button type="button" class="tracker-reset-btn" id="resetTrackerBtn" title="Reset tanda unduhan dorama ini">Reset tanda</button>
                `;

                const resetBtn = statusBar.querySelector('#resetTrackerBtn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        if (confirm('Reset riwayat tanda unduhan untuk dorama ini?')) {
                            trackedData = { episodes: [], last: null };
                            try {
                                localStorage.removeItem(storageKey);
                            } catch (err) { }
                            updateUI();
                        }
                    });
                }
            } else {
                statusBar.style.display = 'none';
                statusBar.innerHTML = '';
            }
        }

        // Pasang listener pada setiap link atau tombol episode
        episodeButtons.forEach(btn => {
            const link = btn.closest('a');
            const targetEl = link || btn;

            targetEl.addEventListener('click', function () {
                const epText = btn.textContent.trim();
                if (!trackedData.episodes.includes(epText)) {
                    trackedData.episodes.push(epText);
                }
                trackedData.last = epText;

                try {
                    localStorage.setItem(storageKey, JSON.stringify(trackedData));
                } catch (e) { }

                updateUI();
            });
        });

        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, m => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
            }[m]));
        }

        // Render pertama kali
        updateUI();
    }

    // Fungsi otomatis memasang counter & status episode di samping judul "Download"
    function setupDownloadSectionCounter(container, buttons) {
        // Cari elemen h3.section-label terdekat
        const sectionLabel = container.parentNode?.querySelector('.section-label') ||
            document.querySelector('.media-section-series .section-label');
        if (!sectionLabel) return;

        // Hindari duplikasi jika sudah pernah dipasang
        if (sectionLabel.querySelector('.ep-counter-badge')) return;

        const totalEps = buttons.length;
        // Cek apakah episode terakhir memiliki tanda final
        const lastBtn = buttons[buttons.length - 1];
        const parentLink = lastBtn.closest('a');
        const isFinal = (parentLink && parentLink.getAttribute('title') && parentLink.getAttribute('title').toLowerCase().includes('final')) ||
            (lastBtn.getAttribute('title') && lastBtn.getAttribute('title').toLowerCase().includes('final'));

        const badge = document.createElement('span');
        badge.className = `ep-counter-badge ${isFinal ? 'is-tamat' : 'is-ongoing'}`;
        badge.innerHTML = isFinal
            ? `Tamat • ${totalEps} Episode`
            : `<span class="ep-dot ongoing-dot"></span> On Going • Ep. ${totalEps}`;

        sectionLabel.appendChild(badge);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEpisodeTracker);
    } else {
        initEpisodeTracker();
    }
})();

