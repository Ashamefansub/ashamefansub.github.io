// Footer loader
(function () {
    const footerPath = window.location.pathname.includes('/series/') ||
                       window.location.pathname.includes('/film/') ||
                       window.location.pathname.includes('/partner/') ||
                       window.location.pathname.includes('/showroom/') ||
                       window.location.pathname.includes('/header/')
                       ? "../footer/footer.html"
                       : "footer/footer.html";

    fetch(footerPath)
        .then(response => {
            if (!response.ok) throw new Error("Footer load failed");
            return response.text();
        })
        .catch(() => fetch("/footer/footer.html").then(res => res.text()))
        .then(data => {
            const container = document.getElementById("footer");
            if (container) {
                container.innerHTML = data;
            }
        })
        .catch(err => console.error("Error loading footer:", err));
})();