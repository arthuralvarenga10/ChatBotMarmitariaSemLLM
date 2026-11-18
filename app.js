/**
 * ==============================================================================
 * CHATBOT RESTAURANTE DE MARMITAS (100% CLIENT-SIDE JAVASCRIPT - SEM LLM)
 * ==============================================================================
 * Módulos integrados:
 * 1. Cardápio diário com itens e preços por dia da semana
 * 2. Guardrails (Detecção de injeção de prompt, jailbreak, comandos maliciosos)
 * 3. Tokenizador e Pré-Processamento NLP (Stopwords, normalização, acentos)
 * 4. Vetorização TF-IDF e Similaridade de Cossenos
 * 5. Laya Decision Layer (Classificação em camadas de decisão para intent routing)
 * 6. Motor ELIZA 1960 (Regex decomposition, reassembly e reflexão de pronomes)
 * 7. Extração de Entidades: Produtos, Temperos (remover/adicionar) e Ponto de cozimento
 * 8. Gerenciador de Carrinho e Cálculo com Taxa de Entrega
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. BASE DE DADOS DO RESTAURANTE (CARDÁPIO POR DIA DA SEMANA)
// ------------------------------------------------------------------------------
const DELIVERY_FEE = 5.00;

const MENU_DATA = {
  segunda: [
    { id: "m_virado", name: "Virado à Paulista", price: 22.00, desc: "Arroz, tutu de feijão, bisteca suína, couve refogada e ovo frito" },
    { id: "m_frango_grelhado", name: "Marmita Frango Grelhado", price: 19.50, desc: "Filé de frango grelhado suculento, arroz integral, feijão e legumes" },
    { id: "m_bife_vaca", name: "Marmita Bife de Vaca", price: 24.00, desc: "Bife bovino acebolado, arroz soltinho, feijão carioca e salada" }
  ],
  terca: [
    { id: "m_bife_vaca", name: "Marmita Bife de Vaca", price: 24.00, desc: "Bife bovino acebolado, arroz soltinho, feijão carioca e salada" },
    { id: "m_panqueca", name: "Panqueca de Carne Moída", price: 21.00, desc: "Duas panquecas recheadas com molho de tomate caseiro e queijo" },
    { id: "m_frango_assado", name: "Frango Assado com Batatas", price: 20.00, desc: "Sobrecoxa assada dourada com batatas coradas e arroz" }
  ],
  quarta: [
    { id: "m_feijoada", name: "Feijoada Completa Tradicional", price: 28.00, desc: "Feijoada com carnes nobres, arroz, couve refogada, farofa e laranja" },
    { id: "m_bife_vaca", name: "Marmita Bife de Vaca", price: 24.00, desc: "Bife bovino acebolado, arroz soltinho, feijão carioca e purê" },
    { id: "m_frango_grelhado", name: "Marmita Frango Grelhado", price: 19.50, desc: "Filé de frango grelhado, arroz, feijão e salada fresca" }
  ],
  quinta: [
    { id: "m_lasanha", name: "Lasanha à Bolonhesa", price: 25.00, desc: "Massa artesanal intercalada com molho bolonhesa, presunto e queijo" },
    { id: "m_bife_vaca", name: "Marmita Bife de Vaca", price: 24.00, desc: "Bife bovino grelhado, arroz, feijão preto e mandioca frita" },
    { id: "m_estrogonofe_frango", name: "Estrogonofe de Frango", price: 22.50, desc: "Clássico com champignon, arroz branco e batata palha crocante" }
  ],
  sexta: [
    { id: "m_peixe_grelhado", name: "Filé de Peixe Grelhado", price: 26.00, desc: "Filé de tilápia com ervas finas, arroz com brócolis e pirão" },
    { id: "m_bife_vaca", name: "Marmita Bife de Vaca", price: 24.00, desc: "Bife de alcatra na chapa, arroz, feijão e farofa crocante" },
    { id: "m_feijoada", name: "Feijoada Light Individual", price: 28.00, desc: "Feijão preto magro com lombo e paio, couve e arroz" }
  ],
  sabado: [
    { id: "m_feijoada", name: "Feijoada Especial de Sábado", price: 32.00, desc: "Feijoada farta com bisteca, torresmo, couve, arroz e vinagrete" },
    { id: "m_costela", name: "Costela Bovina Assada", price: 29.00, desc: "Costela assada lentamente com mandioca cozida e arroz" },
    { id: "m_bife_vaca", name: "Marmita Bife de Vaca", price: 24.00, desc: "Bife acebolado com arroz, feijão e batatas fritas" }
  ],
  domingo: [
    { id: "m_frango_familia", name: "Frango Assado com Polenta", price: 27.00, desc: "Frango de domingo assado, polenta frita e maionese artesanal" },
    { id: "m_bife_vaca", name: "Marmita Bife de Vaca", price: 24.00, desc: "Bife bovino ao molho madeira, arroz e purê de batatas" },
    { id: "m_massa_artesanal", name: "Nhoque ao Sugo c/ Almôndegas", price: 25.00, desc: "Nhoque de batata artesanal, molho sugo e 3 almôndegas recheadas" }
  ]
};

// Dias em português
const DAY_NAMES = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo"
};

// Aliases para busca de produtos no cardápio
const PRODUCT_ALIASES = [
  { match: ["bife de vaca", "bife bovino", "bife", "carne", "alcatra", "carne bovina", "bife acebolado"], id: "m_bife_vaca", genericName: "Bife de Vaca" },
  { match: ["virado", "virado a paulista", "virado paulista"], id: "m_virado", genericName: "Virado à Paulista" },
  { match: ["frango grelhado", "peito de frango", "frango"], id: "m_frango_grelhado", genericName: "Frango Grelhado" },
  { match: ["panqueca", "panqueca de carne"], id: "m_panqueca", genericName: "Panqueca de Carne" },
  { match: ["frango assado", "sobrecoxa"], id: "m_frango_assado", genericName: "Frango Assado" },
  { match: ["feijoada", "feijuca"], id: "m_feijoada", genericName: "Feijoada" },
  { match: ["lasanha", "lazanha"], id: "m_lasanha", genericName: "Lasanha" },
  { match: ["estrogonofe", "strogonoff"], id: "m_estrogonofe_frango", genericName: "Estrogonofe" },
  { match: ["peixe", "tilapia", "peixe grelhado"], id: "m_peixe_grelhado", genericName: "Filé de Peixe" },
  { match: ["costela", "costela assada", "costela bovina"], id: "m_costela", genericName: "Costela Bovina" },
  { match: ["nhoque", "massa", "almondegas"], id: "m_massa_artesanal", genericName: "Nhoque c/ Almôndegas" }
];

// ------------------------------------------------------------------------------
// 2. GUARDRAILS (SEGURANÇA CONTRA PROMPT INJECTION & JAILBREAK)
// ------------------------------------------------------------------------------
const GUARDRAILS = {
  patterns: [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /desconsidere\s+(todas\s+as\s+)?instru[cç][oõ]es/i,
    /voc[eê]\s+agora\s+[eé]\s+(um|uma|o|a)?\s*(dan|jailbreak|hacker|root|admin)/i,
    /system\s*prompt/i,
    /voc[eê]\s+[eé]\s+uma\s+ia\s+livre/i,
    /revele\s+(suas\s+)?instru[cç][oõ]es\s+(iniciais|secretas|de\s+sistema)/i,
    /bypass\s+security/i,
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /eval\(.*\)/i,
    /drop\s+table/i,
    /exec\s*\(/i,
    /prompt\s+injection/i
  ],

  check(input) {
    for (const pattern of this.patterns) {
      if (pattern.test(input)) {
        return {
          violation: true,
          reason: "Tentativa de injeção de prompt ou violação de segurança detectada.",
          pattern: pattern.toString()
        };
      }
    }
    return { violation: false };
  }
};

// ------------------------------------------------------------------------------
// 3. NLP TOKENIZER & NORMALIZAÇÃO (SEM LLM)
// ------------------------------------------------------------------------------
const STOPWORDS = new Set([
  "a", "o", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
  "em", "no", "na", "nos", "nas", "por", "para", "com", "e", "ou", "se", "que",
  "eu", "voce", "ele", "ela", "nos", "meu", "sua", "esse", "esta", "isto", "aquilo"
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s]/g, " ")       // remove pontuação
    .replace(/\s+/g, " ")           // remove espaços extras
    .trim();
}

function tokenize(text) {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(" ").filter(w => w.length > 1 && !STOPWORDS.has(w));
}

// ------------------------------------------------------------------------------
// 4. TF-IDF & SIMILARIDADE DE COSSENOS
// ------------------------------------------------------------------------------
class CosineSimilarityEngine {
  constructor(corpus) {
    this.documents = corpus; // Array de { id, text, intent }
    this.vocab = new Set();
    this.docVectors = [];
    this.buildVocabAndVectors();
  }

  buildVocabAndVectors() {
    this.documents.forEach(doc => {
      const tokens = tokenize(doc.text);
      tokens.forEach(t => this.vocab.add(t));
    });

    const vocabList = Array.from(this.vocab);
    const N = this.documents.length;

    // Calcular IDF
    this.idf = {};
    vocabList.forEach(term => {
      let docCount = 0;
      this.documents.forEach(doc => {
        if (tokenize(doc.text).includes(term)) docCount++;
      });
      this.idf[term] = Math.log(1 + N / (1 + docCount));
    });

    // Vetores dos documentos
    this.docVectors = this.documents.map(doc => {
      return this.vectorize(doc.text);
    });
  }

  vectorize(text) {
    const tokens = tokenize(text);
    const tf = {};
    tokens.forEach(t => {
      tf[t] = (tf[t] || 0) + 1;
    });

    const vec = {};
    Array.from(this.vocab).forEach(term => {
      const freq = tf[term] || 0;
      vec[term] = freq * (this.idf[term] || 0.1);
    });
    return vec;
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const term of this.vocab) {
      const valA = vecA[term] || 0;
      const valB = vecB[term] || 0;
      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  findBestMatch(queryText) {
    const queryVec = this.vectorize(queryText);
    let bestScore = -1;
    let bestDoc = null;

    this.documents.forEach((doc, idx) => {
      const score = this.cosineSimilarity(queryVec, this.docVectors[idx]);
      if (score > bestScore) {
        bestScore = score;
        bestDoc = doc;
      }
    });

    return { bestDoc, score: bestScore };
  }
}

// Base de Treinamento de Intenções para Similaridade de Cossenos
const INTENT_CORPUS = [
  { id: 1, intent: "ver_cardapio", text: "mostrar cardapio cardapio de hoje o que tem para comer opcoes pratos do dia menu" },
  { id: 2, intent: "ver_cardapio", text: "quais marmitas voces tem hoje o que esta saindo no almoco" },
  { id: 3, intent: "consultar_preco", text: "quanto custa valor preco da marmita precos por unidade tabela de valores" },
  { id: 4, intent: "consultar_preco", text: "qual o preco do bife feijoada frango valor de cada item" },
  { id: 5, intent: "fazer_pedido", text: "quero pedir marmita adicionar marmita comprar bife feijoada comida colocar no carrinho" },
  { id: 6, intent: "fazer_pedido", text: "vou querer uma quentinha de carne frango marmitex me ve um bife" },
  { id: 7, intent: "consultar_total", text: "qual valor total da compra quanto deu o pedido valor com entrega finalizar quanto fica tudo frete taxa" },
  { id: 8, intent: "consultar_total", text: "resumo da conta total a pagar fechar pedido preco com entrega" },
  { id: 9, intent: "limpar_carrinho", text: "cancelar pedido esvaziar carrinho zerar compras limpar tudo começar de novo" },
  { id: 10, intent: "saudacao", text: "ola boa tarde bom dia oi tudo bem boa noite gostaria de informacoes" },
  { id: 11, intent: "ajuda", text: "como funciona o que voce pode fazer ajuda socorro atendente suporte instrucoes" }
];

const cosineEngine = new CosineSimilarityEngine(INTENT_CORPUS);

// ------------------------------------------------------------------------------
// 5. LAYA DECISION LAYER (Decision Routing & Scoring Engine)
// ------------------------------------------------------------------------------
class LayaDecisionLayer {
  constructor(cosineEngine) {
    this.cosineEngine = cosineEngine;
  }

  evaluate(userInput) {
    const norm = normalizeText(userInput);

    // Camada L1: Guardrails de segurança
    const guardrailCheck = GUARDRAILS.check(userInput);
    if (guardrailCheck.violation) {
      return {
        layer: "L1_GUARDRAIL",
        action: "BLOCK",
        reason: guardrailCheck.reason,
        confidence: 1.0
      };
    }

    // Camada L2: Detecção Explícita de Modificadores (Tempero / Ponto de Carne / Customizações)
    // Se o usuário mencionar temperos ("sem cebola", "ponto da carne", etc.) junto ou isolado
    const customInfo = extractCustomizations(userInput);
    const hasCustomization = customInfo.removed.length > 0 || customInfo.added.length > 0 || customInfo.doneness !== null;
    const detectedProduct = detectProductInText(userInput);

    if (hasCustomization && detectedProduct) {
      return {
        layer: "L2_SPECIALIZED_ORDER",
        action: "PROCESS_CUSTOM_ORDER",
        product: detectedProduct,
        customization: customInfo,
        confidence: 0.95
      };
    }

    // Camada L3: Similaridade de Cossenos sobre Vetores TF-IDF
    const cosineMatch = this.cosineEngine.findBestMatch(userInput);

    // Camada L4: Roteamento de Intenção com threshold
    if (cosineMatch.score >= 0.28) {
      return {
        layer: "L3_COSINE_SIMILARITY",
        action: cosineMatch.bestDoc.intent,
        confidence: cosineMatch.score,
        product: detectedProduct,
        customization: customInfo
      };
    }

    // Camada L5: Fallback para Motor ELIZA (Regex e Padrões Clássicos)
    return {
      layer: "L4_ELIZA_FALLBACK",
      action: "ELIZA_PATTERN",
      confidence: 0.5,
      product: detectedProduct,
      customization: customInfo
    };
  }
}

// ------------------------------------------------------------------------------
// 6. MOTOR ELIZA 1960 (Regex Decomposition & Reassembly)
// ------------------------------------------------------------------------------
class Eliza1960Engine {
  constructor() {
    this.reflections = {
      "eu": "você",
      "meu": "seu",
      "minha": "sua",
      "meus": "seus",
      "minhas": "suas",
      "comigo": "com você",
      "estou": "está",
      "quero": "deseja",
      "você": "eu",
      "seu": "meu",
      "sua": "minha"
    };

    // Padrões Regex clássicos estilo Weizenbaum 1966 com templates de respostas
    this.rules = [
      {
        pattern: /^(ol[aá]|oi|bom dia|boa tarde|boa noite)(.*)/i,
        responses: [
          "Olá! Seja bem-vindo à Marmitaria Sabor & Arte. Como posso ajudar com seu almoço ou jantar hoje?",
          "Oi! Que bom ter você aqui. Gostaria de ver o cardápio do dia ou fazer um pedido personalizado?"
        ]
      },
      {
        pattern: /.*(sem\s+\w+).*/i,
        responses: [
          "Entendi perfeitamente sua restrição para $1. Vamos preparar sua refeição exatamente do seu jeito!",
          "Anotado! Prepararemos sem esse ingrediente. O restaurante cuida com todo carinho da sua preferência."
        ]
      },
      {
        pattern: /.*(bem\s+passad[ao]|ao\s+ponto|mal\s+passad[ao]).*/i,
        responses: [
          "Ótima escolha! Nossos cozinheiros acertam em cheio o ponto $1 da carne.",
          "Perfeito! O ponto $1 é especialidade da nossa chapa."
        ]
      },
      {
        pattern: /.*n[aã]o\s+gosto\s+de\s+(.*)/i,
        responses: [
          "Por que você não gosta de $1? Não se preocupe, podemos remover totalmente do seu prato!",
          "Sem problemas! Registrei que você prefere evitar $1."
        ]
      },
      {
        pattern: /.*eu\s+quero\s+(.*)/i,
        responses: [
          "O que faz você desejar $1 hoje? Posso adicionar agora mesmo ao seu pedido!",
          "Você realmente gostaria de $1? Me confirme se deseja que eu coloque no carrinho."
        ]
      },
      {
        pattern: /.*(obrigad[ao]|valeu|agrade[cç]o).*/i,
        responses: [
          "Por nada! Nós da Marmitaria estamos sempre à sua disposição. Bom apetite!",
          "Eu que agradeço a preferência! Se precisar de mais alguma marmita ou ajuste, é só avisar."
        ]
      },
      {
        pattern: /.*(quem [eé] voc[eê]|seu nome).*/i,
        responses: [
          "Eu sou a Dona Maria Bot, a atendente virtual da Marmitaria criada com NLP clássico, similaridade de cossenos e Eliza de 1960!",
          "Sou a inteligência da Marmitaria Sabor & Arte. Posso anotar seu pedido, ajustar temperos e calcular o total."
        ]
      }
    ];

    this.defaultResponses = [
      "Compreendo. Você poderia especificar qual marmita do cardápio gostaria, ou se deseja ver as opções do dia?",
      "Interessante! Fale mais sobre sua preferência de marmita, temperos ou se deseja calcular o total com entrega.",
      "Para te atender melhor: você quer ver o cardápio de hoje, saber os preços ou pedir um bife personalizado?"
    ];
  }

  reflect(text) {
    const words = text.toLowerCase().split(/\s+/);
    return words.map(w => this.reflections[w] || w).join(" ");
  }

  process(input) {
    for (const rule of this.rules) {
      const match = input.match(rule.pattern);
      if (match) {
        const choice = rule.responses[Math.floor(Math.random() * rule.responses.length)];
        let reply = choice;
        if (match[1]) {
          const transformed = this.reflect(match[1]);
          reply = reply.replace("$1", transformed);
        }
        return { reply, matchedPattern: rule.pattern.toString() };
      }
    }

    const fallback = this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
    return { reply: fallback, matchedPattern: "DEFAULT_FALLBACK" };
  }
}

const elizaEngine = new Eliza1960Engine();

// ------------------------------------------------------------------------------
// 7. EXTRATORES DE ENTIDADES (TEMPEROS, PONTO DA CARNE E PRODUTOS)
// ------------------------------------------------------------------------------
function extractCustomizations(text) {
  const norm = normalizeText(text);

  const result = {
    removed: [],
    added: [],
    doneness: null
  };

  // 1. Ponto da carne (Regex Eliza-style)
  if (/mal\s*passad[ao]|sangrent[ao]/i.test(norm)) {
    result.doneness = "Mal passado";
  } else if (/bem\s*passad[ao]|torrad[ao]/i.test(norm)) {
    result.doneness = "Bem passado";
  } else if (/ao\s*ponto|ponto/i.test(norm)) {
    result.doneness = "Ao ponto";
  }

  // 2. Remoção de temperos / ingredientes ("sem cebola", "remover cebola", "tirar alho", etc.)
  const removeRegex = /(?:sem|tirar|remova|remover|menos|pouco|pouca|sem nenhuma|livre de)\s+([a-zçãõ]+(?:\s+[a-zçãõ]+)?)/gi;
  let match;
  while ((match = removeRegex.exec(norm)) !== null) {
    const item = match[1].trim();
    // Evitar falsos positivos com palavras estruturais
    if (!["marmita", "comida", "favor", "por", "que", "entrega"].includes(item)) {
      result.removed.push(item);
    }
  }

  // 3. Adição / Mais temperos ("com bastante cebola", "mais sal", "com alho extra")
  const addRegex = /(?:com bastante|mais|bastante|com mais|extra de)\s+([a-zçãõ]+)/gi;
  while ((match = addRegex.exec(norm)) !== null) {
    const item = match[1].trim();
    if (!["marmita", "comida", "favor", "entrega"].includes(item)) {
      result.added.push(item);
    }
  }

  return result;
}

function detectProductInText(text) {
  const norm = normalizeText(text);
  for (const alias of PRODUCT_ALIASES) {
    for (const phrase of alias.match) {
      const normPhrase = normalizeText(phrase);
      if (norm.includes(normPhrase)) {
        return alias;
      }
    }
  }
  return null;
}

// ------------------------------------------------------------------------------
// 8. GERENCIADOR DE ESTADO DA APLICAÇÃO & CARRINHO
// ------------------------------------------------------------------------------
class RestaurantBotApp {
  constructor() {
    this.currentDay = this.getInitialDay();
    this.cart = []; // Itens: { id, name, price, doneness, removed: [], added: [] }
    this.layaEngine = new LayaDecisionLayer(cosineEngine);

    this.initDOM();
    this.renderMenu();
    this.renderCart();
    this.sendBotGreeting();
  }

  getInitialDay() {
    const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const todayIndex = new Date().getDay();
    return days[todayIndex];
  }

  initDOM() {
    this.chatMessages = document.getElementById("chat-messages");
    this.chatForm = document.getElementById("chat-form");
    this.chatInput = document.getElementById("chat-input");
    this.daySelector = document.getElementById("day-selector");
    this.menuList = document.getElementById("menu-items-list");
    this.cartItems = document.getElementById("cart-items");
    this.cartSubtotal = document.getElementById("cart-subtotal");
    this.cartTax = document.getElementById("cart-tax");
    this.cartTotal = document.getElementById("cart-total");

    // Inspetor NLP
    this.inspectorTokens = document.getElementById("nlp-tokens");
    this.inspectorLayer = document.getElementById("nlp-layer");
    this.inspectorCosine = document.getElementById("nlp-cosine");
    this.inspectorEliza = document.getElementById("nlp-eliza");
    this.inspectorGuardrails = document.getElementById("nlp-guardrails");

    // Sincronizar seletor com dia atual
    this.daySelector.value = this.currentDay;

    // Eventos
    this.daySelector.addEventListener("change", (e) => {
      this.currentDay = e.target.value;
      this.renderMenu();
      this.addBotMessage(`📅 Cardápio alterado para **${DAY_NAMES[this.currentDay]}**! Veja as delícias disponíveis ao lado ou me pergunte.`);
    });

    this.chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = this.chatInput.value.trim();
      if (!text) return;
      this.handleUserInput(text);
      this.chatInput.value = "";
    });

    // Ações Rápidas (Pills)
    document.querySelectorAll(".quick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-text");
        this.chatInput.value = text;
        this.chatForm.dispatchEvent(new Event("submit"));
      });
    });

    // Toggle Inspector
    const toggleBtn = document.getElementById("toggle-inspector-btn");
    const inspectorContent = document.getElementById("inspector-content");
    toggleBtn.addEventListener("click", () => {
      const isHidden = inspectorContent.style.display === "none";
      inspectorContent.style.display = isHidden ? "flex" : "none";
      toggleBtn.innerText = isHidden ? "▼" : "▲";
    });
  }

  renderMenu() {
    const items = MENU_DATA[this.currentDay] || [];
    this.menuList.innerHTML = "";

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "menu-item-card";
      card.innerHTML = `
        <div class="card-top">
          <span>${item.name}</span>
          <span class="card-price">R$ ${item.price.toFixed(2).replace(".", ",")}</span>
        </div>
        <div class="card-desc">${item.desc}</div>
      `;
      card.addEventListener("click", () => {
        this.chatInput.value = `Quero pedir ${item.name}`;
        this.chatInput.focus();
      });
      this.menuList.appendChild(card);
    });
  }

  renderCart() {
    if (this.cart.length === 0) {
      this.cartItems.innerHTML = `<div class="cart-items-empty">Seu carrinho está vazio. Escolha uma marmita!</div>`;
      this.cartSubtotal.innerText = "R$ 0,00";
      this.cartTax.innerText = `R$ ${DELIVERY_FEE.toFixed(2).replace(".", ",")}`;
      this.cartTotal.innerText = `R$ ${DELIVERY_FEE.toFixed(2).replace(".", ",")}`;
      return;
    }

    this.cartItems.innerHTML = "";
    let subtotal = 0;

    this.cart.forEach((item, index) => {
      subtotal += item.price;
      const row = document.createElement("div");
      row.className = "cart-item-row";

      let details = [];
      if (item.doneness) details.push(`Ponto: ${item.doneness}`);
      if (item.removed && item.removed.length > 0) details.push(`Sem: ${item.removed.join(", ")}`);
      if (item.added && item.added.length > 0) details.push(`Extra: ${item.added.join(", ")}`);

      row.innerHTML = `
        <div class="row-main">
          <span>1x ${item.name}</span>
          <span>R$ ${item.price.toFixed(2).replace(".", ",")}</span>
        </div>
        ${details.length > 0 ? `<div class="row-details">📝 ${details.join(" | ")}</div>` : ""}
      `;
      this.cartItems.appendChild(row);
    });

    const total = subtotal + DELIVERY_FEE;
    this.cartSubtotal.innerText = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
    this.cartTax.innerText = `R$ ${DELIVERY_FEE.toFixed(2).replace(".", ",")}`;
    this.cartTotal.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;
  }

  sendBotGreeting() {
    const greeting = `Olá! Seja muito bem-vindo à **Marmitaria Sabor & Tradição**! 🍲\n\nEu sou o seu chatbot inteligente com **NLP clássico (TF-IDF + Similaridade de Cossenos), motor de decisão Laya e Eliza 1960**.\n\nHoje é **${DAY_NAMES[this.currentDay]}**. Você pode me pedir o cardápio, saber os preços das marmitas por unidade, pedir uma marmita com tempero customizado (ex.: *"remover cebolas do bife de vaca"* ou *"bife bem passado"*) e consultar o total com entrega! Como posso te servir?`;
    this.addBotMessage(greeting, "SISTEMA / INÍCIO");
  }

  addUserMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper user";
    wrapper.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-bubble">${this.escapeHTML(text)}</div>
    `;
    this.chatMessages.appendChild(wrapper);
    this.scrollToBottom();
  }

  addBotMessage(text, metaTag = "NLP & Eliza", isWarning = false) {
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper bot`;
    
    // Converte formatação markdown simples (*bold* e quebras de linha)
    const formatted = this.escapeHTML(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");

    wrapper.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-bubble ${isWarning ? 'guardrail-warning' : ''}">
        <div>${formatted}</div>
        <div class="message-meta">
          <span class="tag-method">${metaTag}</span>
          <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    `;
    this.chatMessages.appendChild(wrapper);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  escapeHTML(str) {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  // ----------------------------------------------------------------------------
  // FLUXO PRINCIPAL DE PROCESSAMENTO DO BOT
  // ----------------------------------------------------------------------------
  handleUserInput(rawInput) {
    this.addUserMessage(rawInput);

    // 1. Atualizar tokens do inspetor
    const tokens = tokenize(rawInput);
    this.inspectorTokens.innerText = tokens.length > 0 ? tokens.join(", ") : "(nenhum token relevante)";

    // 2. Avaliação pelo Laya Decision Engine
    const decision = this.layaEngine.evaluate(rawInput);

    // 3. Atualizar métricas do painel
    this.inspectorLayer.innerText = decision.layer;
    this.inspectorGuardrails.className = decision.action === "BLOCK" ? "status-blocked" : "status-safe";
    this.inspectorGuardrails.innerText = decision.action === "BLOCK" ? "VIOLAÇÃO BLOQUEADA" : "SEGURO";

    // 4. Executar resposta de acordo com a camada Laya
    if (decision.action === "BLOCK") {
      this.inspectorCosine.innerText = "0.00 (Bloqueado)";
      this.inspectorEliza.innerText = "Ignorado por Guardrail";
      this.addBotMessage(
        `🛡️ **Alerta de Segurança (Guardrail Ativado):**\n${decision.reason}\nSua mensagem foi neutralizada. Este sistema opera estritamente no escopo de atendimento e venda de marmitas sem vulnerabilidades de injeção de prompt.`,
        "Guardrail Security",
        true
      );
      return;
    }

    // Identificar produto no cardápio de hoje
    const todaysMenu = MENU_DATA[this.currentDay] || [];
    let matchedItem = null;

    if (decision.product) {
      // Buscar se o item do alias está disponível hoje
      matchedItem = todaysMenu.find(item => item.id === decision.product.id);
      // Se não estiver no dia exato, usar o primeiro dia que tem ou o preço padrão
      if (!matchedItem) {
        // Encontrar em qualquer dia para referência de preço
        for (const day in MENU_DATA) {
          const found = MENU_DATA[day].find(it => it.id === decision.product.id);
          if (found) { matchedItem = found; break; }
        }
      }
    }

    // Processamento de acordo com a ação decidida
    if (decision.action === "PROCESS_CUSTOM_ORDER" || decision.action === "fazer_pedido") {
      this.inspectorCosine.innerText = (decision.confidence || 0).toFixed(4);
      this.inspectorEliza.innerText = "Entidades Customizadas Extraídas";

      if (matchedItem) {
        const custom = decision.customization || { removed: [], added: [], doneness: null };
        
        // Adicionar ao carrinho
        this.cart.push({
          id: matchedItem.id,
          name: matchedItem.name,
          price: matchedItem.price,
          doneness: custom.doneness,
          removed: [...custom.removed],
          added: [...custom.added]
        });

        this.renderCart();

        let detailsMsg = [];
        if (custom.doneness) detailsMsg.push(`ponto: **${custom.doneness}**`);
        if (custom.removed.length > 0) detailsMsg.push(`sem **${custom.removed.join(", ")}**`);
        if (custom.added.length > 0) detailsMsg.push(`com extra de **${custom.added.join(", ")}**`);

        let customSummary = detailsMsg.length > 0 ? ` com ${detailsMsg.join(" e ")}` : "";

        this.addBotMessage(
          `✅ Adicionei **${matchedItem.name}**${customSummary} ao seu carrinho por **R$ ${matchedItem.price.toFixed(2).replace(".", ",")}**!\n\n` +
          `O preparo seguirá exatamente as suas instruções de tempero/cozimento na cozinha. Deseja mais alguma coisa ou quer saber o valor total da compra com entrega?`,
          "Laya + Cosine Order Engine"
        );
      } else {
        // Pediu para pedir, mas não especificou qual item
        let menuStr = todaysMenu.map(m => `• **${m.name}**: R$ ${m.price.toFixed(2).replace(".", ",")}`).join("\n");
        this.addBotMessage(
          `Claro! Qual das opções de hoje você gostaria de pedir?\n\n${menuStr}\n\nVocê também pode me dizer se deseja alterações de tempero (ex.: *"sem cebola"*, *"sem sal"*) ou o ponto do bife!`,
          "Menu Prompt"
        );
      }
      return;
    }

    if (decision.action === "ver_cardapio") {
      this.inspectorCosine.innerText = (decision.confidence || 0).toFixed(4);
      this.inspectorEliza.innerText = "Intent Match: ver_cardapio";

      let menuStr = todaysMenu.map(m => `🍱 **${m.name}** — **R$ ${m.price.toFixed(2).replace(".", ",")}**\n   _${m.desc}_`).join("\n\n");
      this.addBotMessage(
        `📅 Aqui está o cardápio de **${DAY_NAMES[this.currentDay]}**:\n\n${menuStr}\n\nQual delas você gostaria de saborear hoje? Você pode personalizar o ponto e os temperos à vontade!`,
        `Similaridade Cosseno (${(decision.confidence * 100).toFixed(1)}%)`
      );
      return;
    }

    if (decision.action === "consultar_preco") {
      this.inspectorCosine.innerText = (decision.confidence || 0).toFixed(4);
      this.inspectorEliza.innerText = "Intent Match: consultar_preco";

      if (matchedItem) {
        this.addBotMessage(
          `💰 A **${matchedItem.name}** custa **R$ ${matchedItem.price.toFixed(2).replace(".", ",")}** por unidade no nosso restaurante.\nDescrição: ${matchedItem.desc}.\n\nDeseja que eu inclua no seu pedido?`,
          "Preço Unitário"
        );
      } else {
        let prices = todaysMenu.map(m => `• **${m.name}**: R$ ${m.price.toFixed(2).replace(".", ",")}`).join("\n");
        this.addBotMessage(
          `💰 Aqui estão os preços por unidade para o dia de hoje (${DAY_NAMES[this.currentDay]}):\n\n${prices}\n• Taxa fixa de entrega: **R$ ${DELIVERY_FEE.toFixed(2).replace(".", ",")}**`,
          "Tabela de Preços"
        );
      }
      return;
    }

    if (decision.action === "consultar_total") {
      this.inspectorCosine.innerText = (decision.confidence || 0).toFixed(4);
      this.inspectorEliza.innerText = "Intent Match: consultar_total";

      if (this.cart.length === 0) {
        this.addBotMessage(
          `Seu carrinho ainda está vazio! 🛍️\nA taxa de entrega é fixa em **R$ ${DELIVERY_FEE.toFixed(2).replace(".", ",")}**.\nEscolha uma de nossas marmitas para calcular o total com entrega!`,
          "Cálculo de Entrega"
        );
      } else {
        const subtotal = this.cart.reduce((sum, item) => sum + item.price, 0);
        const total = subtotal + DELIVERY_FEE;
        let resumo = this.cart.map((item, idx) => {
          let extra = [];
          if (item.doneness) extra.push(item.doneness);
          if (item.removed.length > 0) extra.push(`sem ${item.removed.join(", ")}`);
          if (item.added.length > 0) extra.push(`extra ${item.added.join(", ")}`);
          let desc = extra.length > 0 ? ` (${extra.join(", ")})` : "";
          return `${idx + 1}. **${item.name}**${desc} — R$ ${item.price.toFixed(2).replace(".", ",")}`;
        }).join("\n");

        this.addBotMessage(
          `🧾 **Resumo Completo do seu Pedido:**\n\n${resumo}\n\n` +
          `------------------------------\n` +
          `• **Subtotal dos itens:** R$ ${subtotal.toFixed(2).replace(".", ",")}\n` +
          `• **Taxa de Entrega:** R$ ${DELIVERY_FEE.toFixed(2).replace(".", ",")}\n` +
          `• **VALOR TOTAL COM ENTREGA:** **R$ ${total.toFixed(2).replace(".", ",")}**\n` +
          `------------------------------\n` +
          `Deseja confirmar ou adicionar mais itens ao seu pedido?`,
          "Total com Entrega"
        );
      }
      return;
    }

    if (decision.action === "limpar_carrinho") {
      this.cart = [];
      this.renderCart();
      this.addBotMessage("🗑️ Carrinho limpo com sucesso! Pode escolher novamente o que deseja pedir.", "Carrinho Zerado");
      return;
    }

    if (decision.action === "saudacao") {
      this.addBotMessage(
        `Olá! Que prazer falar com você. Estou pronta para anotar seu pedido de hoje (${DAY_NAMES[this.currentDay]}). O que gostaria de almoçar ou jantar?`,
        "Saudação"
      );
      return;
    }

    // Fallback: Se não casou com intenção de alta confiança, usa Eliza 1960 Pattern Matching
    this.inspectorCosine.innerText = (decision.confidence || 0).toFixed(4);
    const elizaResult = elizaEngine.process(rawInput);
    this.inspectorEliza.innerText = elizaResult.matchedPattern;

    this.addBotMessage(
      elizaResult.reply,
      `Eliza 1960 (${elizaResult.matchedPattern.substring(0, 24)}...)`
    );
  }
}

// Inicializar quando o documento carregar
document.addEventListener("DOMContentLoaded", () => {
  window.marmitaApp = new RestaurantBotApp();
});
