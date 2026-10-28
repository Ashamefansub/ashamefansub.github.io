// Header loader & interactive scroll behavior
(function () {
    let lastScrollY = window.scrollY;
    let timer = null;

    // Resolve header path based on current path
    const headerPath = window.location.pathname.includes('/series/') ||
        window.location.pathname.includes('/film/') ||
        window.location.pathname.includes('/partner/') ||
        window.location.pathname.includes('/showroom/') ||
        window.location.pathname.includes('/header/')
        ? "../header/header.html"
        : "header/header.html";

    fetch(headerPath)
        .then(response => {
            if (!response.ok) throw new Error("Header load failed");
            return response.text();
        })
        .catch(() => fetch("/header/header.html").then(res => res.text()))
        .then(html => {
            const container = document.getElementById("header");
            if (!container) return;
            container.innerHTML = html;

            const header = document.querySelector(".header");
            if (!header) return;

            // Mark active nav link
            const currentPath = window.location.pathname;
            const navLinks = header.querySelectorAll(".nav-menu a");
            navLinks.forEach(link => {
                const href = link.getAttribute("href");
                if (href && currentPath.endsWith(href.replace(/^\//, ''))) {
                    link.classList.add("active");
                }
            });

            // Sync theme button icon
            const currentTheme = localStorage.getItem("theme");
            const btn = document.getElementById("themeBtn");
            if (btn) {
                btn.src = (currentTheme === "light")
                    ? "/img/sub-image/nightmode.png"
                    : "/img/sub-image/daymode.png";
            }

            // Scroll behavior: Hide when scrolling down, show when scrolling up
            function handleScroll() {
                const currentScrollY = window.scrollY;

                if (currentScrollY <= 15) {
                    header.classList.remove("hide");
                    clearTimeout(timer);
                    lastScrollY = currentScrollY;
                    return;
                }

                if (currentScrollY > lastScrollY && currentScrollY > 70) {
                    // Scrolling DOWN -> Hide
                    header.classList.add("hide");
                } else {
                    // Scrolling UP -> Show
                    header.classList.remove("hide");
                }

                lastScrollY = currentScrollY;
            }

            window.addEventListener("scroll", handleScroll, { passive: true });

            // Show on mouse hover
            header.addEventListener("mouseenter", () => {
                header.classList.remove("hide");
            });

            // Inisialisasi Search Bar Reaktif
            initHeaderSearch();
        })
        .catch(err => console.error("Error loading header:", err));

    function initHeaderSearch() {
        const searchForm = document.getElementById("headerSearchForm");
        const searchInput = document.getElementById("headerSearchInput");
        if (!searchInput) return;

        // Cari kontainer kartu konten jika ada di halaman saat ini
        const cardContainer = document.getElementById("contentGrid") ||
            document.querySelector(".kotak-konten-beranda") ||
            document.querySelector(".kotak-konten");
        const cards = cardContainer ? cardContainer.querySelectorAll(".card") : [];
        const heroSpotlight = document.querySelector(".hero-spotlight");

        function executeFilter() {
            const query = searchInput.value.trim().toLowerCase();
            const activeChip = document.querySelector(".filter-chip.active");
            const chipFilter = activeChip ? activeChip.getAttribute("data-filter") : "all";

            let visibleCount = 0;

            cards.forEach(card => {
                const category = (card.getAttribute("data-category") || "").toLowerCase();
                const status = (card.getAttribute("data-status") || "").toLowerCase();
                const cardText = (card.textContent || "").toLowerCase();
                const imgAlt = (card.querySelector("img")?.getAttribute("alt") || "").toLowerCase();

                // 1. Cek filter kategori (chips) jika ada
                let matchesChip = false;
                if (!chipFilter || chipFilter === "all") {
                    matchesChip = true;
                } else if (chipFilter === "series" && category === "series") {
                    matchesChip = true;
                } else if (chipFilter === "movie" && category === "movie") {
                    matchesChip = true;
                } else if (chipFilter === "ongoing" && status === "ongoing") {
                    matchesChip = true;
                } else if (chipFilter === "tamat" && status === "tamat") {
                    matchesChip = true;
                }

                // 2. Cek kecocokan kata kunci pencarian
                let matchesQuery = true;
                if (query) {
                    matchesQuery = cardText.includes(query) || imgAlt.includes(query);
                }

                if (matchesChip && matchesQuery) {
                    card.style.display = "flex";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            // Sesuaikan tampilan Hero Spotlight (di beranda)
            if (heroSpotlight) {
                if (query) {
                    const heroText = heroSpotlight.textContent.toLowerCase();
                    heroSpotlight.style.display = heroText.includes(query) ? "" : "none";
                } else {
                    heroSpotlight.style.display = (!chipFilter || chipFilter === "all" || chipFilter === "series") ? "" : "none";
                }
            }

            // Pesan jika tidak ada konten yang cocok
            let notFoundEl = document.getElementById("searchNotFound");
            if (cardContainer && cards.length > 0) {
                if (visibleCount === 0) {
                    if (!notFoundEl) {
                        notFoundEl = document.createElement("div");
                        notFoundEl.id = "searchNotFound";
                        notFoundEl.className = "search-not-found";
                        notFoundEl.setAttribute("role", "status");
                        cardContainer.appendChild(notFoundEl);
                    }
                    const displayKeyword = query || (chipFilter !== "all" ? chipFilter : "");
                    notFoundEl.innerHTML = `
                        <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 48px 16px;">
                            <div style="font-size: 2.2rem; margin-bottom: 10px;">😥</div>
                            <h4 style="font-size: 1.15rem; margin-bottom: 6px; color: var(--text-primary, #fff);">Tidak ada hasil ditemukan</h4>
                            <p style="font-size: 0.9rem; color: var(--text-secondary, #a1a1aa); margin: 0;">Tidak ditemukan judul yang cocok dengan "<strong>${escapeHtml(displayKeyword)}</strong>"</p>
                        </div>
                    `;
                    notFoundEl.style.display = "block";
                } else if (notFoundEl) {
                    notFoundEl.style.display = "none";
                }
            }
        }

        function escapeHtml(str) {
            return str.replace(/[&<>"']/g, m => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m]));
        }

        // Jika halaman saat ini memiliki kartu katalog
        if (cards.length > 0) {
            // Reaktif: langsung jalan saat pengguna mengetik
            searchInput.addEventListener("input", executeFilter);
            // Tangani tombol 'clear' (x) bawaan input type="search"
            searchInput.addEventListener("search", executeFilter);

            if (searchForm) {
                searchForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    executeFilter();
                });
            }

            // Simpan handler ke window agar sinkron dengan filter chips
            window.__ashameApplyFilter = executeFilter;

            // Dukungan pencarian lewat URL param (misal dari halaman lain: index.html?q=keyword)
            const urlParams = new URLSearchParams(window.location.search);
            const initialQuery = urlParams.get("q") || urlParams.get("search");
            if (initialQuery) {
                searchInput.value = initialQuery;
                executeFilter();
                setTimeout(() => {
                    cardContainer.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 300);
            }
        } else {
            // Halaman detail (tanpa katalog): submit form akan mengarahkan ke beranda dengan query pencarian
            if (searchForm) {
                searchForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const q = searchInput.value.trim();
                    if (q) {
                        window.location.href = `/index.html?q=${encodeURIComponent(q)}`;
                    }
                });
            }
        }
    }
})();