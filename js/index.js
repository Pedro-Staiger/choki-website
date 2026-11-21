function initialAnimation() {
    const main = document.querySelector("main")
    const elements = [...main.children];

    elements.forEach(element => {
        element.style.animation = "appear 1.75s ease-out forwards";
    });
}

function animateProgressBar() {
    let intervalo = 300;

    const progressBars = document.querySelectorAll("progress");

    for (let progressBar of progressBars) {
        setTimeout(() => {
            value = Math.random() * (100 - 10) + 10;
            progressBar.setAttribute("value", value);
        }, intervalo);

        intervalo += 100;
    }
}

function setScrollAnimation() {
    const elements = document.querySelectorAll(".hidden");

    let delayInicial = 200;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add("show");
                }, delayInicial * index);
            } else {
                entry.target.classList.remove("show");
            }
        });
    });

    elements.forEach((el) => observer.observe(el));
}


initialAnimation();
animateProgressBar();
setScrollAnimation();