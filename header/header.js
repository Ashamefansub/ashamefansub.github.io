console.log ("Tes JS")

let timer;

// Panggil file html header
fetch("../header/header.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("header").innerHTML = data;
    

const header = document.querySelector(".header");

function showHeader() {
    header.classList.remove("hide");

// Timer hide
    clearTimeout(timer);

     if (window.scrollY <= 10) {
        return;
    }

    timer = setTimeout(() => {
        header.classList.add("hide");
    }, 1000); 
}

// Scroll muncul lagi
window.addEventListener("scroll", showHeader);

    //Pas mouse masuk ke header
        header.addEventListener("mouseenter", () => {
            clearTimeout(timer);
            header.classList.remove("hide");
        });

        if (window.scrollY <= 10) {
        return;
    }

    //Pas mouse keluar dari header
        header.addEventListener("mouseleave", () => {
            timer = setTimeout(() => {
                header.classList.add("hide");
            }, 2000);
        });

showHeader();
    });