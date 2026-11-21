const serverUrl = "https://choki-server.onrender.com";

function abrirModalAdicionarComodo() {
    document.getElementById("modal-adicionar-comodo").classList.add("ativo");
}

function fecharModalAdicionarComodo() {
    document.getElementById("modal-adicionar-comodo").classList.remove("ativo");
    document.getElementById("comodo-nome").value = "";
    document.getElementById("comodo-descricao").value = "";
    document.getElementById("comodo-alert").textContent = "";
}

document.getElementById("modal-adicionar-comodo").addEventListener("click", function (e) {
    if (e.target === this) fecharModalAdicionarComodo();
});

async function cadastrarComodo(btn) {
    const alert = document.getElementById("comodo-alert");
    const nome = document.getElementById("comodo-nome").value.trim();
    const descricao = document.getElementById("comodo-descricao").value.trim();
    const idUsuario = localStorage.getItem("userId");

    if (!nome || !descricao) {
        alert.style.color = "#d00000";
        alert.textContent = "Preencha todos os campos";
        return;
    }

    btn.textContent = "Salvando...";
    const lightLoader = buildLightIcon();
    lightLoader.classList.add("light-loader", "loading");
    btn.appendChild(lightLoader);
    btn.disabled = true;

    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/comodo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id_usuario: idUsuario,
                nome,
                descricao
            })
        });

        if (!response.ok) throw new Error();

        alert.style.color = "var(--primary)";
        alert.textContent = "Cômodo adicionado com sucesso!";
        btn.textContent = "Adicionar cômodo";
        btn.disabled = false;

        setTimeout(() => {
            fecharModalAdicionarComodo();
            refreshComodos();
        }, 1500);

    } catch {
        alert.style.color = "#d00000";
        alert.textContent = "Erro ao adicionar cômodo";
        btn.textContent = "Adicionar cômodo";
        btn.disabled = false;
    }
}

async function getComodos() {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/comodo/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const dados = await response.json();
        buildComodos(dados);
    } catch (erro) {
        console.error("Erro ao buscar cômodos:", erro);
    }
}

function buildComodos(comodos) {
    const container = document.querySelector(".comodos-grid");

    if (comodos.length != 0) {
        for (let comodo of comodos) {
            const comodoCard = document.createElement("div");
            comodoCard.classList.add("comodo-card");

            const iconContainer = document.createElement("div");
            iconContainer.classList.add("icon-container");
            const icon = buildComodoIcon();
            iconContainer.appendChild(icon);

            const comodoInfo = document.createElement("div");
            comodoInfo.classList.add("comodo-info");

            const comodoName = document.createElement("h3");
            comodoName.textContent = comodo.nome;

            const comodoDesc = document.createElement("p");
            comodoDesc.textContent = comodo.descricao;

            comodoInfo.appendChild(comodoName);
            comodoInfo.appendChild(comodoDesc);

            const botaoEditar = document.createElement("div");
            botaoEditar.classList.add("botao-editar");
            botaoEditar.addEventListener("click", () => abrirModalEditarComodo(comodo));

            const iconEditar = buildEditarIcon();
            botaoEditar.appendChild(iconEditar);

            comodoCard.appendChild(iconContainer);
            comodoCard.appendChild(comodoInfo);
            comodoCard.appendChild(botaoEditar);

            container.appendChild(comodoCard);
        }
    }

    const botaoAdicionar = document.createElement("div");
    botaoAdicionar.classList.add("comodo-adicionar");
    botaoAdicionar.addEventListener("click", () => abrirModalAdicionarComodo());

    const adicionarIcon = buildAdicionarIcon();
    const adicionarText = document.createElement("p");
    adicionarText.textContent = "Adicionar novo cômodo";

    botaoAdicionar.appendChild(adicionarIcon);
    botaoAdicionar.appendChild(adicionarText);

    container.appendChild(botaoAdicionar);
}

function refreshComodos() {
    const container = document.querySelector(".comodos-grid");
    const comodos = document.querySelectorAll(".comodo-card");
    if (comodos.length != 0) {
        for (let comodo of comodos) {
            container.removeChild(comodo);
        }
    }

    const botaoAdicionar = document.querySelector(".comodo-adicionar");
    container.removeChild(botaoAdicionar);

    getComodos();
}

function buildComodoIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M10 12V8.964" />
            <path d="M14 12V8.964" />
            <path d="M15 12a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1z" />
            <path d="M8.5 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-2" />
        </svg>
    `;
    return wrapper.firstElementChild;
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

function buildEditarIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil">
            <path
                d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
        </svg>
    `;

    return wrapper.firstElementChild;
}

function buildAdicionarIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-plus-icon lucide-plus">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    `;

    return wrapper.firstElementChild;
}

let comodoEditandoId = null;

function abrirModalEditarComodo(comodo) {
    comodoEditandoId = comodo.id;

    document.getElementById("edit-comodo-nome").value = comodo.nome;
    document.getElementById("edit-comodo-descricao").value = comodo.descricao;
    document.getElementById("edit-comodo-alert").textContent = "";

    document.getElementById("modal-editar-comodo").classList.add("ativo");
}

function fecharModalEditarComodo() {
    document.getElementById("modal-editar-comodo").classList.remove("ativo");
    comodoEditandoId = null;
    document.getElementById("edit-comodo-alert").textContent = "";
}

document.getElementById("modal-editar-comodo").addEventListener("click", function (e) {
    if (e.target === this) fecharModalEditarComodo();
});

async function salvarEdicaoComodo(btn) {
    const alert = document.getElementById("edit-comodo-alert");
    const nome = document.getElementById("edit-comodo-nome").value.trim();
    const descricao = document.getElementById("edit-comodo-descricao").value.trim();

    if (!nome || !descricao) {
        alert.style.color = "#d00000";
        alert.textContent = "Preencha todos os campos";
        return;
    }

    btn.textContent = "Salvando...";
    const lightLoader = buildLightIcon();
    lightLoader.classList.add("light-loader", "loading");
    btn.appendChild(lightLoader);
    btn.disabled = true;

    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/comodo/${comodoEditandoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nome, descricao })
        });

        if (!response.ok) throw new Error();

        alert.style.color = "var(--primary)";
        alert.textContent = "Cômodo atualizado com sucesso!";
        btn.textContent = "Salvar alterações";
        btn.disabled = false;

        setTimeout(() => {
            fecharModalEditarComodo();
            recarregarComodos();
        }, 1500);

    } catch {
        alert.style.color = "#d00000";
        alert.textContent = "Erro ao atualizar cômodo";
        btn.textContent = "Salvar alterações";
        btn.disabled = false;
    }
}

async function excluirComodo(btn) {
    const alert = document.getElementById("edit-comodo-alert");

    btn.textContent = "Excluindo...";
    btn.disabled = true;

    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/comodo/${comodoEditandoId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error();

        alert.style.color = "var(--primary)";
        alert.textContent = "Cômodo excluído com sucesso!";
        btn.textContent = "Excluir cômodo";
        btn.disabled = false;

        setTimeout(() => {
            fecharModalEditarComodo();
            recarregarComodos();
        }, 1500);

    } catch {
        alert.style.color = "#d00000";
        alert.textContent = "Erro ao excluir cômodo";
        btn.textContent = "Excluir cômodo";
        btn.disabled = false;
    }
}

function recarregarComodos() {
    const container = document.querySelector(".comodos-grid");
    container.innerHTML = "";
    getComodos();
}

getComodos();