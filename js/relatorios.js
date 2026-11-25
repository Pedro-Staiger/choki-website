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

        if (!requisicao.ok) throw new Error(`Erro ${requisicao.status}`);

        const dados = await requisicao.json();
        loadUserChar(dados);
        return dados;
    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
        return null;
    }
}

function loadUserChar(userInfo) {
    const headerProfileIcon = document.querySelector(".profile-picture b");
    headerProfileIcon.textContent = userInfo.username[0].toUpperCase();
}

async function getComodos(periodo) {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("accessToken");

        const response = await fetch(
            `${serverUrl}/api/auth/leitura/usuario/${userId}/comodos?periodo=${periodo}`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

// Calcula o stroke-dashoffset para o circular progress
// circunferência = 314, offset = 314 * (1 - percentual)
function calcOffset(percentual) {
    return (314 * (1 - Math.min(percentual, 1))).toFixed(1);
}

function atualizarCard({ periodo, comodos, metaKwh, tarifa, idPercent, idKwhTotal, idReaisTotal }) {
    // Total do período
    const totalKwh = comodos.reduce((acc, c) => acc + c.energia_kwh, 0);
    const totalReais = totalKwh * tarifa;

    // Atualiza totais no header
    document.getElementById(idKwhTotal).textContent = `${totalKwh.toFixed(2)} kWh`;
    document.getElementById(idReaisTotal).textContent =
        `R$ ${totalReais.toFixed(2).replace(".", ",")}`;

    // Percentual da meta
    const percentual = metaKwh > 0 ? totalKwh / metaKwh : 0;
    const percentualTexto = Math.min(Math.round(percentual * 100), 100);

    // Atualiza circular progress
    const card = document.getElementById(`card-${periodo}`);
    card.querySelector(".circular-percent").textContent = `${percentualTexto}%`;
    card.querySelector(".circular-progress svg circle:last-child")
        .setAttribute("stroke-dashoffset", calcOffset(percentual));

    // Atualiza barras por cômodo
    const barrasContainer = card.querySelector(".relatorio-barras");
    barrasContainer.innerHTML = "";

    if (comodos.length === 0) {
        barrasContainer.innerHTML = `<p style="color:#a0b0a8;font-size:13px">Nenhum dado disponível</p>`;
        return;
    }

    const maxKwh = comodos[0].energia_kwh; // já vem ordenado pelo back

    comodos.slice(0, 3).forEach(c => {
        const pct = maxKwh > 0 ? (c.energia_kwh / totalKwh * 100).toFixed(0) : 0;

        const item = document.createElement("div");
        item.classList.add("relatorio-barra-item");
        item.innerHTML = `
            <div class="barra-label">
                <span>${c.comodo}</span>
                <span>${pct}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${pct}%"></div>
            </div>
        `;
        barrasContainer.appendChild(item);
    });

    card.classList.add("carregado");
}

async function init() {
    const userInfo = await getUserInfo();
    if (!userInfo) return;

    const tarifa = userInfo.tarifa_eletrica || 0;
    const metaDiariaKwh = userInfo.meta_diaria_kwh || 1;
    const metaMensalReais = userInfo.meta_mensal_reais || 0;
    const metaMensalKwh = tarifa > 0 ? metaMensalReais / tarifa : metaDiariaKwh * 30;
    const metaSemanalKwh = metaDiariaKwh * 7;
    const metaAnualKwh = metaMensalKwh * 12;

    // Busca todos os períodos em paralelo
    const [hoje, semanal, mensal, anual] = await Promise.all([
        getComodos("hoje"),
        getComodos("semanal"),
        getComodos("mensal"),
        getComodos("anual")
    ]);

    atualizarCard({
        periodo: "hoje",
        comodos: hoje,
        metaKwh: metaDiariaKwh,
        tarifa,
        idKwhTotal: "total-kwh-hoje",
        idReaisTotal: "total-reais-hoje"
    });

    atualizarCard({
        periodo: "semanal",
        comodos: semanal,
        metaKwh: metaSemanalKwh,
        tarifa,
        idKwhTotal: "total-kwh-semanal",
        idReaisTotal: "total-reais-semanal"
    });

    atualizarCard({
        periodo: "mensal",
        comodos: mensal,
        metaKwh: metaMensalKwh,
        tarifa,
        idKwhTotal: "total-kwh-mensal",
        idReaisTotal: "total-reais-mensal"
    });

    atualizarCard({
        periodo: "anual",
        comodos: anual,
        metaKwh: metaAnualKwh,
        tarifa,
        idKwhTotal: "total-kwh-anual",
        idReaisTotal: "total-reais-anual"
    });
}

init();