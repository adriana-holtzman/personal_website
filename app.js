const content = document.getElementById("content");

document.querySelectorAll(".menu button").forEach(button => {
    button.addEventListener("click", async () => {
        const page = button.dataset.page;

        const response = await fetch(`pages/${page}.html`);
        const html = await response.text();

        content.innerHTML = html;
    });
});
