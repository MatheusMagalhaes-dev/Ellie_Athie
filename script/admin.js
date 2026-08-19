// Função auxiliar para ler o config.json
async function buscarConfig() {
  const res = await fetch('config.json');
  if (!res.ok) {
    throw new Error('Erro ao carregar o arquivo config.json');
  }
  return await res.json();
}

// Converte o texto da senha digitada em Hash SHA-256
async function gerarHash(texto) {
  const msgUint8 = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Autenticação
async function autenticar() {
  const inputSenha = document.getElementById('senhaAdmin').value;
  
  try {
    const config = await buscarConfig();
    const hashDigitado = await gerarHash(inputSenha);

    if (hashDigitado === config.senha_hash) {
      document.getElementById('login-box').style.display = 'none';
      document.getElementById('admin-content').style.display = 'block';
      carregarDados();
    } else {
      alert("Senha incorreta!");
      document.getElementById('senhaAdmin').value = '';
    }
  } catch (erro) {
    console.error(erro);
    alert("Erro ao ler as configurações do sistema.");
  }
}

// Carregar e listar os dados
async function carregarDados() {
  const tbody = document.getElementById('tabela-corpo');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando respostas...</td></tr>';

  try {
    const config = await buscarConfig();
    const res = await fetch(config.sheetdb_url);
    const data = await res.json();

    let adultos = 0, c11 = 0, confirmados = 0, naoVao = 0;
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhuma confirmação até agora.</td></tr>';
      return;
    }

    data.forEach(item => {
      const vai = item.vai === 'Sim';
      if (vai) {
        confirmados++;
        adultos += parseInt(item.adultos) || 0;
        c11 += parseInt(item.criancas_ate_11) || 0;
      } else {
        naoVao++;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.nome || ''} ${item.sobrenome || ''}</strong></td>
        <td><span class="badge ${vai ? 'badge-sim' : 'badge-nao'}">${item.vai || '-'}</span></td>
        <td>${item.adultos || 0}</td>
        <td>${item.criancas_ate_11 || 0}</td>
        <td style="color:#777; font-size:0.8rem;">${item.data_envio || '-'}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('total-confirmados').innerText = confirmados;
    document.getElementById('total-adultos').innerText = adultos;
    document.getElementById('total-c11').innerText = c11;
    document.getElementById('total-nao').innerText = naoVao;

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erro ao buscar dados da planilha.</td></tr>';
  }
}