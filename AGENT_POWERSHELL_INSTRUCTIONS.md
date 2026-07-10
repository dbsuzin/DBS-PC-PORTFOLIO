================================================================================
           AGENTE POWER SHELL (SEM PYTHON)
           Para Windows - Sem necessidade de instalar nada extra
================================================================================

Seu site está no ar: https://dbs-pc-portfolio.vercel.app/

================================================================================
PASSO 1: CRIAR UMA EMPRESA E COPIAR A API KEY
================================================================================

1. Acesse: https://dbs-pc-portfolio.vercel.app/
2. Faça login com a senha que você definiu
3. Clique em "Nova Empresa"
4. Coloque o nome da empresa (ex: Cliente ABC)
5. Clique em Cadastrar
6. Na lista de empresas, clique na empresa criada
7. Copie a **API Key** (é uma string longa)

Guarde essa chave — você vai usar em todos os PCs daquela empresa.

================================================================================
PASSO 2: BAIXAR O SCRIPT
================================================================================

Baixe o arquivo:
→ scripts/agent.ps1

Coloque o arquivo em uma pasta fácil, exemplo:
C:\Scripts\agent.ps1

================================================================================
PASSO 3: EXECUTAR O SCRIPT (TESTE)
================================================================================

Abra o **PowerShell como Administrador** e rode:

```powershell
cd C:\Scripts
.\agent.ps1 -ApiKey "COLE_AQUI_A_API_KEY_DA_EMPRESA"
```

Exemplo completo:

```powershell
.\agent.ps1 -ApiKey "cm9kZ3JhbS1hcGkta2V5LWFwcGxpY2F0aW9uLWNsaWVudA"
```

Se der certo, vai aparecer:
✅ Sucesso! Computador registrado.

Volte no site e atualize a página — o computador deve aparecer.

================================================================================
PASSO 4: AGENDAR PARA RODAR TODO DIA (IMPORTANTE)
================================================================================

Para que o inventário fique atualizado automaticamente:

1. Pressione Windows + S e procure por "Agendador de Tarefas"
2. Clique em "Criar Tarefa Básica"
3. Nome: PC Portfolio - Atualizar Inventário
4. Gatilho: Diariamente
5. Ação: Iniciar um programa
6. Programa/script: powershell.exe
7. Adicionar argumentos:
   -ExecutionPolicy Bypass -File "C:\Scripts\agent.ps1" -ApiKey "SUA_API_KEY_AQUI"
8. Concluir

Pronto! O script vai rodar todo dia automaticamente.

================================================================================
COMO USAR EM VÁRIOS COMPUTADORES
================================================================================

- Cada empresa tem uma API Key diferente
- Copie o script para cada máquina
- Rode com a API Key da empresa correta
- Ou use o mesmo script e passe a chave via linha de comando

Dica: Você pode colocar o script em um servidor de arquivos e criar um atalho.

================================================================================
COMANDO RÁPIDO (uma linha)
================================================================================

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://dbs-pc-portfolio.vercel.app/scripts/agent.ps1 -OutFile agent.ps1; .\agent.ps1 -ApiKey SUA_CHAVE"
```

(útil para rodar rapidamente sem baixar manualmente)

================================================================================
O QUE O SCRIPT COLETA
================================================================================

- Hostname
- Fabricante e Modelo
- CPU + núcleos
- RAM (GB)
- Disco total
- Sistema Operacional + versão
- Data de instalação do Windows
- Última vez que o PC ligou
- IP e MAC
- Versão da BIOS
- GPU (se disponível)

================================================================================
DÚVIDAS COMUNS
================================================================================

Q: Precisa instalar Python?  
R: Não! Só PowerShell (vem no Windows).

Q: Precisa de internet?  
R: Sim, só no momento de enviar os dados.

Q: Posso rodar mais de uma vez no mesmo dia?  
R: Sim, ele atualiza o computador (não cria duplicado).

Q: Como vejo os dados?  
R: No site https://dbs-pc-portfolio.vercel.app/

================================================================================
