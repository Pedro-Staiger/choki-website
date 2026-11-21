function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");

    window.location = "../../index.html";
}