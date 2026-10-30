// Header loader & interactive scroll behavior
(function () {
    let lastScrollY = window.scrollY;
    let timer = null;

    // Resolve header path based on current path
    const headerPath = window.location.pathname.includes('/series/') ||
        window.location.pathname.includes('/film/') ||
        window.location.pathname.includes('/partner/') ||
        window.location.pathname.includes('/showroom/') ||
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

    // Database nama pemeran (Cast) untuk pencarian reaktif
    const CAST_DATA = {
    "35-sai-ima-sara-koi-toka-arienai": [
        "Iriki Mari",
        "Ishiguro Hideo"
    ],
    "death-seishun-game": [
        "Yamasaki Ten",
        "Fujimoto Kodai",
        "Yoshizawa Kaname",
        "Hayashi Yuta",
        "Kikuchi Hinako",
        "Kawashima Umika",
        "Ikeda Ryo",
        "Ashikawa Makoto",
        "Kamio Yu",
        "Ogino Yuri"
    ],
    "deep-revenge": [
        "Hori Miona",
        "Iijima Hiroki",
        "Ishikawa Ren",
        "Matoba Koji",
        "Matsui Riki",
        "Makio Yusuke",
        "Saikawa Koji",
        "Fujie Moe",
        "Hasegawa Rimo",
        "Toyoshima Cocoro"
    ],
    "deguchi-8": [
        "Ninomiya Kazunari",
        "Kochi Yamato",
        "Komatsu Nana",
        "Asanuma Naru",
        "Hanase Kotone"
    ],
    "dekiai-kareshi-no-tsukurikata": [
        "Yoda Yuuki",
        "Nomura Shuhei",
        "Yamashita Rio",
        "Hashimoto Wataru",
        "Akitani Mone"
    ],
    "honmei-janakya": [
        "Higuchi Hina",
        "Ikeda Masashi",
        "Kusakawa Naoya",
        "Mito Yuna",
        "Hibi Mikoto"
    ],
    "inukai-san-wa-kakure-dekiai-joushi": [
        "Miyazawa Yu",
        "Yokono Sumire"
    ],
    "isho-kokai": [
        "Yoshino Hokuto",
        "Miyase Ryubi",
        "Shida Sara",
        "Matsui Minato",
        "Takaishi Akari",
        "Hori Miona",
        "Oshinari Shugo",
        "Kamimura Kaisei",
        "Kawashima  Ririka ",
        "Arai Keishi",
        "Matsumoto Hiroki",
        "Hoshino Yuna",
        "Sakakibara Arina",
        "Todo Hinata",
        "Kikuchi Hina",
        "Omine Yuriho",
        "Asa Tatsumi",
        "Kanemitsu Honoka",
        "Hidaka Marin",
        "Ohigashi Ritsuki",
        "Kaneno Miho",
        "Suzukawa Sayu",
        "Asano Shunya",
        "Aoshima Kokoro",
        "Raiku"
    ],
    "izayoi-zenbou": [
        "Nakamura Aoi",
        "Shibuya Nagisa",
        "Akiya Ikuho",
        "Suzuki Nobuyuki",
        "Honda Chikara",
        "Mihara Ui"
    ],
    "jigoku-wa-zeni-de-dekiteiru": [
        "Kusakawa Takuya",
        "Takano Akira",
        "Watanabe Miho",
        "Yoshida Kengo",
        "Igashira Manami",
        "Hosoda Yoshihiko",
        "Saeki Daichi",
        "Okamura Mana",
        "Akapen Takigawa",
        "Yamashita Eiku",
        "Kinoshita Haruka"
    ],
    "karada-sagashi-the-last-night": [
        "Hashimoto Kanna",
        "Maeda Gordon",
        "Sakurai Kaito",
        "Anzai Seira",
        "Suzuki Fuku",
        "Honda Marin",
        "Yoshida Takeaki",
        "Daigo Kotaro",
        "Tosu Suzuha",
        "Nobuhiro Masaki",
        "Kamio Fuju"
    ],
    "mame-to-mugi": [
        "Saito Asuka",
        "Tomita Miu",
        "Hamao Noritaka",
        "Ishikawa Ruka",
        "Yamaya Kasumi",
        "Hashimoto Atsushi",
        "Nagai Mijika",
        "Yagi Alissa",
        "Takahashi Shinnosuke",
        "Shimada Kyusaku",
        "Fuse Eri"
    ],
    "mission-kageki": [
        "Michieda Shunsuke",
        "Kubo Shiori",
        "Shibuya Nagisa",
        "Ishii Anna",
        "Shiramoto Ayana",
        "Kyoka",
        "Fukada Ryusei",
        "Yamazaki Hirona",
        "Minemura Rie",
        "Takashima Masahiro"
    ],
    "momo-no-uta": [
        "Kashio Atsuki",
        "Hozaki Rei",
        "Park Yoo Chun"
    ],
    "motokare-no-neko-wo-azukarimashite": [
        "Kashiwagi Yuki",
        "Kai Shouma",
        "Kojima Fujiko",
        "Ishikawa Karen",
        "Isawa Takuma",
        "Hamano Kenta"
    ],
    "onna-no-ko-ga-daicha-dame-desuka": [
        "Takao Hayato",
        "Shida Kohaku",
        "Usa Takuma",
        "Sekoguchi Ryo",
        "Yano Nanaka",
        "Nagano Sora",
        "Yamato Nao"
    ],
    "otto-wo-shakaiteki-ni-massatsu-suru-itsutsu-no-houhou-revenge": [
        "Kato Shiho",
        "Iijima Hiroki",
        "Yamashita Yorie",
        "Izuka Kenta",
        "Tanaka Takashi",
        "Kobayashi Ryota",
        "Shida Nene",
        "Ishikawa Karen"
    ],
    "rojiura-hotel": [
        "Nakashima Yuzuki",
        "Murayama Miu",
        "Kojima Nagisa",
        "Endo Riko",
        "Ishimori Rika",
        "Taniguchi Airi",
        "Murai Yu",
        "Matono Mio",
        "Odakura Reina",
        "Yamashita Shizuki",
        "Mukai Itoha",
        "Nakamura Toru",
        "Kawazoe Noa",
        "Takao Shogo",
        "Maeno Tomoya"
    ],
    "shitsuren-karuta": [
        "Umezawa Minami",
        "Nishigaki Sho",
        "Kato Konatsu",
        "Wakabayashi Jiei",
        "Ito Gen",
        "Arai Keishi",
        "Sakuragi Masaya",
        "Abe Alan",
        "Fukami Motoki",
        "Mitsu Satoshi",
        "Yumiki Nao"
    ],
    "strange-ito-junji-no-yoru-mo-nemurenu-kimyou-na-hanashi": [
        "Hosoda Kanata",
        "Maki Yoko",
        "Marui Wan",
        "Saito Nagisa",
        "Sakamoto Manato",
        "Sugita Rairu",
        "Nakamura Riho",
        "Higuchi Hina",
        "Yamazaki Nanami",
        "Saito Jun",
        "Tsunematsu Yuri",
        "Riko",
        "Matsumiya Rin",
        "Takahata Yuuki",
        "Wakai Naoko",
        "Matsuse Daiji",
        "Kamiya Sora",
        "Wauchi Rino",
        "Takano Nagisa",
        "Komatsu Yuria",
        "Kawasaki Honoka",
        "Kuroki Kousei",
        "Fujimoto Kodai",
        "Yanagi Yurina",
        "Morozumi Shu",
        "Arizono Yoshiki",
        "Miyano Tsubasa",
        "Miyazawa Yu",
        "Terui Nonoka",
        "Ono Hinato",
        "Yonaha Rui",
        "Fukuyama Shodai",
        "Kataoka Sennosuke",
        "Nakazawa Isao",
        "Ogura Yuka",
        "Fujibayashi Yasunari",
        "Takeshita Kaori",
        "Ishihara Yoshizumi",
        "Yagi Miki",
        "Iwata Kanade",
        "Tsukumo Kisuke",
        "Sasahara Hiyori",
        "Irei Himena",
        "Tomite Ami",
        "Yuya Shintaro",
        "Ando Akinori",
        "Minamiyama Azusa",
        "Hoshino Anna",
        "Iwasaki Aoi",
        "Oohira Ayaka",
        "Maikichi",
        "Maeda Mizuki",
        "Jinno Kowa",
        "Sogawa Ayana",
        "Hayama Shono",
        "Riju Go"
    ],
    "sukui-sukuware": [
        "NOA",
        "Sakaguchi Tamami",
        "Akune Haruse",
        "Tsubokura Yoshiyuki",
        "Wakatsuki Yumi",
        "Hachimura Rintaro",
        "Uehara Amane",
        "Mukai Rei",
        "Yonezawa Ria",
        "Tanaka Kotaro",
        "Aoshima Kokoro",
        "Suzuki Hideharu",
        "Yuui Ryoko",
        "Aira"
    ],
    "sunset-sunrise": [
        "Suda Masaki",
        "Inoue Mao",
        "Nakamura Masatoshi",
        "Miyake Ken",
        "Takehara Pistol",
        "Yamamoto Hiroshi",
        "Yoshii Masao",
        "Kohinata Fumiyo",
        "Ikewaki Chizuru",
        "Fujima Sawako",
        "Kayashima Mizuki",
        "Shirakawa Kazuko",
        "Matsuo Takashi",
        "Beat Kiyoshi",
        "Hankai Kazuaki",
        "Miyazaki Tomu",
        "Shoji Yusuke",
        "Matsuura Yuya",
        "Marui Wan"
    ],
    "toumei-na-yoru-ni": [
        "Nagase Riko",
        "Fujiwara Taiyu",
        "Sono Shunta",
        "Kawamura Hana",
        "Someya Toshiyuki",
        "Emi Kurara"
    ],
    "yakin-jiken": [
        "Minami Kotona",
        "Takezai Terunosuke",
        "Seki Tetta",
        "Tanaka Shunsuke",
        "Sakamoto Makoto",
        "Sakurai Atsuko",
        "Kato Natsuki",
        "Tezuka Mai",
        "Yoshioka Yuki",
        "Mizuno Chiharu"
    ],
    "yano-kun-no-futsuu-no-hibi": [
        "Yagi Yusei",
        "Ikehata Anji",
        "Nakamura Kaito",
        "Shiromiya Mizuho",
        "Ito Keigo",
        "Tsutsui Ayame",
        "Niinuma Ria",
        "Ikeda Ryo",
        "Miyazaki Ririsa",
        "Aoki Kou"
    ]
};

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
                const dictCast = (slug && CAST_DATA[slug]) ? CAST_DATA[slug] : [];
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
                    const heroDictCast = (heroSlug && CAST_DATA[heroSlug]) ? CAST_DATA[heroSlug] : [];
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
})();