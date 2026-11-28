// ========================================================
// 🌸 Ashame Fansub — Universal Catalog & Stats Renderer
// Mendukung Beranda, Katalog Series, dan Katalog Movie
// ========================================================

(function () {
    const contentGrid = document.getElementById("contentGrid");
    if (!contentGrid) return;

    // Tentukan file JSON yang akan dimuat berdasarkan atribut data-json atau path URL
    let dataUrl = contentGrid.getAttribute("data-json");

    if (!dataUrl) {
        const path = window.location.pathname.toLowerCase();
        if (path.includes("/series/")) {
            dataUrl = "/data/katalog-data-series.json";
        } else if (path.includes("/film/")) {
            dataUrl = "/data/katalog-data-movie.json";
        } else {
            dataUrl = "/data/katalog.json";
        }
    }

    fetch(dataUrl)
        .then(response => {
            if (!response.ok) throw new Error("Gagal memuat " + dataUrl);
            return response.json();
        })
        .then(data => {
            renderKatalog(data);
            updateStatistikOtomatis(data);
        })
        .catch(err => {
            console.error("Error render katalog:", err);
        });

    function renderKatalog(items) {
        let html = "";

        items.forEach(item => {
            const tagClass = item.category === "series" ? "tag-series" : (item.category === "movie" ? "tag-movie" : "tag-showroom");
            const statusClass = item.status || "ongoing";
            const badgeBottomHtml = item.badgeBottom
                ? `<div class="card-badge-bottom"><span class="badge-status ${statusClass}">${escapeHtml(item.badgeBottom)}</span></div>`
                : "";

            html += `
                <article class="card" data-category="${escapeHtml(item.category)}" data-status="${escapeHtml(item.status)}">
                    <a href="${escapeHtml(item.url)}">
                        <div class="card-thumbnail-container">
                            <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.alt || item.title)}" loading="lazy">
                            <div class="card-badge-top">
                                <span class="badge-tag ${tagClass}">${escapeHtml(item.badgeTop || item.category)}</span>
                            </div>
                            ${badgeBottomHtml}
                        </div>
                        <div class="card-body">
                            <h4 class="card-title">${escapeHtml(item.title)}</h4>
                        </div>
                    </a>
                </article>
            `;
        });

        contentGrid.innerHTML = html;

        // Inisialisasi ulang search bar reaktif jika header sudah selesai dimuat
        if (typeof window.__ashameInitSearch === "function") {
            window.__ashameInitSearch();
        }

        // Picu pencarian dan filter jika ada filter aktif
        if (typeof window.__ashameApplyFilter === "function") {
            window.__ashameApplyFilter();
        }

        // Panggil ambient glow kartu jika fungsi tersedia
        if (typeof window.__ashameInitCardGlow === "function") {
            window.__ashameInitCardGlow();
        }
    }

    function updateStatistikOtomatis(items) {
        // Angka statistik dihormati sesuai yang kamu atur manual di /attention/statistik.html
        // (Misalnya 17 series karena 1 series merupakan kolaborasi)
        initStatsCounter();
    }

    // Animasi Count-Up Angka saat digulir / terlihat di layar
    function initStatsCounter() {
        const statsBox = document.getElementById("fansub-stats-box");
        if (!statsBox) return;

        const nums = statsBox.querySelectorAll(".stats-num");
        if (!nums.length) return;

        // Cegah pemicuan ganda jika animasi sudah berjalan
        if (statsBox.dataset.counted === "true") return;

        function startCounting() {
            statsBox.dataset.counted = "true";

            nums.forEach(numEl => {
                const target = parseInt(numEl.getAttribute("data-target") || numEl.textContent, 10) || 0;
                const duration = 4000; // durasi count-nya
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing out cubic: melambat dengan halus di akhir
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const currentVal = Math.floor(easeOut * target);

                    numEl.textContent = currentVal;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        numEl.textContent = target;
                    }
                }

                requestAnimationFrame(update);
            });
        }

        // Gunakan IntersectionObserver agar terpicu saat diperlihatkan / di-scroll mendekati viewport
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startCounting();
                        obs.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2 // Berjalan saat 20% bagian statistik terlihat di layar
            });

            observer.observe(statsBox);
        } else {
            // Fallback untuk browser lama
            startCounting();
        }
    }

    // Buka akses global agar bisa dipanggil saat fetch statistik.html selesai
    window.__ashameInitStatsCounter = initStatsCounter;

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }
})();
