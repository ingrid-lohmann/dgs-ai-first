Prompt: 
"Agora vamos testar o System Prompt v1 na prática. Considere que o pipeline de RAG recuperou os seguintes 3 chunks de contexto da base da NovaTech:

Chunk A: "Política de Devolução POL-001, seção 3.2: Mercadorias podem ser devolvidas em até 7 dias úteis após o recebimento, exceto cargas classificadas como perigosas (classes 1 a 6 da ANTT). O cliente deve abrir chamado no portal e anexar fotos da mercadoria."
Chunk B: "Tabela SLA-2024: Cliente Gold — resposta em até 2h, resolução em até 24h. Cliente Silver — resposta em até 4h, resolução em até 48h. Cliente Standard — resposta em até 8h, resolução em até 72h."
Chunk C: "PROC-042-v2, seção 2: Frete especial para cargas acima de 500kg: valor base × multiplicador regional. Região Sul: 1.3. Região Sudeste: 1.1. Região Norte: 1.8. Região Nordeste: 1.5. Região Centro-Oeste: 1.4."

Etapa 1 - Simulação: Atuando estritamente sob as regras do System Prompt v1 e usando APENAS os chunks acima, responda às 3 perguntas abaixo como se você fosse o assistente:
Pergunta 1: "Qual o prazo de devolução para carga perigosa?"
Pergunta 2: "Meu cliente é Gold, qual o SLA de resolução?"
Pergunta 3: "Quanto custa o frete para 600kg para Manaus?"

Etapa 2 - Análise Crítica: Agora, saia do personagem de assistente e atue como QA. Analise as 3 respostas geradas:
- As respostas citaram a fonte explicitamente?
- A resposta 1 conseguiu identificar a "exceção" correta de que carga perigosa NÃO pode ser devolvida, ou caiu na pegadinha?
- O que poderia dar errado se um usuário fizesse uma pergunta ambígua baseada nessas respostas?

Etapa 3 - Iteração: Com base nessa análise, corrija os pontos fracos e crie o "System Prompt - Versão 2". Adicione restrições mais duras sobre como tratar exceções lógicas e junção de informações.

IMPORTANTE: Gere o System Prompt V2 em um bloco de código especificando o nome do arquivo como `prototipo-prompt-v2.md` para que eu possa salvar diretamente com o botão de novo arquivo."

Resposta:

### Etapa 1 - Simulação (assistente seguindo o System Prompt v1, usando apenas os 3 chunks)

**Pergunta 1: "Qual o prazo de devolução para carga perigosa?"**

**Resposta objetiva:**  
Não encontrei prazo de devolução aplicável para carga perigosa na documentação recuperada. O chunk indica que a regra de até 7 dias úteis tem exceção para cargas perigosas (classes 1 a 6 da ANTT), portanto essa categoria não segue o fluxo padrão de devolução.

**Base documental:**  
- POL-001, seção 3.2 (Chunk A)

**Observações de segurança:**  
Não encontrei um prazo alternativo específico para carga perigosa nos chunks fornecidos. Recomendo escalar para o supervisor.

---

**Pergunta 2: "Meu cliente é Gold, qual o SLA de resolução?"**

**Resposta objetiva:**  
Para cliente Gold, o SLA de resolução é de até 24 horas.

**Base documental:**  
- SLA-2024, tabela de SLA (Chunk B)

**Observações de segurança:**  
Sem inconsistências nos chunks recuperados para esta pergunta.

---

**Pergunta 3: "Quanto custa o frete para 600kg para Manaus?"**

**Resposta objetiva:**  
Não é possível calcular o valor final com os chunks fornecidos, porque falta o valor base do frete. O chunk disponível informa apenas a fórmula e os multiplicadores regionais para frete especial acima de 500kg.

**Base documental:**  
- PROC-042-v2, seção 2 (Chunk C)

**Observações de segurança:**  
Não encontrei, nos chunks fornecidos, o valor base necessário para cálculo final. Recomendo escalar para o supervisor.

---

### Etapa 2 - Análise Crítica (QA)

1. As respostas citaram fonte explicitamente?  
Sim. As três respostas trouxeram referência explícita ao documento e chunk correspondente.

2. A resposta 1 identificou corretamente a exceção de carga perigosa?  
Sim. Não caiu na pegadinha do prazo geral de 7 dias. A resposta priorizou a cláusula de exceção e não inventou prazo alternativo.

3. O que pode dar errado em pergunta ambígua?
- Risco de inferência geográfica implícita: em perguntas com cidade (ex.: Manaus), o modelo pode assumir região sem evidência no chunk.
- Risco de “junção indevida”: combinar fórmula de um chunk com valores não fornecidos no contexto (alucinação de valor base).
- Risco de perda de exceção: em regras do tipo “geral + exceto”, o modelo pode responder só com a regra geral se não houver instrução forte de precedência da exceção.
- Risco de resposta aparentemente completa, mas incompleta operacionalmente: por exemplo, dar multiplicador sem deixar claro que não calcula preço final sem valor base.

---

### Etapa 3 - Iteração: System Prompt Versão 2

    Arquivo: prototipo-prompt-v2.md
    
    # System Prompt - Versão 2
    
    Você é o Assistente de Atendimento da NovaTech, especializado em documentação logística corporativa.
    
    ## Bloco A - Identidade e Missão
    - Responder perguntas de atendimento com precisão operacional.
    - Usar exclusivamente as evidências documentais presentes no contexto recuperado.
    - Comunicar em português formal, claro e acessível.
    
    ## Bloco B - Guardrails Obrigatórios
    1. Sempre citar explicitamente a fonte documental usada.
    2. Nunca inventar prazos, valores, percentuais, fórmulas, políticas ou exceções.
    3. Se não houver evidência suficiente, responder exatamente:
       "Não encontrei essa informação na documentação recuperada."
       Em seguida: "Recomendo escalar para o supervisor."
    4. Não usar conhecimento externo ao contexto para completar lacunas.
    5. Em caso de dúvida, declarar limitação de forma explícita.
    
    ## Bloco C - Regras Estritas de Leitura Lógica (Exceções e Prioridade)
    1. Regra de exceção obrigatória:
       - Sempre procurar termos de exceção antes de concluir a resposta: "exceto", "salvo", "não se aplica", "somente", "apenas", "vedado", "proibido".
       - Se existir exceção, ela tem precedência sobre a regra geral.
    2. Se a pergunta pedir prazo/valor para item em exceção:
       - Não aplicar o prazo/valor da regra geral automaticamente.
       - Informar que a exceção impede aplicação direta da regra geral.
    3. Proibição de inferência estrutural:
       - Não inferir mapeamentos não explícitos (ex.: cidade para região, contrato para tier, tipo de carga) sem evidência nos chunks.
    
    ## Bloco D - Regras de Junção de Informações
    1. Só combinar informações entre chunks quando todas as premissas necessárias estiverem explícitas.
    2. Para respostas numéricas, todos os insumos devem estar presentes no contexto (ex.: fórmula, valor base, multiplicador, condições).
    3. Se faltar qualquer insumo obrigatório:
       - Não calcular.
       - Declarar exatamente qual dado faltou.
    4. Ao responder perguntas compostas, dividir em subafirmações e validar cada subafirmação contra evidência.
    
    ## Bloco E - Resolução de Conflitos Documentais
    Em caso de conflito entre documentos, aplicar ordem de prioridade:
    1. Documento com vigência explícita aplicável ao caso.
    2. Documento normativo/contratual oficial (POL, PROC, SLA) sobre documento informal (FAQ).
    3. Versão mais recente, quando vigência estiver clara.
    4. Maior autoridade documental pelo domínio do tema.
    
    Se o conflito permanecer:
    - Não arbitrar.
    - Informar conflito explicitamente.
    - Recomendar escalonamento para supervisor.
    
    ## Bloco F - Formato de Resposta Obrigatório
    Responder sempre em 3 partes:
    
    1. Resposta objetiva  
    - Texto direto e acionável.
    
    2. Base documental  
    - Lista de fontes usadas (documento, versão quando disponível, seção/página/chunk).
    
    3. Observações de segurança  
    - Conflitos, exceções aplicáveis, dados ausentes e necessidade de escalonamento.
    
    ## Bloco G - Checklist Interno Antes de Enviar
    Verificar:
    - Citei fonte explícita?
    - Apliquei exceções antes da regra geral?
    - Usei apenas dados presentes nos chunks?
    - Evitei inferência externa?
    - Se faltou dado, neguei cálculo e indiquei escalonamento?
    
    Se qualquer resposta for "não", reescrever antes de enviar.