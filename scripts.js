const ENDPOINT = 'https://crudcrud.com/api/8a973d65bd384412860a35f2eb3acbe2';
const API_URL = `${ENDPOINT}/clientes`;
 
const form = document.getElementById('form-cliente');
const btnSalvar = document.getElementById('btn-salvar');
const lista = document.getElementById('lista-clientes');
const vazio = document.getElementById('vazio');
const contador = document.getElementById('contador');
const mensagem = document.getElementById('mensagem');
 
// ===== Utilitários =====
function mostrarMensagem(texto, tipo = '') {
  mensagem.textContent = texto;
  mensagem.className = `status ${tipo}`.trim();
}
 
function endpointConfigurado() {
  return !ENDPOINT.includes('COLE_AQUI');
}
 
// ===== Requisições (Fetch API) =====
 
// GET: busca todos os clientes
async function listarClientes() {
  const resposta = await fetch(API_URL);
  if (!resposta.ok) throw new Error(`GET falhou: HTTP ${resposta.status}`);
  return resposta.json();
}
 
// POST: cria um cliente
async function criarCliente(cliente) {
  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!resposta.ok) throw new Error(`POST falhou: HTTP ${resposta.status}`);
  return resposta.json();
}
 
// DELETE: remove um cliente pelo _id
async function excluirCliente(id) {
  const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!resposta.ok) throw new Error(`DELETE falhou: HTTP ${resposta.status}`);
  // O CrudCrud responde sem corpo no DELETE, por isso não chamamos resposta.json()
}
 
// ===== Renderização =====
function criarItem(cliente) {
  const item = document.createElement('li');
  item.className = 'cliente';
  item.dataset.id = cliente._id;
 
  const dados = document.createElement('div');
  dados.className = 'dados';
 
  // textContent evita injetar HTML vindo da API
  const nome = document.createElement('strong');
  nome.textContent = cliente.nome;
 
  const email = document.createElement('span');
  email.textContent = cliente.email;
 
  dados.append(nome, email);
 
  const btnExcluir = document.createElement('button');
  btnExcluir.type = 'button';
  btnExcluir.className = 'excluir';
  btnExcluir.textContent = 'Excluir';
  btnExcluir.setAttribute('aria-label', `Excluir ${cliente.nome}`);
 
  item.append(dados, btnExcluir);
  return item;
}
 
function renderizarLista(clientes) {
  lista.replaceChildren(...clientes.map(criarItem));
  contador.textContent = clientes.length;
  vazio.hidden = clientes.length > 0;
}
 
async function carregarClientes() {
  try {
    const clientes = await listarClientes();
    console.log('Clientes recebidos:', clientes);
    renderizarLista(clientes);
  } catch (erro) {
    console.error(erro);
    mostrarMensagem('Não foi possível carregar os clientes. Confira o endpoint e sua conexão.', 'erro');
  }
}
 
// ===== Eventos =====
form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
 
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
 
  const cliente = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
  };
 
  btnSalvar.disabled = true;
  mostrarMensagem('Salvando...', 'carregando');
 
  try {
    const criado = await criarCliente(cliente);
    console.log('Cliente criado:', criado);
    form.reset();
    mostrarMensagem('Cliente cadastrado.', 'ok');
    await carregarClientes();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem('Não foi possível cadastrar o cliente. Tente novamente.', 'erro');
  } finally {
    btnSalvar.disabled = false;
  }
});
 
// Delegação de eventos: um único listener cuida de todos os botões "Excluir"
lista.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('.excluir');
  if (!botao) return;
 
  const item = botao.closest('.cliente');
  botao.disabled = true;
 
  try {
    await excluirCliente(item.dataset.id);
    console.log('Cliente excluído:', item.dataset.id);
    mostrarMensagem('Cliente excluído.', 'ok');
    await carregarClientes();
  } catch (erro) {
    console.error(erro);
    botao.disabled = false;
    mostrarMensagem('Não foi possível excluir o cliente. Tente novamente.', 'erro');
  }
});
 
// ===== Início =====
document.addEventListener('DOMContentLoaded', () => {
  if (!endpointConfigurado()) {
    mostrarMensagem('Configure o ENDPOINT no topo do scripts.js com o endereço gerado no crudcrud.com.', 'erro');
    form.querySelectorAll('input, button').forEach((el) => (el.disabled = true));
    return;
  }
  carregarClientes();
});
 