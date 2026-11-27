// Header loader & interactive scroll behavior
(function () {
    let lastScrollY = window.scrollY;
    let timer = null;

    // Resolve header path based on current path
    const headerPath = window.location.pathname.includes('/series/') ||
        window.location.pathname.includes('/film/') ||
        window.location.pathname.includes('/partner/') ||
        window.location.pathname.includes('/showroom/') ||
        window.location.pathname.includes('/sakamichi/') ||
        window.location.pathname.includes('/header/') ||
        window.location.pathname.toLowerCase().includes('/tutorial/')
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

            // Mark active nav link (Support exact match & sub-pages)
            const currentPath = window.location.pathname.toLowerCase();
            const navLinks = header.querySelectorAll(".nav-menu a");
            navLinks.forEach(link => {
                const href = (link.getAttribute("href") || "").toLowerCase().replace(/^\//, '');
                const cleanHref = href.replace(/\/index\.html$/, '');

                if (cleanHref && (currentPath.includes('/' + cleanHref + '/') || currentPath.endsWith(href) || currentPath.endsWith(cleanHref))) {
                    link.classList.add("active");
                }
            });


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

            // Inisialisasi Tombol Scroll Up
            initScrollTopButton();

            // Inisialisasi Reading Progress Bar (#812990)
            initReadingProgressBar();

            // Inisialisasi Ambient Glow Poster (Halaman Detail)
            initPosterAmbientGlow();

            // Inisialisasi Ambient Glow Hero Spotlight (Beranda)
            initHeroAmbientGlow();

            // Inisialisasi Mobile Hamburger Menu & Drawer
            initMobileDrawer();

            // Inisialisasi Ambient Glow Card Grid (Tab Series & Movie di Beranda)
            initCardAmbientGlow();
        })
        .catch(err => console.error("Error loading header:", err));

    // Database nama pemeran (Cast) dimuat terpisah dari /js/cast-data.js
    if (!window.CAST_DATA && !document.querySelector('script[src*="cast-data.js"]')) {
        const castScript = document.createElement('script');
        castScript.src = '/js/cast-data.js';
        castScript.async = true;
        document.head.appendChild(castScript);
    }


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
            const rawQuery = searchInput.value.trim().toLowerCase();
            const activeChip = document.querySelector(".filter-chip.active");
            const chipFilter = activeChip ? activeChip.getAttribute("data-filter") : "all";
            const qTokens = rawQuery.split(/\s+/).filter(Boolean);

            let visibleCount = 0;

            cards.forEach(card => {
                const category = (card.getAttribute("data-category") || "").toLowerCase();
                const status = (card.getAttribute("data-status") || "").toLowerCase();
                const cardText = (card.textContent || "").toLowerCase();
                const imgAlt = (card.querySelector("img")?.getAttribute("alt") || "").toLowerCase();

                // Dapatkan slug file untuk pencocokan database cast
                const href = card.querySelector("a")?.getAttribute("href") || "";
                const slugMatch = href.match(/([^\/\?#]+)\.html/);
                const slug = slugMatch ? slugMatch[1] : "";

                // Ambil semua nama pemeran dari elemen berkelas .nama-pemeran di dalam kartu atau database
                const domCast = Array.from(card.querySelectorAll(".nama-pemeran"))
                    .map(el => el.textContent.trim());
                const dictCast = (slug && (window.CAST_DATA || {})[slug]) ? (window.CAST_DATA || {})[slug] : [];
                const castList = Array.from(new Set([...domCast, ...dictCast]));

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

                // 2. Cek kecocokan kata kunci pencarian (judul, teks, alt gambar, atau nama pemeran)
                let matchesQuery = true;
                if (rawQuery) {
                    // Cek judul / teks kartu / alt gambar
                    const matchesTitle = cardText.includes(rawQuery) || imgAlt.includes(rawQuery) ||
                        (qTokens.length > 1 && qTokens.every(tok => cardText.includes(tok) || imgAlt.includes(tok)));

                    // Cek nama pemeran (.nama-pemeran)
                    const matchesCast = castList.some(castName => {
                        const actor = castName.toLowerCase();
                        const actorTokens = actor.split(/\s+/).filter(Boolean);
                        const reversedActor = [...actorTokens].reverse().join(" ");

                        // Cocok langsung (contoh: "asuka", "saito", "saito asuka")
                        if (actor.includes(rawQuery)) return true;

                        // Cocok nama terbalik (contoh: "asuka saito" saat di data adalah "saito asuka")
                        if (reversedActor.includes(rawQuery)) return true;

                        // Cocok multi-kata fleksibel (setiap kata query cocok di nama pemeran)
                        if (qTokens.length > 1 && qTokens.every(tok => actor.includes(tok))) {
                            return true;
                        }

                        return false;
                    });

                    matchesQuery = matchesTitle || matchesCast;
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
                if (rawQuery) {
                    const heroText = heroSpotlight.textContent.toLowerCase();
                    const heroHref = heroSpotlight.querySelector("a")?.getAttribute("href") || "";
                    const heroSlugMatch = heroHref.match(/([^\/\?#]+)\.html/);
                    const heroSlug = heroSlugMatch ? heroSlugMatch[1] : "";

                    const heroDomCast = Array.from(heroSpotlight.querySelectorAll(".nama-pemeran"))
                        .map(el => el.textContent.trim());
                    const heroDictCast = (heroSlug && (window.CAST_DATA || {})[heroSlug]) ? (window.CAST_DATA || {})[heroSlug] : [];
                    const heroCast = Array.from(new Set([...heroDomCast, ...heroDictCast]));

                    const heroMatchesText = heroText.includes(rawQuery) ||
                        (qTokens.length > 1 && qTokens.every(tok => heroText.includes(tok)));

                    const heroMatchesCast = heroCast.some(castName => {
                        const actor = castName.toLowerCase();
                        const actorTokens = actor.split(/\s+/).filter(Boolean);
                        const reversedActor = [...actorTokens].reverse().join(" ");
                        if (actor.includes(rawQuery) || reversedActor.includes(rawQuery)) return true;
                        if (qTokens.length > 1 && qTokens.every(tok => actor.includes(tok))) return true;
                        return false;
                    });

                    heroSpotlight.style.display = (heroMatchesText || heroMatchesCast) ? "" : "none";
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
                    const displayKeyword = rawQuery || (chipFilter !== "all" ? chipFilter : "");
                    notFoundEl.innerHTML = `
                        <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 48px 16px;">
                            <div style="font-size: 2.2rem; margin-bottom: 10px;">😥</div>
                            <h4 style="font-size: 1.15rem; margin-bottom: 6px; color: var(--text-primary, #fff);">Tidak ada hasil ditemukan</h4>
                            <p style="font-size: 0.9rem; color: var(--text-secondary, #a1a1aa); margin: 0;">Tidak ditemukan judul atau pemeran yang cocok dengan "<strong>${escapeHtml(displayKeyword)}</strong>"</p>
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

    // Inisialisasi Tombol Scroll to Top Otomatis
    function initScrollTopButton() {
        const btn = document.getElementById("scrollTopBtn");
        if (!btn) return;

        let idleTimer = null;

        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        function onScrollActivity() {
            const currentY = window.scrollY;

            // Jangan tampilkan jika masih di bagian atas halaman
            if (currentY <= 150) {
                btn.classList.remove("visible");
                if (idleTimer) clearTimeout(idleTimer);
                return;
            }

            // Tampilkan tombol saat layar digerakkan (scroll atas/bawah)
            btn.classList.add("visible");

            // Hilangkan kembali saat idle (tidak ada pergerakan selama 1.8 detik)
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                btn.classList.remove("visible");
            }, 1800);
        }

        window.addEventListener("scroll", onScrollActivity, { passive: true });
    }

    // Inisialisasi Reading Progress Bar (#812990)
    function initReadingProgressBar() {
        const bar = document.getElementById("readingProgressBar");
        if (!bar) return;

        function updateProgress() {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollTotal <= 0) {
                bar.style.width = "0%";
                return;
            }
            const scrolled = (window.scrollY / scrollTotal) * 100;
            bar.style.width = Math.min(100, Math.max(0, scrolled)) + "%";
        }

        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
        updateProgress();
    }

    // Inisialisasi Ambient Glow pada Hero Spotlight (Halaman Utama)
    function initHeroAmbientGlow() {
        function setupHeroAmbient() {
            const poster = document.querySelector(".hero-thumbnail-wrap img");
            const container = document.querySelector(".hero-content");
            if (!poster || !container) return;

            // Cegah duplikasi elemen backdrop
            if (container.querySelector(".hero-ambient-backdrop")) return;

            const backdrop = document.createElement("div");
            backdrop.className = "hero-ambient-backdrop";
            backdrop.setAttribute("aria-hidden", "true");

            function applyHeroBackdropImage() {
                const src = poster.currentSrc || poster.src;
                if (src) {
                    backdrop.style.backgroundImage = `url("${src}")`;
                }
            }

            applyHeroBackdropImage();
            poster.addEventListener("load", applyHeroBackdropImage);

            container.insertBefore(backdrop, container.firstChild);
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setupHeroAmbient);
        } else {
            setupHeroAmbient();
        }
    }

    // Inisialisasi Ambient Glow dari Poster (Halaman Detail Series / Movie)
    function initPosterAmbientGlow() {
        function setupAmbient() {
            const poster = document.querySelector(".movie-poster");
            const container = document.querySelector(".movie-content");
            if (!poster || !container) return;

            // Cegah duplikasi elemen backdrop
            if (container.querySelector(".movie-ambient-backdrop")) return;

            const backdrop = document.createElement("div");
            backdrop.className = "movie-ambient-backdrop";
            backdrop.setAttribute("aria-hidden", "true");

            function applyBackdropImage() {
                const src = poster.currentSrc || poster.src;
                if (src) {
                    backdrop.style.backgroundImage = `url("${src}")`;
                }
            }

            applyBackdropImage();
            poster.addEventListener("load", applyBackdropImage);

            container.insertBefore(backdrop, container.firstChild);
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setupAmbient);
        } else {
            setupAmbient();
        }
    }

    // Inisialisasi Ambient Glow pada Card Grid (Tab Series & Movie di Beranda)
    function initCardAmbientGlow() {
        function setupCardGlow() {
            const cards = document.querySelectorAll(".card");
            if (!cards.length) return;

            cards.forEach(function(card) {
                // Cegah duplikasi
                if (card.querySelector(".card-glow-backdrop")) return;

                // Cari img: dalam card-thumbnail-container (beranda) atau langsung (katalog series/film)
                const img = card.querySelector(".card-thumbnail-container img") || card.querySelector("img");
                if (!img) return;

                const backdrop = document.createElement("div");
                backdrop.className = "card-glow-backdrop";
                backdrop.setAttribute("aria-hidden", "true");

                function applyGlowImage() {
                    const src = img.currentSrc || img.src;
                    if (src) {
                        backdrop.style.backgroundImage = `url("${src}")`;
                    }
                }

                applyGlowImage();
                img.addEventListener("load", applyGlowImage);

                // Insert backdrop sebagai child pertama card (di bawah semua konten, z-index: -1)
                card.insertBefore(backdrop, card.firstChild);
            });
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setupCardGlow);
        } else {
            setupCardGlow();
        }
    }

    // Inisialisasi Hamburger Menu & Drawer Mobile
    function initMobileDrawer() {
        const hamburgerBtn = document.getElementById("hamburgerBtn");
        const drawer = document.getElementById("mobileDrawer");
        const overlay = document.getElementById("mobileDrawerOverlay");
        const closeBtn = document.getElementById("mobileDrawerClose");

        if (!hamburgerBtn || !drawer || !overlay) return;

        function openDrawer() {
            hamburgerBtn.classList.add("is-open");
            hamburgerBtn.setAttribute("aria-expanded", "true");
            drawer.classList.add("is-open");
            drawer.setAttribute("aria-hidden", "false");
            overlay.classList.add("is-visible");
            overlay.setAttribute("aria-hidden", "false");
            document.body.classList.add("drawer-open");
        }

        function closeDrawer() {
            hamburgerBtn.classList.remove("is-open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
            drawer.classList.remove("is-open");
            drawer.setAttribute("aria-hidden", "true");
            overlay.classList.remove("is-visible");
            overlay.setAttribute("aria-hidden", "true");
            document.body.classList.remove("drawer-open");
        }

        hamburgerBtn.addEventListener("click", () => {
            if (drawer.classList.contains("is-open")) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
        overlay.addEventListener("click", closeDrawer);

        // Tutup saat tombol ESC ditekan
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && drawer.classList.contains("is-open")) {
                closeDrawer();
            }
        });

        // Tandai link aktif di dalam mobile drawer
        const currentPath = window.location.pathname.toLowerCase();
        const drawerLinks = drawer.querySelectorAll(".mobile-drawer-link");
        drawerLinks.forEach(link => {
            const href = (link.getAttribute("href") || "").toLowerCase().replace(/^\//, '');
            const cleanHref = href.replace(/\/index\.html$/, '');

            if (cleanHref && (currentPath.includes('/' + cleanHref + '/') || currentPath.endsWith(href) || currentPath.endsWith(cleanHref))) {
                link.classList.add("active");
            } else if (!cleanHref && (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '')) {
                if (href === 'index.html' || href === '') {
                    link.classList.add("active");
                }
            }
        });
    }
})();