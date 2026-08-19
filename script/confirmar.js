document.addEventListener('DOMContentLoaded', () => {
  const radioSim = document.getElementById('vai_sim');
  const radioNao = document.getElementById('vai_nao');
  const secaoSim = document.getElementById('secao-sim');
  const secaoNao = document.getElementById('secao-nao');
  const form = document.getElementById('rsvpForm');
  
  const selectAdultos = document.getElementById('adultos');
  const selectCriancas = document.getElementById('criancas_ate_11');

  // Alterna a exibição das seções
  function atualizarVisualizacao() {
    if (radioSim && radioSim.checked) {
      secaoSim.style.display = 'block';
      secaoNao.style.display = 'none';
    } else if (radioNao && radioNao.checked) {
      secaoSim.style.display = 'none';
      secaoNao.style.display = 'block';
    }
  }

  if (radioSim && radioNao) {
    radioSim.addEventListener('change', atualizarVisualizacao);
    radioNao.addEventListener('change', atualizarVisualizacao);
  }

  // Lê parâmetros de URL (?resposta=sim ou ?resposta=nao)
  const params = new URLSearchParams(window.location.search);
  const resposta = params.get('resposta');
  
  if (resposta === 'sim' && radioSim) {
    radioSim.checked = true;
  } else if (resposta === 'nao' && radioNao) {
    radioNao.checked = true;
  }
  atualizarVisualizacao();

  // Função auxiliar para buscar a URL no config.json
  async function buscarConfig() {
    const res = await fetch('config.json');
    if (!res.ok) {
      throw new Error('Não foi possível carregar o arquivo config.json');
    }
    return await res.json();
  }

  // Envio do formulário
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const btn = document.querySelector('.btn-submit');
      btn.innerText = "Enviando resposta...";
      btn.disabled = true;

      try {
        // 1. Lê a chave do arquivo json
        const config = await buscarConfig();
        const sheetdbUrl = config.sheetdb_url;

        const nome = document.getElementById('nome').value.trim();
        const sobrenome = document.getElementById('sobrenome').value.trim();
        const vai = radioSim.checked ? "Sim" : "Não";
        
        const qtdAdultos = (vai === 'Sim' && selectAdultos) ? selectAdultos.value : "0";
        const qtdCriancas = (vai === 'Sim' && selectCriancas) ? selectCriancas.value : "0";
        
        const dados = {
          nome: nome,
          sobrenome: sobrenome,
          vai: vai,
          adultos: qtdAdultos,
          criancas_ate_11: qtdCriancas,
          data_envio: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
        };

        // 2. Envia para a URL obtida do json
        const respostaEnvio = await fetch(sheetdbUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [dados] })
        });

       if (respostaEnvio.ok) {
        // Pega os elementos de texto da nossa caixinha
        const tituloModal = document.getElementById('modal-title-text');
        const textoModal = document.getElementById('modal-desc-text');

        // Verifica se a pessoa marcou "Sim" ou "Não" e muda a mensagem
        if (vai === "Sim") {
            tituloModal.innerText = "Missão Cumprida! 🦸‍♀️";
            textoModal.innerText = "Sua presença superpoderosa foi confirmada com sucesso! Nos vemos na festa!";
        } else {
            tituloModal.innerText = "Puxa vida... 🥺";
            textoModal.innerText = "Sentiremos muito a sua falta na nossa celebração superpoderosa! Obrigado por avisar.";
        }

        // Agora sim, mostra a caixinha com o texto correto
        document.getElementById("custom-alert").style.display = "flex";
        
    } else {
        throw new Error('Erro na resposta do SheetDB');
    }
      } catch (err) {
        console.error("Erro ao enviar:", err);
        alert("Erro ao enviar confirmação. Tente novamente.");
        btn.innerText = "Confirmar Resposta";
        btn.disabled = false;
      }
    });
  }
 // Aguarda o clique no botão FECHAR do modal
document.getElementById("fechar-modal-btn").addEventListener("click", function() {
    // Esconde o pop-up
    document.getElementById("custom-alert").style.display = "none";
    
    // Redireciona para o index
    window.location.href = "index.html"; 
});

});