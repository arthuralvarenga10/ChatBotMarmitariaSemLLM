# 🍲 Marmitaria Sabor & Tradição — Chatbot Inteligente Sem LLM

Este projeto é uma aplicação web **100% client-side** (HTML5, CSS3, JavaScript puro, sem backend ou dependência de servidores), desenvolvida para atender clientes e realizar vendas de marmitas para um restaurante.

O chatbot foi implementado **estritamente sem Large Language Models (LLM)**, combinando técnicas consagradas de Inteligência Artificial e Processamento de Linguagem Natural (NLP):
1. **Similaridade de Cossenos com TF-IDF**: Vetorização e cálculo matemático de proximidade semântica para classificação de intenções (*intent routing*).
2. **Motor de Decisão Laya (Decision Layer)**: Arquitetura em camadas para fluxo de decisões rápidas, scoring de confiança e roteamento.
3. **Eliza (1960 - Joseph Weizenbaum)**: Regras com Expressões Regulares (Regex), decomposição, reflexão de pronomes e modelos de respostas.
4. **NLP Pré-Processamento**: Normalização de texto, remoção de acentos (*NFD*), filtragem de *stopwords* e tokenização em português.
5. **Guardrails de Segurança**: Detecção e bloqueio de tentativas de *prompt injection*, *jailbreak* e scripts maliciosos.

---

## 🌟 Funcionalidades Atendidas

- ✅ **Vendas para Restaurante de Marmitas**: Fluxo de atendimento, boas-vindas, adição de itens e fechamento de pedidos.
- ✅ **Cardápio e Preços por Dia**: Variação automática e seleção manual de opções para cada dia da semana (segunda a domingo), com preços unitários e descrição detalhada.
- ✅ **Seleção por Texto**: O usuário pode solicitar qualquer prato em linguagem natural (ex: *"quero pedir um bife de vaca"* ou *"me vê uma feijoada"*).
- ✅ **Customização de Temperos e Ponto de Cozimento**:
  - Remoção de ingredientes: *"sem cebola"*, *"remover alho"*, *"pouco sal"*, etc.
  - Ponto da carne: *"ao ponto"*, *"bem passado"*, *"mal passado"*.
- ✅ **Cálculo do Valor Total com Entrega**: Exibição transparente de subtotal, taxa fixa de entrega (R$ 5,00) e valor final.
- ✅ **Guardrails Contra Injeção / Jailbreak**: Filtro preventivo contra tentativas de manipulação de instruções de sistema ou ataques XSS.
- ✅ **Painel Inspetor de NLP em Tempo Real**: Mostra ao usuário e aos avaliadores quais tokens foram extraídos, o score de similaridade de cossenos, a camada de decisão ativada e o padrão Eliza/Regex correspondente.
- ✅ **100% Client-Side**: Roda diretamente em qualquer navegador sem necessidade de Node.js, Python ou servidor backend.

---

## 🚀 Como Executar Localmente

Como o projeto é totalmente client-side:
1. Abra o arquivo `index.html` em qualquer navegador web moderno (Google Chrome, Firefox, Safari, Edge).
2. Ou utilize a extensão **Live Server** no VS Code ou o comando:
   ```bash
   npx serve .
   ```

---

## 🌐 Publicação no GitHub e GitHub Pages

Siga os passos abaixo para enviar o código para o seu GitHub e ativar a URL do GitHub Pages:

### 1. Inicializar o repositório Git e fazer o Commit
No terminal, na pasta do projeto:
```bash
git init
git add .
git commit -m "feat: Chatbot de marmitas sem LLM com Similaridade de Cossenos, Laya, NLP e Eliza 1960"
```

### 2. Criar o repositório no GitHub
1. Acesse [github.com/new](https://github.com/new) e crie um novo repositório (ex: `chatbot-marmitaria`).
2. Vincule o repositório remoto e envie os arquivos:
```bash
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/chatbot-marmitaria.git
git push -u origin main
```

### 3. Habilitar o GitHub Pages
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment** > **Source**, selecione **Deploy from a branch**.
4. Em **Branch**, selecione `main` e a pasta `/ (root)`. Clique em **Save**.
5. Aguarde cerca de 1 a 2 minutos. A URL do seu GitHub Pages estará disponível no formato:
   ```
   https://SEU_USUARIO.github.io/chatbot-marmitaria/
   ```

---

## 🛠️ Detalhes da Arquitetura Técnica

### Similaridade de Cossenos
A equação da similaridade de cossenos entre o vetor de entrada da pergunta $\vec{u}$ e o vetor da intenção de referência $\vec{v}$ é dada por:

$$\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|} = \frac{\sum_{i=1}^n u_i v_i}{\sqrt{\sum_{i=1}^n u_i^2} \sqrt{\sum_{i=1}^n v_i^2}}$$

### Camadas de Decisão (Laya Layer)
```
Input do Usuário
       │
       ▼
[ L1: Guardrail Filter ] ──(Padrões maliciosos)──► Bloqueio e Resposta Segura
       │
       ▼
[ L2: Extração de Entidades ] ──(Tempero / Ponto / Produto)──► Processa Pedido Personalizado
       │
       ▼
[ L3: Cosine Similarity ] ──(Score ≥ 0.28)──► Executa Intenção Mapeada
       │
       ▼
[ L4: Eliza 1960 Pattern ] ──(Regex e Reflexão)──► Resposta Conversacional Clássica
```
