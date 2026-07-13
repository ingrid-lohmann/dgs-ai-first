# Evidência - Exercício 2.1 (Configuração MCP)

## 1. Arquivo de Configuração
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "./src",
        "./specs",
        "./skills",
        "./docs/novatech",
        "./data/retrieval-corpus"
      ]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "."]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## 2. Evidências de Uso (Testes Locais)
**Teste 1 - Leitura de Documento:**
O prazo geral é de até 7 (sete) dias úteis após a data de recebimento confirmada no sistema de tracking.

**Teste 2 - Recuperação de Chunk:**
Não pelo processo padrão.
Cargas perigosas não são elegíveis para devolução padrão; o cliente deve acionar Gestão de Riscos (ramal 4500) para tratamento individual, e pode haver exceção autorizada caso a caso.

**Teste 3 - Acesso ao Git:**
Resumo do repositório local:

Branch atual:
Você está na branch cenario-2, rastreando origin/cenario-2.
Estado de sincronização aparente: alinhada com o remoto (sem indicador de ahead/behind).
Estado da árvore de trabalho:
Há mudanças locais não versionadas: a pasta pratica-2 aparece como untracked.
Não apareceu arquivo modificado ou staged já rastreado, apenas conteúdo novo nessa pasta.
Histórico recente (5 commits mais novos):
60fde09: Merge pull request #1 from ingrid-lohmann/cenario-1
866c838: ajustes pratica 1
6eab97d: exercicio 1.3
d13fa3e: exercicio 1.2
343773d: exercicio 1.1
Branches e upstream:
cenario-1 -> origin/cenario-1
cenario-2 -> origin/cenario-2
main -> origin/main
As três apontam para commits esperados, com main e cenario-2 no mesmo commit 60fde09.

## 3. Análise de Riscos e Mitigações
**Risco 1: Exposição de segredos e credenciais.** 
Um servidor `filesystem` configurado apontando para a raiz do projeto pode permitir que o agente leia arquivos sensíveis, como `.env` contendo senhas e chaves de API.
*Mitigação:* Aplicar a política de Menor Privilégio (Least Privilege), declarando no JSON apenas os caminhos exatos das subpastas necessárias para a tarefa.

**Risco 2: Modificação acidental de fontes de verdade.** 
O servidor `filesystem` com permissão de escrita irrestrita permite que a IA altere as regras de negócio sem revisão humana.
*Mitigação:* Tratar pastas de documentação de negócio (como `docs/novatech/` e `data/retrieval-corpus/`) com permissão estritamente de leitura (Read-Only) e exigir validação humana antes de commitar códigos alterados.