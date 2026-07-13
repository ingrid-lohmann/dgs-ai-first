Prompt:
"Atue como um Desenvolvedor focado em IA Generativa, LLMs e sistemas RAG. Preciso gerar a versão inicial de um documento de "Análise de Viabilidade Técnica" para o projeto NovaTech. Os arquivos de consulta e a documentação base estão localizados no diretório `pratica-1/`, leia-os para ter contexto.

Com base no cenário do projeto, considere as seguintes informações técnicas:
- Base de dados atual: ~800 PDFs (média de 10 páginas, incluindo documentos escaneados que exigem OCR e PDFs com tabelas complexas de frete), ~400 páginas de wiki no Confluence (média de 1.500 palavras cada, contendo links internos e macros), e ~50 planilhas de Excel (com fórmulas interdependentes).
- Regra de conversão: Considere a proporção de ~0.75 palavras por token.
- Limites do LLM: O modelo alvo tem uma janela de contexto de 128K tokens. O system prompt e as instruções base consumirão cerca de 2K tokens.

Por favor, escreva a análise técnica em formato Markdown, estruturando o documento obrigatoriamente nos 4 tópicos abaixo:

1. Estratégia por Tipo de Fonte: Descreva detalhadamente o desafio para o pipeline de RAG e a estratégia técnica de tratamento e extração para: PDFs com tabelas, PDFs escaneados, páginas da wiki com links e planilhas com fórmulas.
2. Estimativa de Tokens: Calcule o tamanho aproximado da base inteira em tokens. Apresente o racional e a matemática utilizada para chegar a esse número com base nos volumes fornecidos.
3. Análise do Orçamento de Contexto: Responda matematicamente quantos chunks de ~500 tokens cabem em cada query, considerando a janela total de 128K e os 2K já reservados. Analise como esse número afeta a estratégia de retrieval (busca).
4. Recomendação de Chunking: Recomende e justifique uma estratégia de chunking alinhada ao tipo de pergunta que os atendentes farão. Explique explicitamente como o efeito "lost in the middle" influencia e restringe essa decisão."

Resposta:
Vou ler os arquivos em pratica-1 para capturar o contexto do projeto NovaTech e, em seguida, redigir a versão inicial da análise técnica em analise-viabilidade-tecnica-v1.md com os 4 tópicos e cálculos solicitados.

Vou coletar rapidamente o conteúdo dos anexos para extrair requisitos, termos e exemplos que devem aparecer na análise, garantindo alinhamento com o cenário real antes de escrever.

Encontrei os materiais e agora vou ler os documentos de referência em paralelo para consolidar o contexto funcional e técnico que precisa aparecer na análise de viabilidade.

Já consolidei o contexto de negócio e os pontos críticos de RAG (contradições, fontes informais e cobertura de chunks); agora vou abrir o arquivo-alvo para substituir pela análise técnica inicial com cálculos explícitos.

Vou escrever o documento completo com os 4 tópicos obrigatórios, incluindo premissas explícitas para estimar tokens dos PDFs e planilhas (já que só a wiki veio com média de palavras), e fechar com recomendações práticas de chunking e retrieval.

Versão inicial concluída e salva em analise-viabilidade-tecnica-v1.md.

O documento já está estruturado nos 4 tópicos obrigatórios e inclui:

Estratégia detalhada por tipo de fonte (PDF com tabela, PDF escaneado, wiki com links/macros e Excel com fórmulas).
Estimativa matemática de tokens da base completa, com premissas explícitas e cálculo passo a passo.
Análise do orçamento de contexto com cálculo direto de chunks de 500 tokens para 128K menos 2K.
Recomendação de chunking com justificativa prática para atendimento e impacto explícito do efeito lost in the middle.
Se quiser, no próximo passo eu gero uma versão v2 com cenário de sensibilidade (mínimo, base e máximo) para refinar a estimativa de tokens e risco de custo de inferência.