function henshinTema() {
    document.body.classList.toggle("SwitchMode");
    const btn =
    document.getElementById("themeBtn");
    if
    (document.body.classList.contains("SwitchMode")) {
        btn.src="/img/sub-image/nightmode.png";
        localStorage.setItem("theme", "light");
    }
    else {
        btn.src="/img/sub-image/daymode.png";
        localStorage.setItem("theme", "dark");
    }
}

    window.addEventListener("load", function() {
        const theme = localStorage.getItem("theme");
        const btn = document.getElementById("themeBtn");

        if (theme === "light") {
            document.body.classList.add("SwitchMode");

            if (btn) {
                btn.src = "../img/sub-image/daymode.png";
            }

        else {

            if (btn) {
                btn.src = "/img/sub-image/daymode.png";
            }
        }
        }
    });
