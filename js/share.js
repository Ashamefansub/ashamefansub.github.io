/**
 * 🌸 Ashame Fansub — Share Button & Toast
 * Memungkinkan pengunjung membagikan halaman via native share (HP) atau salin tautan (PC)
 */
(function () {
    'use strict';

    function initShareFeature() {
        const infoBtn = document.querySelector('.button-info');
        if (!infoBtn) return;

        const infoLink = infoBtn.closest('a');
        if (!infoLink) return;

        // Cek jika tombol share sudah ada
        if (document.querySelector('.button-share')) return;

        // Buat container wrapper jika belum ada agar tombol sejajar rapi
        let actionRow = document.querySelector('.detail-actions-row');
        if (!actionRow) {
            actionRow = document.createElement('div');
            actionRow.className = 'detail-actions-row';
            infoLink.parentNode.insertBefore(actionRow, infoLink);
            actionRow.appendChild(infoLink);
        }

        // Buat tombol Bagikan (Share)
        const shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'button-share';
        shareBtn.title = 'Bagikan ke teman atau salin tautan';
        shareBtn.innerHTML = `
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Bagikan</span>
        `;

        actionRow.appendChild(shareBtn);

        // Buat tombol Tutorial Unduh
        if (!document.querySelector('.button-tutorial')) {
            const tutorialBtn = document.createElement('a');
            tutorialBtn.href = '/Tutorial/tutorial-unduh.html';
            tutorialBtn.className = 'button-tutorial';
            tutorialBtn.title = 'Cara download episode';
            tutorialBtn.setAttribute('rel', 'noopener');
            tutorialBtn.innerHTML = `<span>Tutorial Unduh</span>`;
            actionRow.appendChild(tutorialBtn);
        }

        // Buat Toast Notification jika belum ada
        let toast = document.getElementById('shareToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shareToast';
            toast.setAttribute('role', 'alert');
            toast.innerHTML = '<span>📋</span> <span>Tautan berhasil disalin!</span>';
            document.body.appendChild(toast);
        }

        let toastTimer = null;
        function showToast(message) {
            if (message) {
                toast.innerHTML = `<span>📋</span> <span>${message}</span>`;
            }
            toast.classList.add('show');
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2600);
        }

        // Event listener klik tombol Bagikan
        shareBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const pageTitle = document.querySelector('.movie-header h1')?.textContent?.trim() || document.title;
            const pageUrl = window.location.href;

            // Jika browser mendukung Web Share API (HP / Mobile)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: pageTitle + ' - Ashame Fansub',
                        text: `Drama jepang "${pageTitle}" Subtitle Indonesia di Ashame Fansub:`,
                        url: pageUrl
                    });
                    return;
                } catch (err) {
                    // Jika user cancel atau error fallback ke clipboard
                    if (err.name === 'AbortError') return;
                }
            }

            // Fallback untuk Desktop: Salin ke Clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(pageUrl)
                    .then(() => showToast('Tautan dorama berhasil disalin! 📋'))
                    .catch(() => copyFallback(pageUrl));
            } else {
                copyFallback(pageUrl);
            }
        });

        function copyFallback(text) {
            const tempInput = document.createElement('textarea');
            tempInput.value = text;
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand('copy');
                showToast('Tautan berhasil disalin! 📋');
            } catch (err) {
                prompt('Salin tautan ini:', text);
            }
            document.body.removeChild(tempInput);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShareFeature);
    } else {
        initShareFeature();
    }
})();

