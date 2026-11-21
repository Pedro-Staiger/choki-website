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

        loadUserChar(dados);
    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
    }
}

function loadUserChar(userInfo) {
    const headerProfileIcon = document.querySelector(".profile-picture b");
    headerProfileIcon.textContent = userInfo.username[0];
}

getUserInfo();

function abrirModal() {
    document.getElementById("modal-adicionar").classList.add("ativo");
}

function fecharModal() {
    document.getElementById("modal-adicionar").classList.remove("ativo");
    limparModal();
}

function limparModal() {
    document.getElementById("input-nome").value = "";
    document.getElementById("input-descricao").value = "";
    document.getElementById("input-horas").value = "";
    document.getElementById("input-dias").value = "";
    document.getElementById("modal-alert").textContent = "";
}

// Fecha ao clicar fora do modal
document.getElementById("modal-adicionar").addEventListener("click", function (e) {
    if (e.target === this) fecharModal();
});

async function cadastrarAparelho(btn) {
    const alert = document.getElementById("modal-alert");
    const nome = document.getElementById("input-nome").value.trim();
    const descricao = document.getElementById("input-descricao").value.trim();
    const horas = document.getElementById("input-horas").value.trim();
    const dias = document.getElementById("input-dias").value.trim();
    const idUsuario = localStorage.getItem("userId");

    if (!nome || !descricao || !horas || !dias) {
        alert.style.color = "#d00000";
        alert.textContent = "Preencha todos os campos";
        return;
    }

    if (isNaN(horas) || isNaN(dias)) {
        alert.style.color = "#d00000";
        alert.textContent = "Preencha os campos corretamente";
        return;
    }

    if (horas > 24 || dias > 30) {
        alert.style.color = "#d00000";
        alert.textContent = "Preencha os campos corretamente";
        return;
    }

    const lightLoader = buildLightIcon();
    lightLoader.classList.add("light-loader");
    lightLoader.classList.add("loading");

    alert.textContent = "";
    btn.textContent = "Salvando...";
    btn.appendChild(lightLoader);
    btn.disabled = true;

    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(serverUrl + "/api/auth/aparelho", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id_usuario: idUsuario,
                nome: nome,
                descricao: descricao,
                horas_uso_dia: Number(horas),
                dias_uso_mes: Number(dias)
            })
        });

        if (!response.ok) throw new Error();

        lightLoader.classList.remove("loading");

        alert.style.color = "var(--primary)";
        alert.textContent = "Dispositivo adicionado com sucesso!";
        btn.textContent = "Adicionar dispositivo";
        btn.disabled = false;

        setTimeout(() => {
            fecharModal();
            refreshAparelhos();
        }, 1500);

    } catch (error) {
        alert.style.color = "#d00000";
        alert.textContent = "Erro ao adicionar dispositivo";
        btn.textContent = "Adicionar dispositivo";
        btn.disabled = false;
    }
}

async function getAparelhos() {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/aparelho/${userId}`, {
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
        buildAparelhos(dados);
    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
    }
}

function buildAparelhos(aparelhos) {
    const container = document.querySelector(".dispositivos-grid");
    if (aparelhos.length != 0) {
        for (let aparelho of aparelhos) {
            const dispositivoCard = document.createElement("div");
            dispositivoCard.classList.add("dispositivo-card");

            const iconContainer = document.createElement("div");
            iconContainer.classList.add("icon-container");
            const icon = buildAparelhoIcon();
            iconContainer.appendChild(icon);
            iconContainer.setAttribute("onclick", `abrirModalDetalhes(${aparelho.id})`)

            const dispositivoInfo = document.createElement("div");
            dispositivoInfo.classList.add("dispositivo-info");

            const dispositivoName = document.createElement("h3");
            dispositivoName.textContent = aparelho.nome;

            const dispositivoDesc = document.createElement("p");
            dispositivoDesc.textContent = aparelho.descricao;

            dispositivoInfo.appendChild(dispositivoName);
            dispositivoInfo.appendChild(dispositivoDesc);

            const botaoEditar = document.createElement("div");
            botaoEditar.classList.add("botao-editar");
            botaoEditar.addEventListener("click", () => abrirModalEditar(aparelho));

            const iconEditar = buildEditarIcon();
            botaoEditar.appendChild(iconEditar);

            dispositivoCard.appendChild(iconContainer);
            dispositivoCard.appendChild(dispositivoInfo);
            dispositivoCard.appendChild(botaoEditar);

            container.appendChild(dispositivoCard);
        }
    }

    const botaoAdicionar = document.createElement("button");
    botaoAdicionar.classList.add("dispositivo-adicionar");
    botaoAdicionar.setAttribute("onclick", "abrirModal()");

    const adicionarText = document.createElement("p");
    adicionarText.textContent = "Adicionar novo dispositivo";

    const adicionarIcon = buildAdicionarIcon();

    botaoAdicionar.appendChild(adicionarIcon);
    botaoAdicionar.appendChild(adicionarText);

    container.appendChild(botaoAdicionar);

}

function refreshAparelhos() {
    const container = document.querySelector(".dispositivos-grid");
    const aparelhos = document.querySelectorAll(".dispositivo-card");
    if (aparelhos.length != 0) {
        for (let aparelho of aparelhos) {
            container.removeChild(aparelho);
        }
    }

    const botaoAdicionar = document.querySelector(".dispositivo-adicionar");
    container.removeChild(botaoAdicionar);

    getAparelhos();
}

function buildAparelhoIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="lucide lucide-circle-power-icon lucide-circle-power">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 7v4" />
            <path d="M7.998 9.003a5 5 0 1 0 8-.005" />
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

let aparelhoEditandoId = null;

function abrirModalEditar(aparelho) {
    aparelhoEditandoId = aparelho.id;

    document.getElementById("edit-nome").value = aparelho.nome;
    document.getElementById("edit-descricao").value = aparelho.descricao;
    document.getElementById("edit-horas").value = aparelho.horas_uso_dia;
    document.getElementById("edit-dias").value = aparelho.dias_uso_mes;

    popularSelectComodos(aparelho.id_comodo);

    document.getElementById("modal-editar").classList.add("ativo");
}

function fecharModalEditar() {
    document.getElementById("modal-editar").classList.remove("ativo");
    aparelhoEditandoId = null;
    document.getElementById("edit-alert").textContent = "";
}

document.getElementById("modal-editar").addEventListener("click", function (e) {
    if (e.target === this) fecharModalEditar();
});

async function popularSelectComodos(idComodoAtual) {
    const select = document.getElementById("edit-comodo");
    select.innerHTML = '<option value="">Sem cômodo</option>';

    try {
        const idUsuario = localStorage.getItem("userId");
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/comodo/${idUsuario}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const comodos = await response.json();

        for (let comodo of comodos) {
            const option = document.createElement("option");
            option.value = comodo.id;
            option.textContent = comodo.nome;
            if (comodo.id === idComodoAtual) option.selected = true;
            select.appendChild(option);
        }
    } catch {
        console.error("Erro ao carregar cômodos");
    }
}

async function salvarEdicaoAparelho(btn) {
    const alert = document.getElementById("edit-alert");
    const nome = document.getElementById("edit-nome").value.trim();
    const descricao = document.getElementById("edit-descricao").value.trim();
    const horas = document.getElementById("edit-horas").value.trim();
    const dias = document.getElementById("edit-dias").value.trim();
    const idComodo = document.getElementById("edit-comodo").value || null;

    if (!nome || !descricao || !horas || !dias) {
        alert.style.color = "#d00000";
        alert.textContent = "Preencha todos os campos";
        return;
    }

    if (isNaN(horas) || isNaN(dias)) {
        alert.style.color = "#d00000";
        alert.textContent = "Horas e dias devem ser números";
        return;
    }

    btn.textContent = "Salvando...";
    const lightLoader = buildLightIcon();
    lightLoader.classList.add("light-loader", "loading");
    btn.appendChild(lightLoader);
    btn.disabled = true;

    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/aparelho/${aparelhoEditandoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nome,
                descricao,
                horas_uso_dia: Number(horas),
                dias_uso_mes: Number(dias),
                id_comodo: idComodo
            })
        });

        if (!response.ok) throw new Error();

        alert.style.color = "var(--primary)";
        alert.textContent = "Dispositivo atualizado com sucesso!";
        btn.textContent = "Salvar alterações";
        btn.disabled = false;

        setTimeout(() => {
            fecharModalEditar();
            refreshAparelhos();
        }, 1500);

    } catch {
        alert.style.color = "#d00000";
        alert.textContent = "Erro ao atualizar dispositivo";
        btn.textContent = "Salvar alterações";
        btn.disabled = false;
    }
}

async function excluirAparelho(btn) {
    const alert = document.getElementById("edit-alert");

    btn.textContent = "Excluindo...";
    btn.disabled = true;

    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/aparelho/${aparelhoEditandoId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error();

        alert.style.color = "var(--primary)";
        alert.textContent = "Dispositivo excluído com sucesso!";
        btn.textContent = "Excluir dispositivo";
        btn.disabled = false;

        setTimeout(() => {
            fecharModalEditar();
            refreshAparelhos();
        }, 1500);

    } catch {
        alert.style.color = "#d00000";
        alert.textContent = "Erro ao excluir dispositivo";
        btn.textContent = "Excluir dispositivo";
        btn.disabled = false;
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

getAparelhos();