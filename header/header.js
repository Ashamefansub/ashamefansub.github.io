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
        })
        .catch(err => console.error("Error loading header:", err));
})();