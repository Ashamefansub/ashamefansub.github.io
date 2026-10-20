// Henshin Tema: Toggle Dark Mode (True Black) & Light Mode (Clean White)
function henshinTema() {
    document.body.classList.toggle("SwitchMode");
    const btn = document.getElementById("themeBtn");
    const isLight = document.body.classList.contains("SwitchMode");

    if (isLight) {
        if (btn) btn.src = "/img/sub-image/nightmode.png";
        localStorage.setItem("theme", "light");
    } else {
        if (btn) btn.src = "/img/sub-image/daymode.png";
        localStorage.setItem("theme", "dark");
    }
}

// Apply theme as early as possible to avoid flash
(function () {
    try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            document.documentElement.classList.add("SwitchMode");
            if (document.body) document.body.classList.add("SwitchMode");
        }
    } catch (e) {}
})();

// Re-check after DOM is ready to sync button icon
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme");
    const btn = document.getElementById("themeBtn");

    if (savedTheme === "light") {
        document.body.classList.add("SwitchMode");
        if (btn) btn.src = "/img/sub-image/nightmode.png";
    } else {
        document.body.classList.remove("SwitchMode");
        if (btn) btn.src = "/img/sub-image/daymode.png";
    }
});
