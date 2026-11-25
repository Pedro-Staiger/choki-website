const serverUrl = "https://choki-server.onrender.com";

async function getUserInfo() {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("accessToken");

        const requisicao = await fetch(`${serverUrl}/api/auth/usuario/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!requisicao.ok) {
            throw new Error(`Erro ${requisicao.status}: ${requisicao.statusText}`);
        }

        const dados = await requisicao.json();

        setUserForm(dados);
    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
    }
}

function setUserForm(userInfo) {
    const headerProfileIcon = document.querySelector(".profile-picture b");
    const formProfileIcon = document.querySelector(".perfil-icon b");
    headerProfileIcon.textContent = userInfo.username[0];
    formProfileIcon.textContent = userInfo.username[0];

    const usernameText = document.querySelector("#txt-nome");
    usernameText.textContent = userInfo.username;
    const emailText = document.querySelector("#txt-email");
    emailText.textContent = userInfo.email;

    const inputNome = document.querySelector("#input-nome");
    const inputEmail = document.querySelector("#input-email");
    const inputMetaDiaria = document.querySelector("#input-meta-diaria");
    const inputMetaMensal = document.querySelector("#input-meta-mensal");
    const inputTarifa = document.querySelector("#input-tarifa");

    inputNome.setAttribute("placeholder", userInfo.username);
    inputEmail.setAttribute("placeholder", userInfo.email);
    inputMetaDiaria.setAttribute("placeholder", userInfo.meta_diaria_kwh);
    inputMetaMensal.setAttribute("placeholder", userInfo.meta_mensal_reais);
    inputTarifa.setAttribute("placeholder", userInfo.tarifa_eletrica);
}

function atualizarUsuario(buttonContainer) {
    if (buttonContainer.children.length > 0) {
        return
    }

    const alertField = document.querySelector(".alert-field");
    alertField.textContent = "";

    const inputNome = document.querySelector("#input-nome");
    const inputEmail = document.querySelector("#input-email");
    const inputMetaDiaria = document.querySelector("#input-meta-diaria");
    const inputMetaMensal = document.querySelector("#input-meta-mensal");
    const inputTarifa = document.querySelector("#input-tarifa");

    let nome = inputNome.value.trim();
    let email = inputEmail.value.trim();
    let metaDiaria = inputMetaDiaria.value.trim();
    let metaMensal = inputMetaMensal.value.trim();
    let tarifa = inputTarifa.value.trim();

    if (!nome && !email && !metaDiaria && !metaMensal && !tarifa) {
        alertField.textContent = "Preencha pelo menos um dos campos";
        return
    }

    if (!nome) {
        nome = inputNome.getAttribute("placeholder");
    }

    if (!email) {
        email = inputEmail.getAttribute("placeholder");
    }

    if (!metaDiaria) {
        metaDiaria = inputMetaDiaria.getAttribute("placeholder");
    }

    if (!metaMensal) {
        metaMensal = inputMetaMensal.getAttribute("placeholder");
    }

    if (!tarifa) {
        tarifa = inputTarifa.getAttribute("placeholder");
    }

    if (nome.length > 15 || email.length > 64 || metaDiaria.length > 6 || metaMensal.length > 6 || tarifa.length > 4) {
        alertField.textContent = "Limite de caracteres excedido";
        return
    }

    if (isNaN(metaDiaria) || isNaN(metaMensal) || isNaN(tarifa)) {
        alertField.textContent = "Insira valores válidos";
        return
    }

    buttonContainer.textContent = "Carregando...";

    const lightLoader = buildLightIcon();
    lightLoader.classList.add("light-loader", "loading");
    buttonContainer.appendChild(lightLoader);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    fetch(`${serverUrl}/api/auth/usuario/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            username: nome,
            email: email,
            meta_diaria_kwh: metaDiaria,
            meta_mensal_reais: metaMensal,
            tarifa_eletrica: tarifa

        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro na rede');
            return response.json();
        })
        .then(data => {
            setUserForm(data)
            buttonContainer.removeChild(lightLoader);
            buttonContainer.textContent = "Perfil atualizado com sucesso";
            setTimeout(() => {
                buttonContainer.textContent = "Salvar alterações"
            }, 2000);
            clearForm();
        })
        .catch(error => console.error('Erro:', error));
}

function clearForm() {
    const inputs = document.querySelectorAll("input");
    for (let input of inputs) {
        input.value = "";
    }
}

function buildLightIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 15H6l7-14v8h5l-7 14z" />
        </svg>
    `;

    return wrapper.firstElementChild;
}

getUserInfo();

function setEnterKeyListener() {
    const inputs = document.querySelectorAll(".perfil-form input");

    for (let input of inputs) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                const buttonContainer = document.querySelector(".perfil-form button");
                atualizarUsuario(buttonContainer);
            }
        });
    }
}

setEnterKeyListener();
