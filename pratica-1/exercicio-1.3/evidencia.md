# Evidência - Exercício 1.3 (Pipeline RAG)

## 1. Código da POC

código está em exercicio-1.3/rag_pipeline.mjs

## 2. Resultado da Execução (Terminal)
Ingestão concluída: 5 documentos lidos e divididos em 27 chunks.

Pergunta: "Qual o prazo de devolução para carga perigosa?"
Top 3 chunks recuperados:

--- Chunk #1 ---
Fonte: ../pratica-1/FAQ-atendimento.md
Score de Similaridade: 0.6401
## Perguntas selecionadas (das 47 do documento original)

### Item 3 — "Cliente perguntou se pode devolver carga perigosa. O que respondo?"
Na prática, a gente orienta o cliente a ligar no ramal 4500 (Gestão de Riscos). Oficialmente não pode pelo processo padrão, mas já tiveram casos em que o pessoal de Riscos autorizou exceção. Então não diga que é impossível — diga que precisa de tratamento espe...

--- Chunk #2 ---
Fonte: ../pratica-1/POL-001-politica-devolucao.md
Score de Similaridade: 0.6302
## 3. Regras de Devolução

### 3.1. Prazo geral

O cliente pode solicitar a devolução de mercadorias em até 7 (sete) dias úteis após a data de recebimento confirmada no sistema de tracking. A contagem de dias úteis exclui sábados, domingos e feriados nacionais.

### 3.2. Exceções ao prazo geral

As seguintes categorias de carga NÃO são elegíveis para devolução pelo processo padrão:...

--- Chunk #3 ---
Fonte: ../pratica-1/PROC-042-frete-especial-v1.md
Score de Similaridade: 0.6224
## 3. Prazo de entrega para frete especial

O prazo de entrega para frete especial é calculado como o prazo padrão da rota + 2 dias úteis adicionais para manuseio de carga pesada.

## 4. Condições especiais

- Cargas acima de 5.000kg requerem aprovação prévia do gerente de operações regional.
- Cargas perigosas com peso acima de 500kg seguem tabela específica (PROC-043: Frete de Cargas Perigosas)....


===== PROMPT FINAL MONTADO =====

SYSTEM:
Você é um assistente de atendimento da NovaTech. Responda apenas com base no contexto fornecido. Sempre cite a fonte documental. Se não houver evidência suficiente, diga que não encontrou na documentação.

CONTEXTO:
[CHUNK 1]
Fonte: ../pratica-1/FAQ-atendimento.md
## Perguntas selecionadas (das 47 do documento original)

### Item 3 — "Cliente perguntou se pode devolver carga perigosa. O que respondo?"
Na prática, a gente orienta o cliente a ligar no ramal 4500 (Gestão de Riscos). Oficialmente não pode pelo processo padrão, mas já tiveram casos em que o pessoal de Riscos autorizou exceção. Então não diga que é impossível — diga que precisa de tratamento especial.

[CHUNK 2]
Fonte: ../pratica-1/POL-001-politica-devolucao.md
## 3. Regras de Devolução

### 3.1. Prazo geral

O cliente pode solicitar a devolução de mercadorias em até 7 (sete) dias úteis após a data de recebimento confirmada no sistema de tracking. A contagem de dias úteis exclui sábados, domingos e feriados nacionais.

### 3.2. Exceções ao prazo geral

As seguintes categorias de carga NÃO são elegíveis para devolução pelo processo padrão:

[CHUNK 3]
Fonte: ../pratica-1/PROC-042-frete-especial-v1.md
## 3. Prazo de entrega para frete especial

O prazo de entrega para frete especial é calculado como o prazo padrão da rota + 2 dias úteis adicionais para manuseio de carga pesada.

## 4. Condições especiais

- Cargas acima de 5.000kg requerem aprovação prévia do gerente de operações regional.
- Cargas perigosas com peso acima de 500kg seguem tabela específica (PROC-043: Frete de Cargas Perigosas).
- Descontos de volume (mais de 10 fretes especiais/mês para o mesmo cliente) devem ser negociados pelo Comercial e registrados em aditivo contratual.

PERGUNTA DO USUÁRIO:
Qual o prazo de devolução para carga perigosa?