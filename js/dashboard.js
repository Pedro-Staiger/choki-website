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
        loadUserInfo(dados);
    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
    }
}

function loadUserInfo(userInfo) {
    // Header
    const headerProfileIcon = document.querySelector(".profile-picture b");
    headerProfileIcon.textContent = userInfo.username[0].toUpperCase();

    // Saudação
    const usernameField = document.querySelector("#nome-saudacao b");
    usernameField.textContent = userInfo.username;

    // Salva para usar nos cálculos de meta
    window._userInfo = userInfo;
}

async function getLeituras() {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/leitura/usuario/${userId}/hoje`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const leituras = await response.json();
        processarLeituras(leituras);
        generateGraphic(leituras);
    } catch (erro) {
        console.error("Erro ao buscar leituras:", erro);
        generateGraphic([]); // gráfico vazio em caso de erro
    }
}

function processarLeituras(leituras) {
    const userInfo = window._userInfo;

    // Total de energia hoje
    const totalKwh = leituras.reduce((acc, l) => acc + (l.energia_kwh || 0), 0);

    // Custo estimado (tarifa * kwh)
    const tarifa = userInfo?.tarifa_eletrica || 0;
    const custoHoje = totalKwh * tarifa;

    // Percentual da meta diária
    const metaDiaria = userInfo?.meta_diaria_kwh || 1;
    const percentualMeta = Math.min((totalKwh / metaDiaria) * 100, 100).toFixed(0);
    const nosPrazo = totalKwh <= metaDiaria;

    // Economia estimada (quanto falta para bater a meta mensal em reais)
    const metaMensal = userInfo?.meta_mensal_reais || 0;
    const diasNoMes = 30;
    const custoProjetado = custoHoje * diasNoMes;
    const economia = metaMensal - custoProjetado;

    // Atualiza os cards
    document.getElementById("card-consumo-hoje").textContent =
        `${totalKwh.toFixed(1)} kWh`;

    document.getElementById("card-custo-hoje").textContent =
        `R$ ${custoHoje.toFixed(2).replace(".", ",")}`;

    document.getElementById("card-meta").textContent =
        `${percentualMeta}%`;
    document.getElementById("card-meta-status").textContent =
        nosPrazo ? "no prazo" : "acima da meta";

    document.getElementById("card-economia").textContent =
        `R$ ${Math.abs(economia).toFixed(2).replace(".", ",")}`;
    document.getElementById("card-economia-variacao").textContent =
        economia >= 0 ? "dentro do orçamento" : "acima do orçamento";
}

async function getTopDispositivos() {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${serverUrl}/api/auth/leitura/usuario/${userId}/top`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const dados = await response.json();
        buildTopDispositivos(dados);
    } catch (erro) {
        console.error("Erro ao buscar top dispositivos:", erro);
    }
}

function buildTopDispositivos(dispositivos) {
    const container = document.getElementById("dispositivos-progress");
    container.innerHTML = "";

    if (dispositivos.length === 0) {
        container.innerHTML = `<p style="color:#a0b0a8;font-size:14px">Nenhum dado disponível</p>`;
        return;
    }

    // Total de potência de todos os dispositivos
    const totalPotencia = dispositivos.reduce((acc, d) => acc + d.potencia, 0);

    for (const d of dispositivos) {
        const percentual = ((d.potencia / totalPotencia) * 100).toFixed(0);
        const potenciaFormatada = Math.round(d.potencia); // remove as casas decimais

        const item = document.createElement("div");
        item.classList.add("dispositivo");

        item.innerHTML = `
            <div class="dispositivo-label">
                <h3>${d.nome}</h3>
                <h4>${potenciaFormatada}W</h4>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentual}%"></div>
            </div>
        `;

        container.appendChild(item);
    }
}

function generateGraphic(leituras = []) {
    const ctx = document.querySelector('.grafico-consumo').getContext('2d');

    // Agrupa por hora
    const consumoPorHora = new Array(24).fill(0);
    for (const leitura of leituras) {
        const hora = new Date(leitura.timestamp).getHours();
        consumoPorHora[hora] += leitura.energia_kwh || 0;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'oklch(92% .2 105 / 0.4)');
    gradient.addColorStop(1, 'oklch(92% .2 105 / 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`),
            datasets: [{
                data: consumoPorHora.map(v => parseFloat(v.toFixed(3))),
                borderColor: 'oklch(92% .2 105)',
                borderWidth: 2.5,
                backgroundColor: gradient,
                fill: 'origin',
                tension: 0.1,
                pointBackgroundColor: 'oklch(92% .2 105)',
                pointBorderColor: 'transparent',
                pointRadius: 3,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'oklch(92% .2 105)',
                pointHoverBorderColor: 'oklch(92% .2 105 / 0.12)',
                pointHoverBorderWidth: 2,
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'oklch(36% .06 195)',
                    titleColor: 'oklch(78% .04 160)',
                    bodyColor: 'oklch(97% .02 100)',
                    borderColor: 'oklch(42% .05 195)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: (item) => `${item.raw} kWh`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        color: '#a0b0a8',
                        font: { family: 'Sora', size: 11 }
                    }
                },
                y: {
                    display: false,
                    grid: { display: false },
                    min: 0,
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Inicialização — getUserInfo primeiro para ter os dados do usuário
// antes de processar as leituras
async function init() {
    await getUserInfo();
    await Promise.all([getLeituras(), getTopDispositivos()]);
}

init();