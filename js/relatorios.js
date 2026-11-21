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