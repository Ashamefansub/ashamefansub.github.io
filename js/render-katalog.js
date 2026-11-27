// ========================================================
// 🌸 Ashame Fansub — Dynamic Catalog & Stats Renderer
// ========================================================

(function () {
    const contentGrid = document.getElementById("contentGrid");
    if (!contentGrid) return;

    fetch("/data/katalog.json")
        .then(response => {
            if (!response.ok) throw new Error("Gagal memuat katalog.json");
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
        const statsBox = document.getElementById("fansub-stats-box");
        if (!statsBox) return;

        // Hitung otomatis dari data JSON
        const totalSeries = items.filter(i => i.category === "series").length;
        const totalMovie = items.filter(i => i.category === "movie").length;

        // Ambil elemen angka di statsBox jika sudah di-render oleh fetch statistik.html
        const nums = statsBox.querySelectorAll(".stats-num");
        if (nums.length >= 3) {
            nums[0].textContent = totalSeries;
            // Episode tetap 133 (atau diambil dari kalkulasi)
            nums[2].textContent = totalMovie;
        }
    }

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
