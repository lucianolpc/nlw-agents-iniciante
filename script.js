const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");


// Converte texto Markdown para HTML
// Usando a biblioteca showdown.js
const markDownToHTML = (markDownText) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(markDownText);
}


const askAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const questionText = `
    ## Especialidade
    Você é um especialista assistente para o jogo ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, dicas e truques.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
    - Considere a data atual ${new Date().toLocaleDateString()}.
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existem no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres. 
    - Responda em markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    Pergunta do usuário: "Como construir uma picareta no Minecraft?"
    Resposta: "Para construir uma picareta no Minecraft, você precisa de:\n\n- 3 tábuas de madeira e \n- 2 gravetos.\n\n Coloque as tábuas na linha superior da bancada de trabalho, os paus no meio e na parte inferior do centro para criar a picareta."

    ---
    Aqui está a pergunta do usuário: ${question}
  `;

  const contents = [{
    role: "user",
    parts: [{
      text: questionText
    }],
  }];

  const tools = [{
    google_search: {},
  }];

  // Chamada para a API
  const response = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

const sendForm = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == '' || game == '' || question == '') {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    // Perguntar para a IA
    const text = await askAI(question, game, apiKey);
    aiResponse.querySelector('.response-content').innerHTML = markDownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
}

form.addEventListener('submit', sendForm);