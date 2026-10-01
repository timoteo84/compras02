const icons = {
Alimentos: "■",
Bebidas: "■",
Higiene: "■",
Limpeza: "■"
};
let items = JSON.parse(
localStorage.getItem("compras-items") || "null"
) || [
{ id: 1, name: "Arroz", qty: 1, unit: "Pacote", category: "Alimentos", done: false, note: "" },
{ id: 2, name: "Feijão", qty: 1, unit: "Kg", category: "Alimentos", done: false, note: "" },
{ id: 3, name: "Óleo de soja", qty: 2, unit: "Unidade", category: "Alimentos", done: true, note: "" },
{ id: 4, name: "Leite", qty: 3, unit: "Litro", category: "Alimentos", done: true, note: "" },
{ id: 5, name: "Macarrão", qty: 2, unit: "Pacote", category: "Alimentos", done: false, note: "" },
{ id: 6, name: "Açúcar", qty: 1, unit: "Kg", category: "Alimentos", done: false, note: "" },
{ id: 7, name: "Coca-Cola", qty: 1, unit: "2 Litros", category: "Bebidas", done: false, note: "" },
{ id: 8, name: "Guaraná", qty: 1, unit: "2 Litros", category: "Bebidas", done: false, note: "" },
{ id: 9, name: "Suco", qty: 1, unit: "1 Litro", category: "Bebidas", done: false, note: "" },
{ id: 10, name: "Água", qty: 6, unit: "500 ml", category: "Bebidas", done: false, note: "" }
];
let filter = "all";
let categoryFilter = null;
function save() {
localStorage.setItem("compras-items", JSON.stringify(items));
}
const USERS_KEY = "compras-users";
function getUsers() {
return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function showAuth(type) {
document.getElementById("signupForm").style.display =
type === "signup" ? "block" : "none";
document.getElementById("loginForm").style.display =
type === "login" ? "block" : "none";
document.getElementById("signupTab").classList.toggle("active", type === "signup");
document.getElementById("loginTab").classList.toggle("active", type === "login");
document.getElementById("authMessage").textContent = "";
}
function authMsg(msg) {
document.getElementById("authMessage").textContent = msg;
}
function signup() {
const name = document.getElementById("signupName").value.trim();
const email = document.getElementById("signupEmail").value.trim().toLowerCase();
const password = document.getElementById("signupPassword").value;
const confirm = document.getElementById("signupConfirm").value;
if (!name || !email || !password || !confirm) {
authMsg("Preencha todos os campos.");
return;
}
if (!email.includes("@")) {
authMsg("Digite um e-mail válido.");
return;
}
if (password.length < 6) {
authMsg("A senha deve ter pelo menos 6 caracteres.");
return;
}
if (password !== confirm) {
authMsg("As senhas não são iguais.");
return;
}
const users = getUsers();
if (users.some(u => u.email === email)) {
authMsg("Este e-mail já possui cadastro.");
showAuth("login");
return;
}
const user = { name: name, email: email, password: password };
users.push(user);
localStorage.setItem(USERS_KEY, JSON.stringify(users));
localStorage.setItem("compras-current-user", email);
startApp(user);
}
function login() {
const email = document.getElementById("loginEmail").value.trim().toLowerCase();
const password = document.getElementById("loginPassword").value;
const user = getUsers().find(
u => u.email === email && u.password === password
);
if (!user) {
authMsg("E-mail ou senha incorretos.");
return;

}
localStorage.setItem("compras-current-user", email);
startApp(user);
}
function startApp(user) {
document.getElementById("authScreen").style.display = "none";
document.getElementById("appContent").style.display = "block";
document.getElementById("userName").textContent =
"Olá, " + user.name.split(" ")[0] + " ■";
render();
}
function logout() {
localStorage.removeItem("compras-current-user");
document.getElementById("appContent").style.display = "none";
document.getElementById("authScreen").style.display = "flex";
showAuth("login");
}
function checkSession() {
const email = localStorage.getItem("compras-current-user");
const user = getUsers().find(u => u.email === email);
if (user) {
startApp(user);
} else {
document.getElementById("authScreen").style.display = "flex";
document.getElementById("appContent").style.display = "none";
}
}
function render() {
const search = document.getElementById("search");
if (!search) return;
const q = search.value.toLowerCase();
let shown = items.filter(x => x.name.toLowerCase().includes(q));
if (filter === "pending") shown = shown.filter(x => !x.done);
if (filter === "done") shown = shown.filter(x => x.done);
if (categoryFilter) shown = shown.filter(x => x.category === categoryFilter);
const list = document.getElementById("list");
list.innerHTML = shown.length
? shown.map(x => `
<div class="item">
<div class="item-img">${icons[x.category] || "■"}</div>
<div class="${x.done ? "done-text" : ""}">
<h3>${escapeHtml(x.name)}</h3>
<p>${x.qty} ${escapeHtml(x.unit)}${x.note ? " • " + escapeHtml(x.note) : ""}</p>
</div>
<div style="display:flex;align-items:center;gap:7px">
<div class="qty">
<button onclick="changeQty(${x.id}, -1)">−</button>
<span>${x.qty}</span>
<button onclick="changeQty(${x.id}, 1)">■</button>
</div>
<button class="check ${x.done ? "done" : ""}" onclick="toggle(${x.id})">
${x.done ? "✓" : ""}
</button>
</div>
</div>
`).join("")
: `<div class="empty">Nenhum produto encontrado.<br><span class="small">Adicione um item para começar.</span></
div>`;
const done = items.filter(x => x.done).length;
const total = items.length;
const pct = total ? (done / total) * 100 : 0;
document.getElementById("progressBar").style.width = pct + "%";
document.getElementById("progressText").textContent = `${done} de ${total} comprados`;
document.getElementById("countText").textContent =
`${total} ${total === 1 ? "item" : "itens"}`;
["Alimentos", "Bebidas", "Higiene", "Limpeza"].forEach(c => {
const element = document.getElementById("cat" + c);
if (element) {
element.textContent =
items.filter(x => x.category === c).length + " itens";
}
});
}
function toggle(id) {
const item = items.find(i => i.id === id);
if (!item) return;
item.done = !item.done;
save();
render();
}
function changeQty(id, d) {
const item = items.find(i => i.id === id);
if (!item) return;
item.qty = Math.max(1, item.qty + d);
save();
render();
}
function setFilter(f, el) {

filter = f;
categoryFilter = null;
document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
el.classList.add("active");
render();
}
function filterCategory(c) {
categoryFilter = c;
filter = "all";
document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
document.querySelector('[data-filter="all"]').classList.add("active");
showToast("Categoria: " + c);
render();
}
function openModal() {
document.getElementById("modal").classList.add("open");
setTimeout(() => document.getElementById("name").focus(), 100);
}
function closeModal() {
document.getElementById("modal").classList.remove("open");
}
function addProduct() {
const name = document.getElementById("name").value.trim();
if (!name) {
showToast("Digite o nome do produto");
return;
}
const qty = Math.max(1, +document.getElementById("qty").value || 1);
const unit = document.getElementById("unit").value;
const category = document.getElementById("category").value;
const note = document.getElementById("note").value.trim();
items.push({
id: Date.now(),
name,
qty,
unit,
category,
done: false,
note
});
save();
render();
closeModal();
document.getElementById("name").value = "";
document.getElementById("note").value = "";
document.getElementById("qty").value = 1;
showToast("Produto adicionado!");
}
function clearDone() {
items = items.filter(x => !x.done);
save();
render();
showToast("Itens comprados removidos");
}
async function shareList() {
const text =
"Minha lista de compras:\n" +
items.map(x => `${x.done ? "✓" : "■"} ${x.name} — ${x.qty} ${x.unit}`).join("\n");
if (navigator.share) {
try {
await navigator.share({
title: "Minha lista de compras",
text: text
});
} catch (e) {}
} else {
await navigator.clipboard?.writeText(text);
showToast("Lista copiada!");
}
}
function showToast(t) {
const e = document.getElementById("toast");
e.textContent = t;
e.classList.add("show");
clearTimeout(window.tt);
window.tt = setTimeout(() => e.classList.remove("show"), 2200);
}
function escapeHtml(s) {
return s.replace(
/[&<>"']/g,
m => ({
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#039;"
}[m])
);
}

document.getElementById("modal")?.addEventListener("click", e => {
if (e.target.id === "modal") closeModal();
});
checkSession();