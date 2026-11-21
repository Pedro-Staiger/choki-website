const serverUrl = "https://choki-server.onrender.com";

function login(buttonContainer) {
    const alertField = document.querySelector(".alert-field");
    alertField.style.color = "#a0b0a850";
    alertField.textContent = "";

    const lightLoader = buildLightIcon();
    lightLoader.classList.add("light-loader");

    const email = document.querySelector("#input-email").value.trim();
    const password = document.querySelector("#input-password").value.trim();

    if (!email || !password) {
        alertField.style.color = "#d00000";
        alertField.textContent = "Insira as informações corretamente";
        return
    }

    if (!email.includes("@")) {
        alertField.style.color = "#d00000";
        alertField.textContent = "Insira um email válido";
        return
    }

    buttonContainer.textContent = "Carregando...";
    buttonContainer.appendChild(lightLoader);
    lightLoader.classList.add("loading");
    alertField.textContent = "";
    fetch(`${serverUrl}/api/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    }).then(response => {
        if (!response.ok) {
            buttonContainer.textContent = "Entrar";
            lightLoader.classList.remove("loading");

            alertField.style.color = "#d00000";
            alertField.textContent = "Erro ao realizar login, dados incorretos ou inexistentes";

            throw new Error('Erro na requisição: ' + response.status);
        }
        return response.json();
    })
        .then(data => {
            buttonContainer.textContent = "Login efetuado com sucesso";
            lightLoader.classList.remove("loading");

            localStorage.setItem("userId", data.id);
            localStorage.setItem("accessToken", data.token);

            setTimeout(() => {
                window.location = "../dashboard/dashboard.html";
            }, 1000);
        })
        .catch(error => {
            buttonContainer.textContent = "Entrar";
            lightLoader.classList.remove("loading");

            alertField.style.color = "#d00000";
            alertField.textContent = "Erro ao realizar login, dados incorretos ou inexistentes";

            console.error('Erro:', error);
        });
}

function setPasswordVisibility(button) {
    const input = document.querySelector("#input-password");
    const currentInputType = input.getAttribute("type");

    if (currentInputType === "password") {
        input.setAttribute("type", "text");

        button.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        input.setAttribute("type", "password");

        button.innerHTML = `
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

function setEnterKeyListener() {
    const inputEmail = document.querySelector("#input-email");
    const inputPassword = document.querySelector("#input-password");

    const inputs = [inputEmail, inputPassword];

    for (let input of inputs) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                const buttonContainer = document.querySelector("form button");
                login(buttonContainer);
            }
        });
    }
}

setEnterKeyListener();

function buildLightIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 15H6l7-14v8h5l-7 14z" />
        </svg>
    `;

    return wrapper.firstElementChild;
}