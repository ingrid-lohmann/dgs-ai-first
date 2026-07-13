# Árvore de Skills e Mapeamento
## Nível 1: Foundation (Convenções Globais)

### Skill: typescript-conventions.md

- Descrição/Ativação: Regras de strict mode, uso de interfaces e nomenclatura de variáveis.
- Quem cria: Tech Lead.
- Quem consome: Desenvolvedores e Copilot.
- Frequência de uso: Diário (lido em toda geração de código).

### Skill: error-handling.md

- Descrição/Ativação: Padrões de try/catch, formatação de mensagens de erro e uso obrigatório do logger Pino.
- Quem cria: Tech Lead.
- Quem consome: Desenvolvedores e Copilot.
- Frequência de uso: Diário.

### Skill: project-structure.md

- Descrição/Ativação: Regras de separação de responsabilidades (ex: forçar a separação de validação de rotas).
- Quem cria: Tech Lead.
- Quem consome: Desenvolvedores e Copilot.
- Frequência de uso: Diário.

## Nível 2: Domain (Padrões por Camada)

### Skill: azure-functions-endpoint.md

- Descrição/Ativação: Estrutura arquitetural exigida para HTTP triggers no Azure Functions v4.
- Quem cria: Desenvolvedor Sênior.
- Quem consome: Desenvolvedores e Copilot.
- Frequência de uso: Semanal (sempre que um novo endpoint for criado).

### Skill: react-components.md

- Descrição/Ativação: Padrões do painel web, exigências de tipagem de props e hooks.
- Quem cria: Desenvolvedores.
- Quem consome: Desenvolvedores e Copilot.
- Frequência de uso: Diário.

### Skill: testing-patterns.md

- Descrição/Ativação: Regras de mocks e setup usando Vitest e MSW.
- Quem cria: QA.
- Quem consome: Desenvolvedores, QA e Copilot.
- Frequência de uso: Diário.

## Nível 3: Artifact (Receitas de Geração)

### Skill: create-rag-endpoint.md

- Descrição/Ativação: Receita completa passo a passo para gerar um endpoint que busca dados no AI Search e responde com IA.
- Quem cria: Desenvolvedor Sênior.
- Quem consome: Desenvolvedores e Copilot.
- Frequência de uso: Mensal (usado apenas ao criar features completas do zero).

# Evidência - Exercício 2.3 (Estratégia de Skills)

## 1. Árvore de Skills e Mapeamento
**Nível 1: Foundation**
* `typescript-conventions.md` | Cria: Tech Lead | Consome: Devs/Copilot | Frequência: Diário
* `error-handling.md` | Cria: Tech Lead | Consome: Devs/Copilot | Frequência: Diário
* `project-structure.md` | Cria: Tech Lead | Consome: Devs/Copilot | Frequência: Diário

**Nível 2: Domain**
* `azure-functions-endpoint.md` | Cria: Dev Sênior | Consome: Devs/Copilot | Frequência: Semanal
* `react-components.md` | Cria: Devs | Consome: Devs/Copilot | Frequência: Diário
* `testing-patterns.md` | Cria: QA | Consome: Devs/QA/Copilot | Frequência: Diário

**Nível 3: Artifact**
* `create-rag-endpoint.md` | Cria: Dev Sênior | Consome: Devs/Copilot | Frequência: Mensal

## 2. SKILL.md (Gerado com Copilot)
**Arquivo: skills/foundation/project-structure.md**
