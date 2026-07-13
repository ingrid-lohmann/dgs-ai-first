import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// IMPORTAÇÕES DA VERSÃO ESTÁVEL:
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajustado para voltar uma pasta e achar o diretório "pratica-1"
const MARKDOWN_FILES = [
  "../pratica-1/POL-001-politica-devolucao.md",
  "../pratica-1/PROC-042-frete-especial-v1.md",
  "../pratica-1/PROC-042-v2-frete-especial-revisado.md",
  "../pratica-1/SLA-2024-tabela-sla-clientes.md",
  "../pratica-1/FAQ-atendimento.md",
];

async function ingestDocuments() {
  const docs = [];

  for (const relativePath of MARKDOWN_FILES) {
    // Tenta ler o arquivo. Se não achar, avisa no console em vez de quebrar tudo.
    try {
      const absolutePath = path.resolve(__dirname, relativePath);
      const content = await readFile(absolutePath, "utf-8");

      docs.push(
        new Document({
          pageContent: content,
          metadata: { source: relativePath },
        })
      );
    } catch (e) {
      console.warn(`Aviso: Não encontrei o arquivo ${relativePath}. Ignorando...`);
    }
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 120,
  });

  const chunks = await splitter.splitDocuments(docs);

  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2",
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

  console.log(`Ingestão concluída: ${docs.length} documentos lidos e divididos em ${chunks.length} chunks.`);
  return vectorStore;
}

async function retrieveTopChunks(question, vectorStore, k = 3) {
  const results = await vectorStore.similaritySearchWithScore(question, k);

  console.log(`\nPergunta: "${question}"`);
  console.log(`Top ${k} chunks recuperados:\n`);

  results.forEach(([doc, score], index) => {
    console.log(`--- Chunk #${index + 1} ---`);
    console.log(`Fonte: ${doc.metadata?.source ?? "desconhecida"}`);
    console.log(`Score de Similaridade: ${score.toFixed(4)}`);
    console.log(doc.pageContent.slice(0, 400).trim() + "...\n");
  });

  return results;
}

function buildPrompt(retrievedChunks, question) {
  const systemPrompt = [
    "Você é um assistente de atendimento da NovaTech.",
    "Responda apenas com base no contexto fornecido.",
    "Sempre cite a fonte documental.",
    "Se não houver evidência suficiente, diga que não encontrou na documentação.",
  ].join(" ");

  const context = retrievedChunks
    .map(([doc, score], i) => {
      return `[CHUNK ${i + 1}]\nFonte: ${doc.metadata?.source ?? "desconhecida"}\n${doc.pageContent.trim()}`;
    })
    .join("\n\n");

  return `SYSTEM:\n${systemPrompt}\n\nCONTEXTO:\n${context}\n\nPERGUNTA DO USUÁRIO:\n${question}`;
}

async function main() {
  const vectorStore = await ingestDocuments();

  const question = "Qual o prazo de devolução para carga perigosa?";
  const retrieved = await retrieveTopChunks(question, vectorStore, 3);

  const finalPrompt = buildPrompt(retrieved, question);

  console.log("\n===== PROMPT FINAL MONTADO =====\n");
  console.log(finalPrompt);
}

main().catch((error) => {
  console.error("\nErro crítico no pipeline RAG:", error);
});