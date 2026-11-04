// Henshin Tema: Toggle Dark Mode (True Black) & Light Mode (Clean White)
function henshinTema() {
    document.body.classList.toggle("SwitchMode");
    const isLight = document.body.classList.contains("SwitchMode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
}

// Terapkan tema sedini mungkin untuk mencegah efek kedip (flash of white)
(function () {
    try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            document.documentElement.classList.add("SwitchMode");
            if (document.body) document.body.classList.add("SwitchMode");
        }
    } catch (e) {}
})();

// Sinkronisasi kelas body setelah DOM selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("SwitchMode");
    } else {
        document.body.classList.remove("SwitchMode");
    }
});
