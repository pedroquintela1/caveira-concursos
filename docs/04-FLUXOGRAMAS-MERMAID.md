# Fluxogramas - KAV Concursos

**Versão:** 2.0  
**Data:** 18/10/2025  
**Última Atualização:** 18/10/2025 - Revisão Estratégica de Questões  
**Ferramenta:** Mermaid.js (compatível com GitHub, Notion, VS Code)

> **⚠️ MUDANÇA ESTRATÉGICA v2.0:**
>
> - **Removido fluxo de questões avulsas** (seção 3.1)
> - **Cadernos Personalizados** agora são o ÚNICO método de resolver questões (seção 3)
> - Adicionado fluxo de **Comentários com validação por plano** (seção 3.3)
> - Adicionado fluxo de **Materiais Extras (Premium)** (seção 3.4)

---

## 📑 Índice

1. [Autenticação e Onboarding](#1-autenticação-e-onboarding)
2. [Estudo de Leis](#2-estudo-de-leis)
3. [Sistema de Cadernos e Questões](#3-sistema-de-cadernos-e-questões)
4. [Mnemônicos](#4-mnemônicos)
5. [Flashcards e Repetição Espaçada](#5-flashcards-e-repetição-espaçada)
6. [Pagamentos e Assinaturas](#6-pagamentos-e-assinaturas)
7. [Dashboard e Estatísticas](#7-dashboard-e-estatísticas)
8. [Sistema de Inteligência de Bancas](#8-sistema-de-inteligência-de-bancas)
9. [Administração](#9-administração)

---

## 1. Autenticação e Onboarding

### 1.1 Fluxo de Cadastro com Email/Senha

```mermaid
flowchart TD
Start([Usuário clica Cadastrar]) --> Form[Preenche formulário]
Form --> Validate{Validação
Zod}

Validate -->|Erro| ShowError[Exibir erros no form]
ShowError --> Form

Validate -->|OK| CheckEmail{Email já<br/>existe?}
CheckEmail -->|Sim| ShowError2[Erro: Email já cadastrado]
ShowError2 --> Form

CheckEmail -->|Não| CreateAuth[Supabase: Criar auth.users]
CreateAuth --> SendEmail[Enviar email confirmação]
SendEmail --> CreateProfile[Criar profile no banco]
CreateProfile --> ShowSuccess[Mensagem: Verifique email]
ShowSuccess --> WaitConfirm[Usuário clica link email]
WaitConfirm --> ConfirmEmail{Token<br/>válido?}

ConfirmEmail -->|Não| ShowExpired[Erro: Link expirado]
ShowExpired --> ResendEmail[Reenviar email]
ResendEmail --> WaitConfirm

ConfirmEmail -->|Sim| ActivateAccount[Ativar conta]
ActivateAccount --> AutoLogin[Login automático]
AutoLogin --> Onboarding[Iniciar onboarding]
Onboarding --> End([Dashboard])

style CreateAuth fill:#10B981
style CreateProfile fill:#10B981
style End fill:#3B82F6

```

---

### 1.2 Fluxo de Login com Google OAuth

```mermaid
flowchart TD
Start([Usuário clica Login Google]) --> Redirect[Redirect para Google]
Redirect --> GoogleAuth{Google
autenticação}

GoogleAuth -->|Erro| ShowError[Erro: Permissão negada]
ShowError --> Start

GoogleAuth -->|Sucesso| Callback[Callback /auth/callback]
Callback --> CheckProfile{Profile<br/>existe?}

CheckProfile -->|Não| CreateProfile[Criar profile automático]
CreateProfile --> SetDefaults[Definir plano=free, etc]
SetDefaults --> Onboarding[Mostrar onboarding]

CheckProfile -->|Sim| UpdateLastAccess[Atualizar ultimo_acesso]
UpdateLastAccess --> CheckStreak[Atualizar streak]

Onboarding --> Dashboard([Dashboard])
CheckStreak --> Dashboard

style CreateProfile fill:#10B981
style Dashboard fill:#3B82F6

```

---

### 1.3 Fluxo de Onboarding (FTUE)

```mermaid
flowchart TD
Start([Primeiro acesso]) --> Welcome[Modal boas-vindas]
Welcome --> Q1[Pergunta 1: Qual concurso?]
Q1 --> Q2[Pergunta 2: Tempo estudo/dia?]
Q2 --> Q3[Pergunta 3: Já usa plataforma?]
Q3 --> SavePrefs[Salvar preferências]

SavePrefs --> Suggest[Sugerir primeiro artigo]
Suggest --> Tutorial[Tutorial interativo 4 steps]

Tutorial --> T1[Step 1: Ler artigo]
T1 --> T2[Step 2: Ver mnemônico]
T2 --> T3[Step 3: Criar flashcard]
T3 --> T4[Step 4: Resolver questão]
T4 --> Congrats[🎉 Primeira conquista]

Congrats --> Dashboard([Dashboard])

style SavePrefs fill:#10B981
style Congrats fill:#F59E0B
style Dashboard fill:#3B82F6

```

---

## 2. Estudo de Leis

### 2.1 Fluxo de Navegação na Biblioteca

```mermaid
flowchart TD
Start([Usuário clica Leis]) --> List[Listar disciplinas]
List --> SelectDisciplina[Seleciona disciplina]
SelectDisciplina --> ListLeis[Listar leis da disciplina]

ListLeis --> FilterLeis{Aplicar<br/>filtro?}
FilterLeis -->|Sim| ApplyFilter[Filtrar mais cobradas]
ApplyFilter --> ListLeis

FilterLeis -->|Não| SelectLei[Seleciona lei]
SelectLei --> ShowIndice[Exibir índice navegável]

ShowIndice --> SelectArtigo[Clica em artigo]
SelectArtigo --> LoadArtigo[Carregar artigo completo]
LoadArtigo --> ShowContent[Exibir conteúdo]

ShowContent --> Actions{Ação do<br/>usuário}

Actions -->|Marcar estudado| MarkStudied[Atualizar progresso]
MarkStudied --> UpdateDB[Salvar no banco]
UpdateDB --> ShowContent

Actions -->|Ver mnemônicos| LoadMnemonics[Buscar mnemônicos]
LoadMnemonics --> ShowMnemonics[Exibir lista ordenada]
ShowMnemonics --> ShowContent

Actions -->|Resolver questões| FilterQuestoes[Filtrar por artigo]
FilterQuestoes --> RedirectQuestoes([Página Questões])

Actions -->|Próximo artigo| NextArtigo[Artigo seguinte]
NextArtigo --> LoadArtigo

style MarkStudied fill:#10B981
style UpdateDB fill:#10B981

```

---

### 2.2 Fluxo de Busca de Artigo

```mermaid
flowchart TD
Start([Usuário digita busca]) --> Debounce[Debounce 300ms]
Debounce --> Query[Query full-text search]

Query --> HasResults{Tem<br/>resultados?}

HasResults -->|Não| ShowEmpty[Mensagem: Nenhum resultado]
ShowEmpty --> Suggest[Sugerir artigos populares]

HasResults -->|Sim| RankResults[Ordenar por relevância]
RankResults --> ShowResults[Exibir lista]

ShowResults --> SelectResult[Usuário seleciona]
SelectResult --> LoadArtigo([Visualizar artigo])

style Query fill:#3B82F6
style LoadArtigo fill:#10B981

```

---

## 3. Sistema de Cadernos e Questões

> **⚠️ IMPORTANTE:** Questões avulsas foram **REMOVIDAS**. Todas as questões são resolvidas **EXCLUSIVAMENTE através de Cadernos Personalizados**.

### 3.1 Fluxo de Criar Caderno

```mermaid
flowchart TD
Start([Usuário clica Criar Caderno]) --> CheckAuth{Autenticado?}
CheckAuth -->|Não| RedirectLogin([Redirect Login])

CheckAuth -->|Sim| CheckPlan[Verificar plano]
CheckPlan --> CountCadernos[Contar cadernos ativos]

CountCadernos --> CheckLimit{Atingiu<br/>limite?}
CheckLimit -->|Sim FREE 2/2| ShowPaywallBasic[Paywall: Plano FREE permite apenas 2 cadernos]
ShowPaywallBasic --> UpgradeBasic([Upgrade para BÁSICO])

CheckLimit -->|Sim BÁSICO 10/10| ShowPaywallPremium[Paywall: Plano BÁSICO permite apenas 10 cadernos]
ShowPaywallPremium --> UpgradePremium([Upgrade para PREMIUM])

CheckLimit -->|Não| ShowForm[Exibir formulário]
ShowForm --> InputNome[Nome do caderno]
InputNome --> InputDesc[Descrição opcional]
InputDesc --> SelectPasta[Selecionar pasta]

SelectPasta --> ApplyFilters[Aplicar filtros]
ApplyFilters --> SelectDisciplina[Disciplina múltipla]
SelectDisciplina --> SelectBanca[Banca opcional]
SelectBanca --> SelectAno[Ano range]
SelectAno --> SelectOrgao[Órgão opcional]
SelectOrgao --> SelectDificuldade[Dificuldade]

SelectDificuldade --> PreviewStats[Preview estatísticas]
PreviewStats --> ShowTotal[Total: X questões]
ShowTotal --> ShowDistribuicao[Gráfico distribuição assuntos]
ShowDistribuicao --> ShowDificuldade[Dificuldade média]
ShowDificuldade --> ShowComparacao[Comparação vs comunidade]

ShowComparacao --> ConfirmCreate{Confirmar<br/>criação?}
ConfirmCreate -->|Não| ShowForm

ConfirmCreate -->|Sim| ValidateMax{Máx por<br/>caderno?}
ValidateMax -->|FREE > 50| ShowLimitError[Erro: FREE permite máx 50 questões/caderno]
ShowLimitError --> ShowForm

ValidateMax -->|BÁSICO > 200| ShowLimitError2[Erro: BÁSICO permite máx 200 questões/caderno]
ShowLimitError2 --> ShowForm

ValidateMax -->|PREMIUM > 500| ShowLimitError3[Erro: PREMIUM permite máx 500 questões/caderno]
ShowLimitError3 --> ShowForm

ValidateMax -->|OK| SaveCaderno[Salvar caderno no banco]
SaveCaderno --> SaveFiltros[Salvar filtros JSON]
SaveFiltros --> QueryQuestoes[Buscar questões com filtros]
QueryQuestoes --> InsertRelations[Inserir em cadernos_questoes]
InsertRelations --> UpdateCount[Atualizar total_questoes]

UpdateCount --> ShowSuccess[✅ Caderno criado com sucesso]
ShowSuccess --> SuggestStart{Resolver<br/>agora?}
SuggestStart -->|Sim| ResolverCaderno([Resolver Caderno])
SuggestStart -->|Não| ListaCadernos([Lista de Cadernos])

style SaveCaderno fill:#10B981
style ShowSuccess fill:#10B981
style ShowPaywallBasic fill:#F59E0B
style ShowPaywallPremium fill:#F59E0B

```

---

### 3.2 Fluxo de Resolver Caderno com Validação de Plano

```mermaid
flowchart TD
Start([Usuário abre caderno]) --> LoadCaderno[Carregar dados do caderno]
LoadCaderno --> LoadQuestoes[Buscar questões do caderno]
LoadQuestoes --> OrderByOrdem[Ordenar por ordem]
OrderByOrdem --> CheckProgress[Verificar progresso]

CheckProgress --> HasProgress{Já iniciou<br/>antes?}
HasProgress -->|Sim| ShowResume[Mostrar: Continuar de onde parou]
HasProgress -->|Não| ShowStart[Mostrar: Iniciar caderno]

ShowResume --> FilterOptions[Opções de filtro]
ShowStart --> FilterOptions

FilterOptions --> ApplyFilter{Aplicar<br/>filtro?}
ApplyFilter -->|Apenas não respondidas| RemoveAnswered[Remover respondidas]
ApplyFilter -->|Apenas erradas| FilterWrong[Filtrar apenas erradas]
ApplyFilter -->|Todas| ShowAll[Mostrar todas]

RemoveAnswered --> StartSession
FilterWrong --> StartSession
ShowAll --> StartSession

StartSession[Iniciar sessão]
StartSession --> CheckDailyLimit{FREE +<br/>limite diário?}

CheckDailyLimit -->|Sim 5/5| ShowDailyPaywall[Paywall: Limite de 5 questões/dia atingido]
ShowDailyPaywall --> UpgradeBasico([Upgrade para BÁSICO])

CheckDailyLimit -->|Não| ShowProgress[Barra progresso: X/Y questões]
ShowProgress --> ShowQ1[Exibir questão 1]

ShowQ1 --> ReadQuestion[Usuário lê enunciado]
ReadQuestion --> SelectAlternative[Seleciona alternativa A-E]
SelectAlternative --> ClickResponder[Clica Responder]

ClickResponder --> IncrementDaily[Incrementar contador diário]
IncrementDaily --> SaveResposta[Salvar resposta + caderno_id]
SaveResposta --> TriggerStats[Trigger: Atualizar estatísticas]
TriggerStats --> UpdateCaderno[Atualizar questoes_respondidas]

UpdateCaderno --> ShowFeedback{Correto?}
ShowFeedback -->|Sim| ShowCorrect[✅ Feedback positivo]
ShowCorrect --> AddPoints[+10 pontos]

ShowFeedback -->|Não| ShowIncorrect[❌ Feedback negativo]
ShowIncorrect --> ShowGabarito[Mostrar gabarito correto]

AddPoints --> ShowExplicacao[Exibir explicação]
ShowGabarito --> ShowExplicacao

ShowExplicacao --> ShowRelated[Link artigo relacionado]
ShowRelated --> SuggestMnemonic[Sugerir mnemônico]

SuggestMnemonic --> ShowComments{Plano permite<br/>comentários?}
ShowComments -->|FREE| ShowCommentPaywall[🔒 Ver comentários: Assine BÁSICO]
ShowCommentPaywall --> ShowMaterials

ShowComments -->|BÁSICO/PREMIUM| LoadComments[Carregar comentários]
LoadComments --> ShowCommentsList[Exibir comentários comunidade + professor]
ShowCommentsList --> ShowMaterials

ShowMaterials{Plano permite<br/>materiais?}
ShowMaterials -->|FREE/BÁSICO| ShowMaterialPaywall[🔒 Materiais extras: Assine PREMIUM]
ShowMaterialPaywall --> NextQuestion

ShowMaterials -->|PREMIUM| LoadMaterials[Carregar materiais extras]
LoadMaterials --> ShowVideos[Exibir vídeo-aulas, PDFs, links]
ShowVideos --> NextQuestion

NextQuestion{Próxima<br/>questão?}
NextQuestion -->|Sim| CheckDailyLimit
NextQuestion -->|Não| CheckComplete{Todas<br/>respondidas?}

CheckComplete -->|Sim| MarkComplete[Marcar caderno concluído]
MarkComplete --> CalculateTaxa[Calcular taxa_acerto]
CalculateTaxa --> ShowReport[Exibir relatório desempenho]
ShowReport --> AddBadge[Badge: Caderno Completo +50 pontos]
AddBadge --> Finish([Dashboard])

CheckComplete -->|Não| SavePartial[Salvar progresso]
SavePartial --> Finish

style SaveResposta fill:#10B981
style ShowCorrect fill:#10B981
style ShowIncorrect fill:#EF4444
style ShowCommentPaywall fill:#F59E0B
style ShowMaterialPaywall fill:#F59E0B
style ShowDailyPaywall fill:#EF4444
```

---

### 3.3 Fluxo de Comentários (BÁSICO e PREMIUM)

```mermaid
flowchart TD
Start([Usuário clica Criar Simulado]) --> SelectOptions[Selecionar opções]
SelectOptions --> SetQuantity[Definir quantidade: 10/20/30/50]
SetQuantity --> SetMode[Modo: Prova Real]
SetMode --> ConfirmStart[Confirmar início]

ConfirmStart --> StartTimer[Iniciar timer]
StartTimer --> Q1[Questão 1]

Q1 --> Answer1[Responder]
Answer1 --> SaveTemp[Salvar temporariamente]
SaveTemp --> CheckTime{Tempo<br/>acabou?}

CheckTime -->|Sim| ForceFinish[Finalizar automaticamente]
ForceFinish --> CalculateResults

CheckTime -->|Não| NextQ{Última<br/>questão?}
NextQ -->|Não| Q2[Próxima questão]
Q2 --> Answer1

NextQ -->|Sim| ClickFinish[Usuário clica Finalizar]
ClickFinish --> ConfirmFinish{Confirmar<br/>finalização?}
ConfirmFinish -->|Não| Q1

ConfirmFinish -->|Sim| CalculateResults[Calcular resultados]
CalculateResults --> SaveAll[Salvar todas respostas]
SaveAll --> GenerateReport[Gerar relatório]

GenerateReport --> ShowResults[Exibir tela resultados]
ShowResults --> DisplayStats[Nota, tempo, acertos/erros]
DisplayStats --> ShowComparison[Comparar com comunidade]
ShowComparison --> ShowWeak[Identificar pontos fracos]
ShowWeak --> SuggestReview[Sugerir revisão]
SuggestReview --> End([Dashboard])

style StartTimer fill:#F59E0B
style CalculateResults fill:#3B82F6
style SaveAll fill:#10B981

```

---

### 3.3 Fluxo de Comentários (BÁSICO e PREMIUM)

```mermaid
flowchart TD
Start([Usuário clica aba Comentários]) --> CheckPlan{Verificar<br/>plano}

CheckPlan -->|FREE| ShowPaywall[🔒 Paywall: Comentários disponíveis no plano BÁSICO]
ShowPaywall --> ShowBenefits[Listar benefícios BÁSICO]
ShowBenefits --> UpgradeButton[Botão: Assinar BÁSICO]
UpgradeButton --> CheckoutFlow([Fluxo Pagamento])

CheckPlan -->|BÁSICO/PREMIUM| LoadComments[Carregar comentários da questão]
LoadComments --> HasComments{Tem<br/>comentários?}

HasComments -->|Não| ShowEmpty[Mensagem: Nenhum comentário ainda]
ShowEmpty --> SuggestFirst[Seja o primeiro a comentar]
SuggestFirst --> CheckCanComment

HasComments -->|Sim| OrderComments[Ordenar por votos]
OrderComments --> FilterTypes[Filtrar por tipo]
FilterTypes --> ShowProfessor[Destacar comentário do Professor]
ShowProfessor --> ShowCommunity[Comentários da comunidade]

ShowCommunity --> ShowVoting[Sistema de votação 👍👎]
ShowVoting --> CheckCanComment{Pode<br/>comentar?}

CheckCanComment -->|BÁSICO| ShowCommentDisabled[Apenas leitura]
ShowCommentDisabled --> End([Voltar questão])

CheckCanComment -->|PREMIUM| ShowCommentForm[Exibir formulário comentário]
ShowCommentForm --> TypeComment[Usuário digita comentário]
TypeComment --> ValidateLength{Min 10<br/>chars?}

ValidateLength -->|Não| ShowError[Erro: Mínimo 10 caracteres]
ShowError --> TypeComment

ValidateLength -->|Sim| PreviewComment[Preview antes de publicar]
PreviewComment --> ConfirmPublish{Confirmar?}
ConfirmPublish -->|Não| TypeComment

ConfirmPublish -->|Sim| CheckSpam{Mais de 5<br/>hoje?}
CheckSpam -->|Sim| ShowLimitError[Erro: Limite diário atingido]
ShowLimitError --> End

CheckSpam -->|Não| SaveComment[Salvar comentário no banco]
SaveComment --> NotifyModerators[Notificar moderadores]
NotifyModerators --> ShowSuccess[✅ Comentário publicado]
ShowSuccess --> RefreshList[Atualizar lista]
RefreshList --> End

style ShowPaywall fill:#F59E0B
style SaveComment fill:#10B981
style ShowSuccess fill:#10B981

```

---

### 3.4 Fluxo de Materiais Extras (PREMIUM)

```mermaid
flowchart TD
Start([Usuário clica aba Materiais]) --> CheckPlan{Verificar<br/>plano}

CheckPlan -->|FREE/BÁSICO| ShowPaywall[🔒 Paywall: Materiais extras exclusivos PREMIUM]
ShowPaywall --> ShowBenefits[Listar benefícios PREMIUM]
ShowBenefits --> ListFeatures[• Vídeo-aulas<br/>• PDFs resumo<br/>• Links externos<br/>• Download offline]
ListFeatures --> ShowPrice[Por apenas R$ 79,90/mês]
ShowPrice --> UpgradeButton[Botão: Assinar PREMIUM]
UpgradeButton --> CheckoutFlow([Fluxo Pagamento])

CheckPlan -->|PREMIUM| LoadMaterials[Carregar materiais da questão]
LoadMaterials --> HasMaterials{Tem<br/>materiais?}

HasMaterials -->|Não| ShowEmpty[Mensagem: Nenhum material disponível ainda]
ShowEmpty --> SuggestOther[Sugestão: Ver outras questões]
SuggestOther --> End([Voltar questão])

HasMaterials -->|Sim| GroupByType[Agrupar por tipo]
GroupByType --> ShowVideos[📹 Vídeo-aulas]
ShowVideos --> ShowPDFs[📄 PDFs]
ShowPDFs --> ShowLinks[🔗 Links externos]

ShowLinks --> UserAction{Ação do<br/>usuário}

UserAction -->|Assistir vídeo| OpenVideoPlayer[Abrir player embutido]
OpenVideoPlayer --> TrackProgress[Rastrear progresso]
TrackProgress --> MarkWatched[Marcar como assistido]
MarkWatched --> End

UserAction -->|Baixar PDF| CheckSize{Tamanho<br/>OK?}
CheckSize -->|> 10MB| ShowWarning[Aviso: Arquivo grande]
ShowWarning --> ConfirmDownload{Confirmar?}
ConfirmDownload -->|Não| End

CheckSize -->|< 10MB| DownloadFile[Iniciar download]
ConfirmDownload -->|Sim| DownloadFile

DownloadFile --> TrackDownload[Registrar download]
TrackDownload --> ShowDownloadSuccess[✅ Download concluído]
ShowDownloadSuccess --> End

UserAction -->|Abrir link| ValidateURL[Validar URL externa]
ValidateURL --> ShowExternalWarning[Aviso: Saindo do site]
ShowExternalWarning --> ConfirmExternal{Continuar?}
ConfirmExternal -->|Não| End
ConfirmExternal -->|Sim| OpenNewTab[Abrir em nova aba]
OpenNewTab --> TrackClick[Registrar clique]
TrackClick --> End

style ShowPaywall fill:#F59E0B
style DownloadFile fill:#10B981
style ShowDownloadSuccess fill:#10B981
style OpenVideoPlayer fill:#3B82F6

```

---

## 4. Mnemônicos

### 4.1 Fluxo de Visualizar Mnemônicos

```mermaid
flowchart TD
Start([Usuário visualiza artigo]) --> LoadMnemonics[Carregar mnemônicos do artigo]
LoadMnemonics --> HasMnemonics{Tem
mnemônicos?}

HasMnemonics -->|Não| ShowEmpty[Mensagem: Nenhum mnemônico]
ShowEmpty --> SuggestCreate[Botão: Criar primeiro]
SuggestCreate --> CreateFlow([Fluxo Criar Mnemônico])

HasMnemonics -->|Sim| OrderByScore[Ordenar por score]
OrderByScore --> ShowValidated[Mostrar validados primeiro]
ShowValidated --> ShowList[Exibir lista]

ShowList --> UserAction{Ação do<br/>usuário}

UserAction -->|Votar útil| CheckVoted{Já votou<br/>neste?}
CheckVoted -->|Sim| UpdateVote[Atualizar voto]
CheckVoted -->|Não| InsertVote[Inserir novo voto]
UpdateVote --> TriggerRecalc[Trigger: Recalcular score]
InsertVote --> TriggerRecalc
TriggerRecalc --> RefreshList[Atualizar lista]
RefreshList --> ShowList

UserAction -->|Adicionar flashcard| CheckExists{Flashcard<br/>já existe?}
CheckExists -->|Sim| ShowMessage[Mensagem: Já adicionado]
ShowMessage --> ShowList
CheckExists -->|Não| CreateFlashcard[Criar flashcard]
CreateFlashcard --> SetInterval[Intervalo = 1 dia]
SetInterval --> ShowSuccess[✅ Adicionado]
ShowSuccess --> ShowList

UserAction -->|Criar mnemônico| CreateFlow

style InsertVote fill:#10B981
style CreateFlashcard fill:#10B981

```

---

### 4.2 Fluxo de Criar Mnemônico

```mermaid
flowchart TD
Start([Usuário clica Criar]) --> ShowForm[Exibir formulário]
ShowForm --> TypeText[Digitar mnemônico]
TypeText --> CheckLength{Mín 10
chars?}

CheckLength -->|Não| ShowError[Erro: Muito curto]
ShowError --> TypeText

CheckLength -->|Sim| Preview[Preview antes publicar]
Preview --> ConfirmPublish{Confirmar<br/>publicação?}

ConfirmPublish -->|Não| TypeText

ConfirmPublish -->|Sim| CheckSpam{Mais de 5<br/>hoje?}
CheckSpam -->|Sim| ShowLimit[Erro: Limite diário]
ShowLimit --> End([Voltar artigo])

CheckSpam -->|Não| SaveDB[Salvar no banco]
SaveDB --> SetUnvalidated[is_validado = false]
SetUnvalidated --> Notify[Notificar moderadores]
Notify --> ShowSuccess[✅ Publicado com sucesso]
ShowSuccess --> UpdateList[Adicionar na lista]
UpdateList --> End

style SaveDB fill:#10B981
style ShowSuccess fill:#10B981

```

---

### 4.3 Fluxo de Moderação de Mnemônicos (Admin)

```mermaid
flowchart TD
Start([Admin acessa painel]) --> LoadQueue[Carregar fila moderação]
LoadQueue --> HasPending{Tem
pendentes?}

HasPending -->|Não| ShowEmpty[Mensagem: Nada pendente]
ShowEmpty --> End([Dashboard])

HasPending -->|Sim| ShowFirst[Exibir primeiro]
ShowFirst --> AdminReview{Decisão<br/>admin}

AdminReview -->|Aprovar| SetValidated[is_validado = true]
SetValidated --> SaveValidador[validado_por = admin_id]
SaveValidador --> NotifyAuthor[Notificar autor]
NotifyAuthor --> NextItem

AdminReview -->|Reprovar| DeleteMnemonic[Deletar mnemônico]
DeleteMnemonic --> NotifyRejection[Notificar autor motivo]
NotifyRejection --> NextItem

AdminReview -->|Editar| ShowEditForm[Formulário edição]
ShowEditForm --> UpdateText[Corrigir texto]
UpdateText --> SetValidated

NextItem{Mais<br/>pendentes?}
NextItem -->|Sim| ShowFirst
NextItem -->|Não| ShowEmpty

style SetValidated fill:#10B981
style DeleteMnemonic fill:#EF4444

```

---

## 5. Flashcards e Repetição Espaçada

### 5.1 Fluxo de Criar Flashcard

```mermaid
flowchart TD
Start([Usuário clica Adicionar Flashcard]) --> CheckAuth{Autenticado?}
CheckAuth -->|Não| ShowLogin([Redirect Login])

CheckAuth -->|Sim| CheckExists{Flashcard<br/>já existe?}
CheckExists -->|Sim| ShowMessage[Mensagem: Já adicionado]
ShowMessage --> End([Voltar])

CheckExists -->|Não| SelectMnemonic{Escolher<br/>mnemônico?}
SelectMnemonic -->|Não| CreateBasic[Criar flashcard básico]
SelectMnemonic -->|Sim| LinkMnemonic[Associar mnemônico_id]

CreateBasic --> SetDefaults[Definir valores padrão]
LinkMnemonic --> SetDefaults

SetDefaults --> SetInterval[intervalo = 1 dia]
SetInterval --> SetReps[repeticoes = 0]
SetReps --> SetEase[facilidade = 2.5]
SetEase --> SetNextReview[proxima_revisao = hoje]

SetNextReview --> SaveDB[Salvar no banco]
SaveDB --> ShowSuccess[✅ Flashcard criado]
ShowSuccess --> Suggest[Sugerir revisar agora?]
Suggest --> UserChoice{Usuário<br/>aceita?}

UserChoice -->|Sim| StartReview([Fluxo Revisar])
UserChoice -->|Não| End

style SaveDB fill:#10B981
style ShowSuccess fill:#10B981

```

---

### 5.2 Fluxo de Revisar Flashcards (Algoritmo SM-2)

```mermaid
flowchart TD
Start([Usuário clica Revisar]) --> LoadPending[Buscar flashcards pendentes]
LoadPending --> FilterToday[WHERE proxima_revisao <= hoje]
FilterToday --> HasFlashcards{Tem
pendentes?}

HasFlashcards -->|Não| ShowEmpty[Mensagem: Nenhuma revisão hoje]
ShowEmpty --> ShowNext[Próxima revisão: amanhã X cards]
ShowNext --> End([Dashboard])

HasFlashcards -->|Sim| ShowCount[Mostrar: X flashcards]
ShowCount --> StartSession[Iniciar sessão]
StartSession --> ShowFront[Exibir FRENTE]

ShowFront --> DisplayArtigo[Artigo: CF Art. 5º, LXXVIII]
DisplayArtigo --> UserFlip[Usuário clica flip]
UserFlip --> Animate[Animação CSS 3D flip]
Animate --> ShowBack[Exibir VERSO]

ShowBack --> DisplayMnemonic[Mnemônico: RDP]
DisplayMnemonic --> UserRate{Usuário<br/>avalia}

UserRate -->|Difícil| SetDificil[intervalo = 1 dia]
UserRate -->|Médio| SetMedio[intervalo atual × 1.5]
UserRate -->|Fácil| SetFacil[intervalo atual × 2]
UserRate -->|Muito Fácil| SetMuitoFacil[intervalo atual × 3]

SetDificil --> AdjustEase1[facilidade -= 0.2]
SetMedio --> AdjustEase2[facilidade inalterado]
SetFacil --> AdjustEase3[facilidade += 0.1]
SetMuitoFacil --> AdjustEase4[facilidade += 0.15]

AdjustEase1 --> CalculateNext
AdjustEase2 --> CalculateNext
AdjustEase3 --> CalculateNext
AdjustEase4 --> CalculateNext

CalculateNext[Calcular próxima_revisao]
CalculateNext --> IncrementReps[repeticoes += 1]
IncrementReps --> SaveProgress[Salvar no banco]
SaveProgress --> NextCard{Mais<br/>flashcards?}

NextCard -->|Sim| ShowFront
NextCard -->|Não| ShowSummary[Exibir resumo sessão]
ShowSummary --> ShowStats[X revisados, próxima em Y dias]
ShowStats --> AddPoints[+10 pontos por sessão]
AddPoints --> End

style SaveProgress fill:#10B981
style AddPoints fill:#F59E0B

```

---

## 6. Cadernos Personalizados

### 6.1 Fluxo de Criar Caderno

```mermaid
flowchart TD
Start([Usuário clica Criar Caderno]) --> ShowForm[Formulário criação]
ShowForm --> InputName[Nome do caderno]
InputName --> SelectPasta[Selecionar pasta]
SelectPasta --> ApplyFilters[Aplicar filtros]

ApplyFilters --> SelectDisciplina[Disciplina]
SelectDisciplina --> SelectBanca[Banca opcional]
SelectBanca --> SelectAno[Ano opcional]
SelectAno --> SelectDificuldade[Dificuldade opcional]

SelectDificuldade --> PreviewCount[Preview: X questões]
PreviewCount --> ShowStats[Estatísticas distribuição]
ShowStats --> ConfirmCreate{Confirmar<br/>criação?}

ConfirmCreate -->|Não| ShowForm

ConfirmCreate -->|Sim| SaveCaderno[Salvar caderno]
SaveCaderno --> SaveFiltros[Salvar filtros JSON]
SaveFiltros --> QueryQuestoes[Buscar questões com filtros]
QueryQuestoes --> InsertRelations[Inserir em cadernos_questoes]
InsertRelations --> UpdateCount[Atualizar total_questoes]

UpdateCount --> ShowSuccess[✅ Caderno criado]
ShowSuccess --> SuggestStart[Sugerir começar agora?]
SuggestStart --> UserChoice{Usuário<br/>aceita?}

UserChoice -->|Sim| StartResolve([Resolver caderno])
UserChoice -->|Não| Redirect([Página Cadernos])

style SaveCaderno fill:#10B981
style InsertRelations fill:#10B981

```

---

### 6.2 Fluxo de Resolver Caderno

```mermaid
flowchart TD
Start([Usuário clica Resolver]) --> LoadCaderno[Carregar caderno]
LoadCaderno --> LoadQuestoes[Buscar questões do caderno]
LoadQuestoes --> OrderByOrdem[Ordenar por ordem]
OrderByOrdem --> FilterAnswered{Filtrar
respondidas?}

FilterAnswered -->|Sim| RemoveAnswered[Remover já respondidas]
RemoveAnswered --> StartSession

FilterAnswered -->|Não| StartSession[Iniciar sessão]
StartSession --> ShowProgress[Barra progresso: 1/30]
ShowProgress --> ShowQ1[Exibir questão 1]

ShowQ1 --> UserAnswers[Usuário responde]
UserAnswers --> SaveResposta[Salvar resposta]
SaveResposta --> UpdateCaderno[Atualizar questoes_respondidas]
UpdateCaderno --> ShowFeedback[Feedback]

ShowFeedback --> NextQ{Próxima<br/>questão?}
NextQ -->|Sim| UpdateProgress[Atualizar progresso]
UpdateProgress --> ShowQ2[Questão 2]
ShowQ2 --> UserAnswers

NextQ -->|Não| MarkComplete{Todas<br/>respondidas?}
MarkComplete -->|Sim| SetConcluido[is_concluido = true]
SetConcluido --> CalculateTaxa[Calcular taxa_acerto]
CalculateTaxa --> SaveStats[Salvar estatísticas]
SaveStats --> ShowReport[Exibir relatório]

MarkComplete -->|Não| SavePartial[Salvar progresso]
SavePartial --> ShowReport

ShowReport --> DisplayResults[Nota, tempo, distribuição]
DisplayResults --> Suggest[Sugerir revisão]
Suggest --> End([Página Cadernos])

style SaveResposta fill:#10B981
style SetConcluido fill:#10B981

```

---

## 7. Pagamentos e Assinaturas

### 7.1 Fluxo de Upgrade para Plano Pago

```mermaid
flowchart TD
Start([Usuário clica Upgrade]) --> ShowPlans[Exibir planos]
ShowPlans --> SelectPlan{Selecionar
plano}

SelectPlan -->|Básico R$39,90| SetBasic[plano = basic]
SelectPlan -->|Premium R$79,90| SetPremium[plano = premium]

SetBasic --> CheckCoupon
SetPremium --> CheckCoupon

CheckCoupon{Tem<br/>cupom?}
CheckCoupon -->|Sim| ValidateCoupon[Validar cupom]
ValidateCoupon --> ApplyDiscount[Aplicar desconto]
ApplyDiscount --> CreateCheckout

CheckCoupon -->|Não| CreateCheckout[Criar Stripe Checkout Session]

CreateCheckout --> GetCustomer{Customer<br/>existe?}
GetCustomer -->|Não| CreateCustomer[Criar Stripe Customer]
CreateCustomer --> LinkProfile[Salvar customer_id no profile]
LinkProfile --> GenerateSession

GetCustomer -->|Sim| GenerateSession[Gerar session URL]
GenerateSession --> RedirectStripe[Redirect para Stripe]

RedirectStripe --> UserPays[Usuário paga no Stripe]
UserPays --> PaymentResult{Pagamento<br/>sucesso?}

PaymentResult -->|Não| ShowError[Exibir erro]
ShowError --> RetryPayment{Tentar<br/>novamente?}
RetryPayment -->|Sim| RedirectStripe
RetryPayment -->|Não| Cancel([Cancelar])

PaymentResult -->|Sim| WebhookReceived[Webhook: checkout.completed]
WebhookReceived --> ValidateSignature{Assinatura<br/>válida?}

ValidateSignature -->|Não| LogError[Log erro + alerta]
LogError --> ManualReview([Revisão manual])

ValidateSignature -->|Sim| UpdateProfile[Atualizar profile.plano]
UpdateProfile --> CreateSubscription[Inserir em subscriptions]
CreateSubscription --> SetDates[Definir period_start/end]
SetDates --> SendEmail[Enviar email confirmação]
SendEmail --> RedirectSuccess[Redirect /sucesso]

RedirectSuccess --> ShowCongrats[🎉 Parabéns!]
ShowCongrats --> UnlockFeatures[Desbloquear features]
UnlockFeatures --> Dashboard([Dashboard])

style CreateCustomer fill:#10B981
style UpdateProfile fill:#10B981
style CreateSubscription fill:#10B981

```

---

### 7.2 Fluxo de Cancelamento de Assinatura

```mermaid
flowchart TD
Start([Usuário clica Cancelar]) --> ShowConfirmation[Modal confirmação]
ShowConfirmation --> ShowWarning[Aviso: Perderá acesso em X dias]
ShowWarning --> OfferDiscount[Oferecer 20% desconto?]

OfferDiscount --> UserDecision{Decisão<br/>usuário}

UserDecision -->|Aceitar desconto| ApplyCoupon[Aplicar cupom 20%]
ApplyCoupon --> UpdateStripe[Atualizar subscription]
UpdateStripe --> KeepActive([Manter ativo])

UserDecision -->|Cancelar mesmo assim| AskFeedback[Perguntar motivo]
AskFeedback --> SaveFeedback[Salvar feedback]
SaveFeedback --> CancelStripe[Stripe: Cancelar subscription]

CancelStripe --> SetCancelAt[cancel_at = fim do período]
SetCancelAt --> WebhookCancel[Webhook: subscription.updated]
WebhookCancel --> UpdateDB[Atualizar subscriptions]
UpdateDB --> SendConfirmation[Email: Cancelamento confirmado]
SendConfirmation --> ShowMessage[Mensagem: Ativo até DD/MM]

ShowMessage --> WaitExpire[Aguardar expiração]
WaitExpire --> WebhookExpire[Webhook: subscription.deleted]
WebhookExpire --> DowngradePlan[profile.plano = free]
DowngradePlan --> DisableFeatures[Aplicar limites]
DisableFeatures --> NotifyExpired[Email: Assinatura expirada]
NotifyExpired --> End([Dashboard FREE])

style CancelStripe fill:#F59E0B
style DowngradePlan fill:#EF4444

```

---

### 7.3 Fluxo de Webhook Stripe (Pagamento Falhou)

```mermaid
flowchart TD
Start([Webhook: payment_failed]) --> ValidateSignature{Assinatura
válida?}
ValidateSignature -->|Não| LogError[Log erro]
LogError --> End([Ignorar])

ValidateSignature -->|Sim| ParsePayload[Parse evento]
ParsePayload --> GetSubscription[Buscar subscription]
GetSubscription --> UpdateStatus[status = past_due]

UpdateStatus --> CheckAttempts{Quantas<br/>tentativas?}

CheckAttempts -->|1ª tentativa| SendReminder1[Email: Problema pagamento]
SendReminder1 --> SetRetry[Stripe: Retry em 3 dias]
SetRetry --> End

CheckAttempts -->|2ª tentativa| SendReminder2[Email: Urgente]
SendReminder2 --> SetRetry2[Stripe: Retry em 5 dias]
SetRetry2 --> End

CheckAttempts -->|3ª tentativa| SendFinal[Email: Última chance]
SendFinal --> SetRetry3[Stripe: Retry em 7 dias]
SetRetry3 --> End

CheckAttempts -->|4ª tentativa| CancelSubscription[Cancelar assinatura]
CancelSubscription --> DowngradeFree[plano = free]
DowngradeFree --> DisableFeatures[Aplicar limites]
DisableFeatures --> SendCanceled[Email: Assinatura cancelada]
SendCanceled --> End

style DowngradeFree fill:#EF4444
style SendCanceled fill:#EF4444

```

---

## 8. Dashboard e Estatísticas

### 8.1 Fluxo de Carregamento do Dashboard

```mermaid
flowchart TD
Start([Usuário acessa /dashboard]) --> CheckAuth{Autenticado?}
CheckAuth -->|Não| RedirectLogin([Redirect /login])

CheckAuth -->|Sim| LoadProfile[Buscar profile]
LoadProfile --> ParallelQueries{Queries<br/>paralelas}

ParallelQueries --> Q1[Query: Estatísticas gerais]
ParallelQueries --> Q2[Query: Leis em progresso]
ParallelQueries --> Q3[Query: Flashcards pendentes]
ParallelQueries --> Q4[Query: Últimas 7 respostas]
ParallelQueries --> Q5[Query: Conquistas]

Q1 --> WaitAll[Aguardar todas queries]
Q2 --> WaitAll
Q3 --> WaitAll
Q4 --> WaitAll
Q5 --> WaitAll

WaitAll --> ProcessData[Processar dados]
ProcessData --> CalculateStreak[Calcular streak]
CalculateStreak --> UpdateStreak{Precisa<br/>atualizar?}

UpdateStreak -->|Sim| UpdateDB[Atualizar banco]
UpdateDB --> RenderComponents

UpdateStreak -->|Não| RenderComponents[Renderizar componentes]

RenderComponents --> ShowCards[Cards de métricas]
ShowCards --> ShowChart[Gráfico evolução]
ShowChart --> ShowProgress[Progresso leis]
ShowProgress --> ShowPending[Revisões pendentes]
ShowPending --> ShowActions[Ações rápidas]
ShowActions --> End([Dashboard pronto])

style LoadProfile fill:#3B82F6
style RenderComponents fill:#10B981

```

---

### 8.2 Fluxo de Gerar Relatório de Desempenho

```mermaid
flowchart TD
Start([Usuário clica Estatísticas]) --> SelectPeriod[Selecionar período]
SelectPeriod --> Period{Qual
período?}

Period -->|Últimos 7 dias| Set7Days[date_start = hoje - 7]
Period -->|Últimos 30 dias| Set30Days[date_start = hoje - 30]
Period -->|Personalizado| CustomRange[Usuário define range]

Set7Days --> QueryRespostas
Set30Days --> QueryRespostas
CustomRange --> QueryRespostas

QueryRespostas[Buscar respostas do período]
QueryRespostas --> GroupByDisciplina[GROUP BY disciplina]
GroupByDisciplina --> CalculateStats[Calcular estatísticas]

CalculateStats --> CalcTotal[total_respondidas]
CalcTotal --> CalcAcertos[total_acertos]
CalcAcertos --> CalcTaxa[taxa_acerto]
CalcTaxa --> CalcMedia[média_tempo_resposta]

CalcMedia --> GetCommunity[Buscar média comunidade]
GetCommunity --> CompareData[Comparar dados]
CompareData --> IdentifyWeak[Identificar pontos fracos]

IdentifyWeak --> GenerateCharts[Gerar gráficos]
GenerateCharts --> Chart1[Pizza: Distribuição disciplinas]
Chart1 --> Chart2[Barras: Taxa acerto]
Chart2 --> Chart3[Linha: Evolução temporal]

Chart3 --> GenerateInsights[Gerar insights]
GenerateInsights --> Insight1[Você melhorou 15% em X]
Insight1 --> Insight2[Ponto fraco: Y - 45% acerto]
Insight2 --> Insight3[Sugestão: Revisar Z]

Insight3 --> RenderPage[Renderizar página]
RenderPage --> ShowExport[Botão: Exportar PDF]
ShowExport --> End([Estatísticas exibidas])

style CalculateStats fill:#3B82F6
style GenerateInsights fill:#F59E0B

```

---

## 9. Sistema de Inteligência de Bancas

### 9.1 Fluxo de Análise de Banca

```mermaid
flowchart TD
Start([Usuário seleciona Banca + Disciplina]) --> LoadData[Buscar estatisticas_banca_assunto]
LoadData --> HasData{Dados
existem?}

HasData -->|Não| ShowEmpty[Mensagem: Sem dados]
ShowEmpty --> SuggestOther[Sugerir outras bancas]
SuggestOther --> End([Voltar])

HasData -->|Sim| OrderByProb[Ordenar por probabilidade]
OrderByProb --> ShowTop10[Exibir top 10 assuntos]

ShowTop10 --> ForEachAssunto[Para cada assunto]
ForEachAssunto --> DisplayName[Nome do assunto]
DisplayName --> DisplayTotal[Total de questões]
DisplayTotal --> DisplayPercent[Percentual do total]
DisplayPercent --> DisplayDifficulty[Dificuldade]
DisplayDifficulty --> DisplayTrend[Tendência 2 anos]
DisplayTrend --> DisplayProb[Probabilidade %]
DisplayProb --> DisplayArticles[Top artigos cobrados]

DisplayArticles --> CheckUser{Tem<br/>histórico?}
CheckUser -->|Sim| GetUserPerf[Buscar desempenho usuário]
GetUserPerf --> Compare[Comparar com média]
Compare --> ShowComparison[Exibir comparação]

CheckUser -->|Não| ShowAverage[Exibir apenas média]

ShowComparison --> NextAssunto{Mais<br/>assuntos?}
ShowAverage --> NextAssunto

NextAssunto -->|Sim| ForEachAssunto
NextAssunto -->|Não| GenerateRecs[Gerar recomendações]

GenerateRecs --> AnalyzeWeak[Identificar pontos fracos]
AnalyzeWeak --> AnalyzeTrends[Identificar tendências]
AnalyzeTrends --> CreateSuggestions[Criar sugestões]

CreateSuggestions --> Suggest1[Priorizar assunto X: alta prob + você abaixo]
Suggest1 --> Suggest2[Revisar assunto Y: você domina mas tendência crescente]
Suggest2 --> Suggest3[Ignorar assunto Z: baixa prob + você acima]

Suggest3 --> ShowHeatmap[Exibir heatmap artigos]
ShowHeatmap --> ShowChart[Gráfico temporal]
ShowChart --> ButtonAction[Botão: Criar caderno inteligente]
ButtonAction --> End

style GenerateRecs fill:#3B82F6
style CreateSuggestions fill:#F59E0B

```

---

### 9.2 Fluxo de Criar Caderno Inteligente (IA)

```mermaid
flowchart TD
Start([Usuário clica Caderno Inteligente]) --> GetContext[Buscar contexto usuário]
GetContext --> GetConcurso[Concurso alvo]
GetConcurso --> GetEdital[Edital se disponível]
GetEdital --> GetHistorico[Histórico respostas]

GetHistorico --> AnalyzeData[Analisar dados]
AnalyzeData --> GetWeakPoints[Identificar pontos fracos]
GetWeakPoints --> GetBancaStats[Estatísticas da banca]
GetBancaStats --> CrossData[Cruzar dados]

CrossData --> PrioritizeTopics[Priorizar assuntos]
PrioritizeTopics --> CalcScore[Calcular score prioridade]

CalcScore --> Formula[Score = \\n
incidencia_banca × 0.35 +\\n
relevancia_edital × 0.25 +\\n
dificuldade_usuario × 0.25 +\\n
tendencia_crescimento × 0.15]

Formula --> OrderTopics[Ordenar por score DESC]
OrderTopics --> SelectQuestoes[Selecionar questões]

SelectQuestoes --> Distribute[Distribuir por assunto]
Distribute --> BalanceDifficulty[Balancear dificuldade]
BalanceDifficulty --> Mix[40% fácil + 40% médio + 20% difícil]

Mix --> CreateCaderno[Criar caderno]
CreateCaderno --> SetName[Nome: Caderno Inteligente - Concurso X]
SetName --> SaveFilters[Salvar filtros + algoritmo usado]
SaveFilters --> LinkQuestoes[Linkar questões]

LinkQuestoes --> ShowPreview[Exibir preview]
ShowPreview --> ShowDistribution[Distribuição por assunto]
ShowDistribution --> ShowJustification[Justificativa da seleção]
ShowJustification --> ShowExpected[Resultado esperado: +20% taxa acerto]

ShowExpected --> ConfirmCreate{Confirmar<br/>criação?}
ConfirmCreate -->|Não| AdjustFilters[Ajustar filtros]
AdjustFilters --> SelectQuestoes

ConfirmCreate -->|Sim| SaveFinal[Salvar caderno final]
SaveFinal --> ShowSuccess[✅ Caderno criado com IA]
ShowSuccess --> SuggestStart[Começar agora?]
SuggestStart --> End([Resolver caderno])

style AnalyzeData fill:#3B82F6
style CrossData fill:#3B82F6
style CalcScore fill:#F59E0B
style SaveFinal fill:#10B981

```

---

## 10. Administração

### 10.1 Fluxo de Adicionar Nova Questão (Admin)

```mermaid
flowchart TD
Start([Admin clica Adicionar Questão]) --> CheckRole{Role =
admin?}
CheckRole -->|Não| AccessDenied([Erro 403])

CheckRole -->|Sim| ShowForm[Formulário completo]
ShowForm --> InputEnunciado[Enunciado]
InputEnunciado --> Input5Alt[5 Alternativas A-E]
Input5Alt --> SelectGabarito[Selecionar gabarito]
SelectGabarito --> InputExplicacao[Explicação opcional]

InputExplicacao --> SelectBanca[Selecionar banca]
SelectBanca --> SelectOrgao[Selecionar órgão opcional]
SelectOrgao --> SelectDisciplina[Selecionar disciplina]
SelectDisciplina --> SelectArtigo[Associar artigo opcional]
SelectArtigo --> SelectAssuntos[Selecionar assuntos tags]

SelectAssuntos --> InputAno[Ano da prova]
InputAno --> SelectDificuldade[Dificuldade opcional]
SelectDificuldade --> PreviewQuestion[Preview da questão]

PreviewQuestion --> ValidateForm{Validação<br/>Zod}
ValidateForm -->|Erro| ShowErrors[Exibir erros]
ShowErrors --> ShowForm

ValidateForm -->|OK| ConfirmSave{Confirmar<br/>salvamento?}
ConfirmSave -->|Não| ShowForm

ConfirmSave -->|Sim| SaveQuestao[Inserir em questoes]
SaveQuestao --> LinkAssuntos[Inserir em questoes_assuntos]
LinkAssuntos --> UpdateCount[Incrementar contadores]
UpdateCount --> ShowSuccess[✅ Questão adicionada]

ShowSuccess --> NextAction{Próxima<br/>ação?}
NextAction -->|Adicionar outra| ShowForm
NextAction -->|Ver lista| RedirectList([Lista questões])
NextAction -->|Dashboard| RedirectDash([Dashboard admin])

style SaveQuestao fill:#10B981
style LinkAssuntos fill:#10B981

```

---

### 10.2 Fluxo de Importar Questões em Lote (CSV)

```mermaid
flowchart TD
Start([Admin clica Importar CSV]) --> ShowUpload[Form upload arquivo]
ShowUpload --> SelectFile[Usuário seleciona CSV]
SelectFile --> ValidateFile{Arquivo
válido?}

ValidateFile -->|Não| ShowError[Erro: Formato inválido]
ShowError --> ShowUpload

ValidateFile -->|Sim| ReadFile[Ler conteúdo CSV]
ReadFile --> ParseCSV[Parse CSV to JSON]
ParseCSV --> ValidateStructure{Estrutura<br/>correta?}

ValidateStructure -->|Não| ShowErrorFormat[Erro: Colunas obrigatórias faltando]
ShowErrorFormat --> ShowExample[Mostrar exemplo CSV]
ShowExample --> ShowUpload

ValidateStructure -->|Sim| ValidateRows[Validar cada linha]
ValidateRows --> CheckDuplicates[Verificar duplicatas]
CheckDuplicates --> ShowPreview[Preview: X questões válidas]

ShowPreview --> ShowInvalid[Y questões inválidas]
ShowInvalid --> ConfirmImport{Confirmar<br/>importação?}

ConfirmImport -->|Não| Cancel([Cancelar])

ConfirmImport -->|Sim| StartImport[Iniciar importação]
StartImport --> ShowProgress[Barra progresso 0/X]

ShowProgress --> ForEachRow[Para cada linha]
ForEachRow --> InsertQuestao[Inserir questão]
InsertQuestao --> UpdateProgress[Atualizar progresso]
UpdateProgress --> NextRow{Mais<br/>linhas?}

NextRow -->|Sim| ForEachRow
NextRow -->|Não| FinishImport[Finalizar importação]

FinishImport --> ShowResults[Exibir resultados]
ShowResults --> ShowSuccess[✅ X questões importadas]
ShowSuccess --> ShowFailed[❌ Y questões falharam]
ShowFailed --> DownloadLog[Botão: Download log erros]
DownloadLog --> End([Dashboard admin])

style InsertQuestao fill:#10B981
style ShowSuccess fill:#10B981

```

---

## 🎯 Conclusão

Estes fluxogramas cobrem **todos os fluxos críticos** da aplicação. Use como referência para:

1. **Desenvolvimento:** Implementar cada fluxo exatamente como especificado
2. **Testes:** Criar casos de teste baseados nos caminhos
3. **Documentação:** Explicar funcionalidades para novos devs
4. **Debugging:** Identificar onde o fluxo quebrou

---

**Próximos Passos:**

- Consulte `05-COMPONENTES-UI.md` para especificação visual de cada tela
- Consulte `06-API-ENDPOINTS.md` para contratos de API
- Consulte `07-REGRAS-NEGOCIO.md` para regras específicas

---

**Fim do arquivo `04-FLUXOGRAMAS-MERMAID.md`**
