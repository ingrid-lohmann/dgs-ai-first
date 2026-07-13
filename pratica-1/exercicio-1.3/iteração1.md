Prompt:

"Atue como um Engenheiro de IA especializado em ecossistema Node.js. Preciso construir uma Prova de Conceito (POC) de um pipeline de RAG utilizando ferramentas open-source em JavaScript.

Tenho 5 documentos em formato Markdown no meu diretório. Por favor, escreva um script em Node.js (rag_pipeline.mjs) que execute as seguintes etapas:

1. INGESTÃO:
- Crie uma função assíncrona que leia o conteúdo de texto dos 5 arquivos markdown usando o módulo 'fs'.
- Utilize o LangChain (`RecursiveCharacterTextSplitter`) para dividir o texto em chunks. Defina um `chunkSize` e `chunkOverlap` justificáveis para documentos normativos e adicione um comentário rápido explicando a escolha.
- Utilize a biblioteca local `@xenova/transformers` (ou um HuggingFace embedding nativo do LangChain) para gerar os embeddings localmente e de forma gratuita.
- Salve os chunks em um banco vetorial em memória (`MemoryVectorStore` do LangChain) para facilitar a POC sem precisar subir um servidor de banco.

2. BUSCA (RETRIEVAL):
- Crie uma função de busca que receba uma pergunta do usuário (string) e a instância do vector store.
- Faça uma busca por similaridade e retorne os 3 chunks mais relevantes, imprimindo no console o texto do chunk e o score para validação.

3. MONTAGEM DO PROMPT:
- Crie uma função que receba os chunks recuperados e a pergunta do usuário.
- Monte e retorne uma string final formatada contendo um System Prompt básico, os chunks como contexto, e a pergunta final.

4. TESTE:
- Crie uma função de inicialização (main) que orquestre tudo: chame a ingestão e depois teste o retrieval com a pergunta: "Qual o prazo de devolução para carga perigosa?"

IMPORTANTE: Gere o código completo em um bloco especificando o nome do arquivo como `rag_pipeline.mjs` para que eu possa salvá-lo diretamente com o botão do editor. Não use comentários inline longos."

Resposta:
