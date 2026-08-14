# Backend — `ibfc-server` (primeiro serviço)

> **Fonte de verdade deste repositório sobre o backend.** Quando este documento,
> o Swagger (`/docs`) e a collection do Postman divergirem, vale o que está
> aqui: tudo foi conferido no código-fonte, e não nos exemplos do Swagger. Vários
> exemplos do Swagger estão desatualizados (ver
> [Divergências do Swagger](#9-divergências-do-swagger)).
>
> - **Repositório:** `~/Documents/ibfc-server` (repositório separado, fora deste monorepo)
> - **Versão documentada:** commit `b76a8ea` (2026-09-22), _"adicionado todas funcionalidades listadas no documento de spec"_
> - **Manutenção:** quando o backend mudar um contrato, atualize esta página no
>   mesmo PR em que o frontend passar a depender da mudança.

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Rodando localmente](#2-rodando-localmente)
3. [Convenções HTTP](#3-convenções-http)
4. [Autenticação e papéis](#4-autenticação-e-papéis)
5. [Índice de endpoints](#5-índice-de-endpoints)
6. [Endpoints do app do líder](#6-endpoints-do-app-do-líder)
7. [Endpoints do painel (admin/secretaria)](#7-endpoints-do-painel-adminsecretaria)
8. [Auth e Pessoas](#8-auth-e-pessoas)
9. [Divergências do Swagger](#9-divergências-do-swagger)
10. [Riscos e pendências conhecidas](#10-riscos-e-pendências-conhecidas)
11. [Regras para consumir a API neste repo](#11-regras-para-consumir-a-api-neste-repo)

---

## 1. Visão geral

API REST do produto de gestão da igreja (IBFC). Ela atende dois clientes:

- **App do líder** (`apps/native`, papel `lider`): home, dados do GC, participantes, visitantes e o lançamento do relatório semanal de presença.
- **Painel web** (`apps/web`, papéis `admin` e `secretaria`): conformidade dos relatórios, cobrança de líderes, revisão de visitantes, membros e convites.

| Item                   | Valor                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Framework              | NestJS 11 sobre **Fastify** (`@nestjs/platform-fastify`)                                           |
| Banco                  | PostgreSQL via TypeORM, com migrations em `src/shared/migrations` (`synchronize: false`)           |
| Auth                   | JWT **RS256** (access token) + refresh token opaco com rotação; chave de API para server-to-server |
| Docs geradas           | Swagger em `GET /docs`                                                                             |
| Gerenciador de pacotes | **pnpm** (`pnpm-lock.yaml`)                                                                        |

Módulos (`src/`):

| Módulo   | Responsabilidade                                                                              |
| -------- | --------------------------------------------------------------------------------------------- |
| `auth`   | Credenciais, convites, login, sessão, recuperação de senha, papéis, perfil do líder           |
| `core`   | Pessoas, redes, GCs (Grupos de Crescimento), participantes, mentorias, relatórios e presenças |
| `gestao` | Painel: conformidade, cobranças, push, membros e revisão de visitantes                        |
| `shared` | Envelope HTTP, exceções base, `Result`, utilitários de data/semana, migrations                |

Glossário: **GC** = Grupo de Crescimento; **Rede** = agrupamento de GCs; **semana** = domingo a sábado, no fuso `America/Sao_Paulo`.

---

## 2. Rodando localmente

```bash
cd ~/Documents/ibfc-server
pnpm install
pnpm run migration:run      # aplica as migrations no DATABASE_URL
pnpm run start:dev          # API em http://localhost:3000 (ou $PORT)
```

- Swagger: `http://localhost:3000/docs`
- Postman: importe `postman/IBFC-Server.postman_collection.json` e `postman/IBFC-Server.postman_environment.json`. O request `Auth > Login` grava `accessToken` e `refreshToken` no environment.
- O `.env.<NODE_ENV>` (padrão `.env.development`) é lido pelo `ConfigModule`.

### Variáveis de ambiente

Só os nomes estão listados aqui. Os valores ficam no `.env` do backend e **nunca** entram neste repositório.

| Variável                                   | Padrão no código    | Uso                                                                  |
| ------------------------------------------ | ------------------- | -------------------------------------------------------------------- |
| `NODE_ENV`                                 | `development`       | Escolhe o arquivo `.env.<NODE_ENV>`                                  |
| `PORT`                                     | `3000`              | Porta HTTP (escuta em `0.0.0.0`)                                     |
| `DATABASE_URL`                             | —                   | Conexão PostgreSQL                                                   |
| `CORS_ORIGIN`                              | qualquer origem     | Lista separada por vírgula; `credentials: true`                      |
| `JWT_PRIVATE_KEY` / `JWT_PRIVATE_KEY_PATH` | obrigatória         | Chave RS256 de assinatura                                            |
| `JWT_PUBLIC_KEY` / `JWT_PUBLIC_KEY_PATH`   | obrigatória         | Chave RS256 de verificação                                           |
| `JWT_ISSUER`                               | `ibfc-app`          | `iss` do JWT                                                         |
| `JWT_ACCESS_TTL_SECONDS`                   | `900` (15 min)      | Validade do access token                                             |
| `REFRESH_TOKEN_TTL_SECONDS`                | `2592000` (30 dias) | Validade do refresh token                                            |
| `CONVITE_ATIVACAO_TTL_SECONDS`             | `259200` (3 dias)   | Validade do convite                                                  |
| `RECUPERACAO_SENHA_TTL_SECONDS`            | `3600` (1 h)        | Validade do token de reset                                           |
| `APP_ATIVACAO_URL_BASE`                    | URL de exemplo      | Base do link de ativação (`?token=`)                                 |
| `APP_RESET_URL_BASE`                       | URL de exemplo      | Base do link de reset (`?token=`)                                    |
| `ADMIN_API_KEY`                            | `''`                | Valor esperado em `X-Admin-Api-Key`. Vazio = toda chamada é recusada |
| `SENHA_MIN_LENGTH`                         | `8`                 | Política de senha                                                    |
| `LOGIN_MAX_TENTATIVAS`                     | `5`                 | Tentativas antes do bloqueio                                         |
| `LOGIN_BLOQUEIO_SEGUNDOS`                  | `900`               | Duração do bloqueio                                                  |
| `APP_TIMEZONE`                             | `America/Sao_Paulo` | Cálculo da semana de referência                                      |
| `APP_DEEP_LINK_SCHEME`                     | `ibfcapp`           | Deep link das cobranças (`ibfcapp://relatorios/<id>/chamada`)        |
| `INTEGRACAO_ENCONTROS_NECESSARIOS`         | `3`                 | Presenças mínimas para promover um visitante                         |
| `HISTORICO_SEMANAS_MAX`                    | `52`                | Limite do histórico de relatórios                                    |
| `COBRANCA_TEMPLATE`                        | template interno    | Mensagem padrão de cobrança                                          |

---

## 3. Convenções HTTP

### Envelope

Toda resposta JSON passa pelo `HttpInterceptor` (`src/shared/http/HttpInterceptor.ts`):

```jsonc
// sucesso
{ "data": <payload> }

// erro de regra/validação (lançado pelo use case)
{ "error": "<NomeDaClasseDaExceção>", "message": "<mensagem em pt-BR>" }
```

Há quatro exceções a esse envelope:

- **Erros de guard** (401/403 de JWT, papel ou chave de admin) usam o formato padrão do Nest: `{ "message": "...", "statusCode": 401 }`, e às vezes também `"error": "Unauthorized"`.
- **Sucesso sem valor** (`logout`, `redefinir-senha`, `recuperacao-senha` sem conta): o corpo é `{}`, e não `{ "data": null }`. Trate a ausência de `data` como sucesso.
- **`GET /admin/membros/exportar`** retorna CSV puro, sem envelope.
- **204 No Content** não tem corpo (ver a seguir).

### "Não encontrado" é 204, não 404

Quando o recurso não existe (`RepositoryNoDataFoundException`), a API responde **`204 No Content` sem corpo**. Os mapas de status de cada controller declaram 404, mas esse ramo nunca é alcançado. **Nenhum endpoint retorna 404 de negócio** (só o 404 do roteador, para rota inexistente).

No cliente, `204` em um `GET` significa "não existe / sem vínculo" e não deve ser tratado como sucesso com dados.

### Códigos de status

O status de erro vem do mapa de cada controller, que é indexado pelo nome exato da classe de exceção. Uma classe fora do mapa vira **500**, mesmo sendo erro de validação. Os códigos de cada endpoint estão nas seções 6 a 8. Os mais comuns são:

| Status          | Quando                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| 200 / 201 / 202 | Sucesso (201 em criações; 202 só em `POST /auth/recuperacao-senha`)                                  |
| 204             | Recurso não encontrado (sem corpo)                                                                   |
| 400             | `BusinessException` e regras de domínio mapeadas                                                     |
| 401             | Sem token / token inválido; credencial inválida no login; sessão inválida no refresh                 |
| 403             | Papel insuficiente (`Acesso restrito para este perfil`); conta inativa no refresh                    |
| 409             | Conflito (já enviado, já ativado, e-mail em uso, token já usado)                                     |
| 410             | Token de convite/recuperação expirado                                                                |
| 422             | Senha fraca, token inválido, relatório sem presença, promoção não elegível                           |
| 423             | Login bloqueado por excesso de tentativas                                                            |
| 500             | Exceção não mapeada ou erro inesperado (`message: "Algo deu errado. Tente novamente em instântes."`) |

### Paginação

Os endpoints paginados devolvem `data: T[]` e os cabeçalhos de resposta `pagination-total` (total de itens) e `pagination-page` (página atual). A forma de **pedir** a página não é uniforme:

| Endpoint             | Como pedir                                    | Padrão               |
| -------------------- | --------------------------------------------- | -------------------- |
| `GET /core/pessoas`  | **Cabeçalhos** de requisição `page` e `limit` | `page=1`, `limit=10` |
| `GET /admin/membros` | **Query string** `?page=&limit=`              | `page=1`, `limit=20` |

Nenhum dos dois valida o valor: um número inválido vira `NaN`. Toda resposta também traz o cabeçalho `checkei-pagination-size`, que só ecoa o valor enviado na requisição (ou `0`).

> **CORS:** os cabeçalhos `pagination-*` não estão em `exposedHeaders`. Um cliente
> web de outra origem não consegue lê-los até que o backend os exponha.

### Datas

- `Date` serializa em ISO UTC (`2026-09-10T23:00:00.000Z`).
- Campos calculados com Luxon (`dataEnvio` do histórico, por exemplo) saem em ISO **com offset** (`2026-09-10T20:00:00.000-03:00`).
- Semanas são strings `YYYY-MM-DD` (o domingo em `semanaInicio`, o sábado em `semanaFim`). O rótulo segue o formato `dd/MM a dd/MM/yyyy`.
- Qualquer data enviada como "início de semana" é normalizada para o domingo daquela semana.

### Endpoints de diagnóstico

Todo controller herda `GET <prefixo>/hello` (`AbstractHttpController`), que devolve `{ module, controller, currentoDate }`. Ele está sujeito aos mesmos guards do controller. `GET /` responde o "hello" padrão do Nest. Não use esses endpoints em produto.

---

## 4. Autenticação e papéis

Há dois mecanismos:

| Mecanismo            | Cabeçalho                             | Usado em                                                                                            |
| -------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| JWT de acesso        | `Authorization: Bearer <accessToken>` | Quase tudo                                                                                          |
| Chave administrativa | `X-Admin-Api-Key: <ADMIN_API_KEY>`    | `POST /auth/convites` e `POST /admin/relatorios/gerar-semana` (integrações server-to-server e cron) |

O access token é um JWT RS256 com `sub` = `idPessoa`, `idCredencial` e `roles`. O backend identifica o usuário **pelo token**: nenhum endpoint do app do líder recebe `idPessoa` na URL.

### Papéis (`PapelUsuario`)

`lider` · `admin` · `secretaria`. O guard aceita o acesso se o usuário tiver **qualquer** um dos papéis exigidos pelo endpoint.

| Área                                                                            | Papel exigido                                                               |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `/perfil`                                                                       | só JWT válido (qualquer papel)                                              |
| `/gc`, `/relatorios`, `/home`, `/dispositivos`, `/cobrancas/:id/lida`           | `lider`                                                                     |
| `/admin/usuarios`, `/admin/conformidade`, `/admin/cobrancas*`, `/admin/membros` | `admin`                                                                     |
| `/admin/visitantes`                                                             | `admin` ou `secretaria`                                                     |
| `/admin/relatorios/gerar-semana`                                                | chave `X-Admin-Api-Key` (sem JWT)                                           |
| `/core/pessoas`                                                                 | **nenhuma autenticação** (ver [Riscos](#10-riscos-e-pendências-conhecidas)) |
| `/auth/*`                                                                       | público, exceto `logout` (JWT) e `convites` (chave de admin)                |

### Ciclo de vida da conta e da sessão

```text
admin gera convite ──► pessoa abre o link (?token=) ──► GET /auth/convites/:token (valida)
                                                     └► POST /auth/ativar-conta {token, senha}
                                                          └► já devolve a sessão (access + refresh)
POST /auth/login {email, senha} ──► sessão
access expira (15 min) ──► POST /auth/refresh {refreshToken} ──► nova sessão (o refresh anterior é invalidado)
POST /auth/logout {refreshToken} ──► revoga o refresh
```

Comportamento do refresh:

- Ele faz **rotação**: cada refresh token só pode ser usado uma vez. Guarde sempre o novo.
- Se um refresh **já revogado** for reapresentado, o backend entende como reuso e **revoga todas as sessões da credencial**. Por isso, dois refreshes concorrentes com o mesmo token derrubam o usuário. No cliente, serialize o refresh (uma promessa em voo por vez).
- `accessTokenExpiraEm` vem na resposta. Use esse valor para renovar a sessão antes de expirar, em vez de reagir só ao 401.

### Política de senha

As regras são verificadas nesta ordem. Uma senha que falha retorna `SenhaFracaException` com status **422**:

1. `Senha é obrigatória`
2. `A senha deve ter no mínimo 8 caracteres` (`SENHA_MIN_LENGTH`)
3. `A senha deve conter letras e números`
4. `A senha não pode conter espaços`

---

## 5. Índice de endpoints

São 42 endpoints de produto, mais `GET /` e os `/hello` de diagnóstico. Legenda: 🔓 público · 🔑 chave de admin · 👤 JWT (qualquer papel) · L `lider` · A `admin` · S `secretaria`.

| Método | Rota                                | Auth | Resumo                                          |
| ------ | ----------------------------------- | ---- | ----------------------------------------------- |
| POST   | `/auth/convites`                    | 🔑   | Gerar convite de ativação                       |
| GET    | `/auth/convites/:token`             | 🔓   | Validar convite                                 |
| POST   | `/auth/ativar-conta`                | 🔓   | Ativar conta e definir senha (devolve a sessão) |
| POST   | `/auth/login`                       | 🔓   | Login                                           |
| POST   | `/auth/refresh`                     | 🔓   | Renovar sessão                                  |
| POST   | `/auth/logout`                      | 👤   | Revogar refresh token                           |
| POST   | `/auth/recuperacao-senha`           | 🔓   | Solicitar reset de senha                        |
| GET    | `/auth/recuperacao-senha/:token`    | 🔓   | Validar token de reset                          |
| POST   | `/auth/redefinir-senha`             | 🔓   | Redefinir senha                                 |
| GET    | `/perfil`                           | 👤   | Perfil do usuário autenticado                   |
| PATCH  | `/perfil/contato`                   | 👤   | Atualizar telefone/e-mail                       |
| GET    | `/home`                             | L    | Agregador da tela inicial do líder              |
| GET    | `/gc`                               | L    | Dados do GC do líder                            |
| GET    | `/gc/mentores`                      | L    | Mentores do GC (com link de WhatsApp)           |
| GET    | `/gc/participantes`                 | L    | Participantes agrupados por vínculo             |
| POST   | `/gc/visitantes`                    | L    | Adicionar visitante                             |
| POST   | `/gc/participantes/:id/promover`    | L    | Promover visitante a participante               |
| GET    | `/relatorios/pendentes`             | L    | Contagem e lista de pendências                  |
| GET    | `/relatorios/historico`             | L    | Histórico semanal                               |
| GET    | `/relatorios/:id`                   | L    | Detalhe do relatório                            |
| GET    | `/relatorios/:id/chamada`           | L    | Lista de presença (passo 1)                     |
| PUT    | `/relatorios/:id/presencas`         | L    | Salvar presenças                                |
| POST   | `/relatorios/:id/enviar`            | L    | Enviar relatório (passo 2)                      |
| POST   | `/dispositivos`                     | L    | Registrar token de push                         |
| PATCH  | `/cobrancas/:id/lida`               | L    | Marcar cobrança como lida                       |
| POST   | `/admin/usuarios/:idPessoa/papeis`  | A    | Substituir os papéis da pessoa                  |
| POST   | `/admin/usuarios/:idPessoa/convite` | A    | Convidar usuário do painel                      |
| GET    | `/admin/conformidade`               | A    | KPIs e pendências da semana                     |
| GET    | `/admin/cobrancas/template`         | A    | Template da mensagem de cobrança                |
| POST   | `/admin/cobrancas`                  | A    | Cobrar um líder                                 |
| POST   | `/admin/cobrancas/em-massa`         | A    | Cobrar todos os pendentes                       |
| GET    | `/admin/membros`                    | A    | Listar membros (paginado)                       |
| GET    | `/admin/membros/exportar`           | A    | Exportar membros em CSV                         |
| POST   | `/admin/membros/:id/inativar`       | A    | Inativar membro                                 |
| GET    | `/admin/visitantes`                 | A, S | Visitantes a revisar e possíveis duplicatas     |
| POST   | `/admin/visitantes/:id/confirmar`   | A, S | Confirmar visitante                             |
| POST   | `/admin/visitantes/:id/fundir`      | A, S | Fundir duplicata                                |
| POST   | `/admin/relatorios/gerar-semana`    | 🔑   | Gerar relatórios pendentes da semana (cron)     |
| GET    | `/core/pessoas`                     | 🔓   | Listar pessoas (paginado por cabeçalho)         |
| GET    | `/core/pessoas/:id`                 | 🔓   | Buscar pessoa                                   |
| POST   | `/core/pessoas`                     | 🔓   | Criar pessoa                                    |
| PATCH  | `/core/pessoas/:id`                 | 🔓   | Atualizar pessoa                                |

Exemplo de chamada:

```bash
curl -s http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"lider@example.test","senha":"senhaFake123"}'

curl -s http://localhost:3000/home -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 6. Endpoints do app do líder

Todos exigem `Authorization: Bearer` e o papel `lider`. O GC é resolvido a partir do líder autenticado, e só conta um **GC ativo**. "Sem GC" significa que o líder não tem GC ativo vinculado. A coluna de erros usa `status Classe — "mensagem"`.

### Tipos compartilhados

```ts
type DiaSemana =
  | 'domingo'
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
type VinculoParticipante =
  | 'lider'
  | 'auxiliar'
  | 'em_treinamento'
  | 'participante'
  | 'visitante'
type StatusRelatorio = 'pendente' | 'entregue' // persistido
type SituacaoRelatorio = 'entregue' | 'pendente' | 'atrasado' // calculada pelo prazo

type Endereco = {
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  cep: string
}

type DadosGC = {
  id: string
  nome: string
  rede: { id: string; nome: string } | null
  diaSemana: DiaSemana
  hora: string // "HH:mm"
  endereco: Endereco | null
  somenteLeitura: true
}

type Mentor = {
  idPessoa: string
  nome: string
  telefone: string | null
  whatsappUrl: string | null // https://wa.me/<telefone> quando há telefone
  contatoDisponivel: boolean
}

type ItemHistorico = {
  idRelatorio: string | null // null = semana sem relatório gerado
  semanaInicio: string // YYYY-MM-DD (domingo)
  semanaFim: string // YYYY-MM-DD (sábado)
  rotuloSemana: string // "dd/MM a dd/MM/yyyy"
  situacao: SituacaoRelatorio
  diasAtraso: number
  dataEnvio: string | null // ISO com offset
}
```

### Regras de prazo (afetam `situacao` e `diasAtraso`)

- Relatório com `dataEnvio` → `entregue`.
- Sem envio, ele fica `pendente` até o fim da **quarta-feira seguinte** à semana (sábado + 3 dias, 23:59:59, em `America/Sao_Paulo`).
- A partir de quinta 00:00 ele passa a `atrasado`, com `diasAtraso` = dias desde essa quinta + 1.
- `reuniaoJaOcorreu` é verdadeiro quando o dia e a hora do GC daquela semana já passaram. `podeLancar = reuniaoJaOcorreu && !entregue`.
- **Essa janela só é calculada na Home.** `PUT presencas` e `POST enviar` aceitam o lançamento a qualquer momento, inclusive antes da reunião. Se o app quiser bloquear, use `podeLancar`.

### `GET /home`

Agregador da tela inicial. Antes de responder, garante (de forma idempotente) que o relatório pendente da semana exista para todos os GCs ativos.

```ts
// 200
{
  gc: DadosGC | null
  mentores: Mentor[]
  relatorioSemanaAtual: {
    idRelatorio: string
    rotuloSemana: string
    situacao: SituacaoRelatorio
    reuniaoJaOcorreu: boolean
    podeLancar: boolean
  } | null
  pendencias: { quantidade: number; mensagem: string; itens: ItemHistorico[] }
}
```

- Sem GC: `{ gc: null, mentores: [], relatorioSemanaAtual: null, pendencias }`.
- Se o relatório da semana não for encontrado após a geração, a resposta inteira é **204**.

### `GET /gc`

Retorna `200 DadosGC`. Sem GC: **204**.

### `GET /gc/mentores`

Retorna `200 Mentor[]` (`[]` quando não há mentor). Sem GC: **204**.

### `GET /gc/participantes?busca=<nome>`

`busca` é opcional e filtra por nome.

```ts
// 200 — grupos vazios são omitidos; itens ordenados por nome
Array<{
  grupo: 'Líder' | 'Em treino' | 'Participante' | 'Visitante'
  itens: Array<{
    idParticipante: string // id do vínculo, usado em /promover e nas presenças
    idPessoa: string
    nome: string
    telefone: string
    vinculo: VinculoParticipante
    grupoExibicao: string
    elegivelParaParticipante: boolean // só calculado para visitante
    presencasIntegracao: number // só calculado para visitante
  }>
}>
```

Os vínculos `lider` e `auxiliar` aparecem no grupo `Líder`, e `em_treinamento` em `Em treino`. Sem GC: **204**.

### `POST /gc/visitantes`

Cadastra um visitante mínimo, que entra na fila de revisão da secretaria.

```jsonc
// body
{ "nome": "Visitante Exemplo", "telefone": "11900000000" }
```

```ts
// 201
{
  idParticipante: string
  idPessoa: string
  nome: string
  telefone: string
  aguardandoRevisaoSecretaria: true
}
```

Erros:

- `400 BusinessException`: `"Líder sem grupo de crescimento"`
- `400`: `"Nome do visitante é obrigatório"` e `"Telefone do visitante é obrigatório"`
- `400 ParticipanteException`: `"GC é obrigatório"` e `"Pessoa é obrigatória"`

### `POST /gc/participantes/:id/promover`

`:id` é o **`idParticipante`**, e não o `idPessoa`. O visitante precisa de `INTEGRACAO_ENCONTROS_NECESSARIOS` presenças confirmadas (padrão 3).

```ts
// 200
{
  idParticipante: string
  vinculo: 'participante'
}
```

Erros:

- `400`: sem GC; `"Participante não pertence ao seu GC"`
- `422 PromocaoParticipanteInvalidaException`: `"Visitante ainda não elegível (2/3 encontros)"` e `"Apenas visitantes podem ser promovidos a participante"`
- `204`: participante não encontrado

### `GET /relatorios/pendentes`

```ts
// 200
{ quantidade: number; mensagem: string; itens: ItemHistorico[] }
```

- `quantidade` conta **só os atrasados**, enquanto `itens` traz pendentes e atrasados.
- `mensagem` é uma destas: `"Nenhum relatório atrasado"`, `"Você tem 1 relatório pendente"` ou `"Você tem N relatórios pendentes"`.
- Sem GC: `{ quantidade: 0, mensagem: "Nenhum relatório pendente", itens: [] }`.

### `GET /relatorios/historico`

Retorna `200 ItemHistorico[]`, da semana atual até a do relatório mais antigo, em ordem decrescente e limitado a `HISTORICO_SEMANAS_MAX` semanas. Semanas sem relatório vêm com `idRelatorio: null`. Sem GC: **204**.

### `GET /relatorios/:id`

```ts
// 200
{
  idRelatorio: string
  semanaInicio: string
  semanaFim: string
  status: StatusRelatorio
  resumoTexto: string | null
  dataEnvio: string | null
  totais: { presentes: number; ausentes: number; visitantes: number } | null // null até enviar
  presencas: Array<{ idPessoa: string; nome: string; vinculo: VinculoParticipante; presente: boolean }>
}
```

Erros:

- `400`: sem GC; `"Relatório não pertence ao seu GC"`
- `204`: relatório inexistente

### `GET /relatorios/:id/chamada`

Passo 1 do lançamento: a lista do GC com o estado de presença atual.

```ts
// 200
{
  idRelatorio: string
  semanaInicio: string
  semanaFim: string
  totalParticipantes: number
  totalPresentes: number
  itens: Array<{
    idParticipante: string
    idPessoa: string
    nome: string
    vinculo: VinculoParticipante
    presente: boolean
  }>
}
```

Os erros são os mesmos de `GET /relatorios/:id`.

### `PUT /relatorios/:id/presencas`

**Substitui** a lista inteira de presenças. Mande sempre o estado completo, e não um delta.

```jsonc
// body
{ "presencas": [{ "idParticipante": "<id>", "presente": true }] }
```

```ts
// 200
{
  idRelatorio: string
  totalPresentes: number
}
```

Erros: os de `GET /relatorios/:id`, mais:

- `400`: `"Participante não encontrado no GC: <id>"`
- `400 RelatorioException`: `"Relatório já entregue não aceita alteração de presenças"`

### `POST /relatorios/:id/enviar`

Passo 2: envia o relatório e calcula os totais.

```jsonc
// body (opcional)
{ "resumoTexto": "Texto livre do líder" }
```

```ts
// 200
{
  idRelatorio: string
  status: 'entregue'
  totais: {
    presentes: number
    ausentes: number
    visitantes: number
  }
}
```

`visitantes` conta os presentes com vínculo `visitante`.

Erros: os de `GET /relatorios/:id`, mais:

- `409 RelatorioJaEnviadoException`: `"Este relatório já foi enviado"`
- `422 RelatorioSemPresencaException`: `"Confirme pelo menos uma presença antes de continuar."`

### `POST /dispositivos`

Registra o token de push. Faz upsert pelo `tokenPush`.

```jsonc
// body
{ "tokenPush": "<token-do-expo/fcm>", "plataforma": "android" } // "android" | "ios"
```

```ts
// 201
{
  idDispositivo: string
}
```

- `400 CobrancaException`: `"Token de push é obrigatório"`
- Se o token já existe, ele **não é transferido** para outro líder (ver Riscos).

### `PATCH /cobrancas/:id/lida`

Marca como lida a cobrança recebida por push. É idempotente.

```ts
// 200
{
  idCobranca: string
}
```

Cobrança inexistente: **204**.

---

## 7. Endpoints do painel (admin/secretaria)

### `GET /admin/conformidade?semana=YYYY-MM-DD` (admin)

`semana` é opcional; o padrão é a semana atual. A data é normalizada para o domingo.

```ts
// 200
{
  semanaInicio: string
  semanaFim: string
  rotuloSemana: string
  kpis: {
    gcsEntregues: number
    gcsPendentesOuAtrasados: number
    totalGcs: number
    taxaConformidade: number // percentual inteiro (Math.round), ex.: 83
  }
  pendentes: Array<{
    // ordenado por diasAtraso desc
    idGrupoCrescimento: string
    nomeGrupoCrescimento: string
    idLider: string
    nomeLider: string // "—" se não houver líder
    rede: string | null
    idRelatorio: string | null
    situacao: 'pendente' | 'atrasado'
    diasAtraso: number
    motivo: string // "Atrasado há N dia(s)" | "Pendente — dentro do prazo"
  }>
}
```

### `GET /admin/cobrancas/template` (admin)

```ts
// 200
{
  template: string
  placeholders: ['{{lider}}', '{{gc}}', '{{situacao}}', '{{diasAtraso}}']
}
```

### `POST /admin/cobrancas` (admin)

Cobra um líder por um relatório pendente ou atrasado e envia push.

```jsonc
// body
{ "idRelatorio": "<id>", "mensagem": "", "notificarMentor": false }
// mensagem vazia ou ausente = usa o template
```

```ts
// 201
{
  idCobranca: string
  deepLink: string // "<APP_DEEP_LINK_SCHEME>://relatorios/<idRelatorio>/chamada"
  notificacao: {
    destinatarios: number
    entregues: number
    falhas: number
    mentorSemDispositivo: boolean
  }
}
```

Erros:

- `400 BusinessException`: `"Relatório já entregue não pode ser cobrado"`
- `400 CobrancaException`: `"Mensagem da cobrança é obrigatória"`
- `204`: relatório, GC ou líder inexistente

> O envio de push hoje é um adaptador de log (`LogNotificacaoPushService`); nenhum
> push real sai do backend.

### `POST /admin/cobrancas/em-massa` (admin)

```jsonc
// body (tudo opcional)
{ "semanaInicio": "2026-09-06", "mensagem": "", "notificarMentor": false }
```

```ts
// 200
{
  cobrancasCriadas: number
  ignorados: number
}
```

Falhas individuais e pendências sem relatório gerado entram em `ignorados`.

### `GET /admin/membros` (admin)

Query string: `status` (`ativo` | `inativo`), `bairro` (busca parcial, sem diferenciar maiúsculas), `idGc`, `page` (padrão 1) e `limit` (padrão 20).

```ts
// 200 — com os cabeçalhos pagination-total e pagination-page
Array<{
  id: string
  nome: string
  email: string | null
  telefone: string
  bairro: string | null
  status: 'ativo' | 'inativo'
  origemCadastro: string // 'web' | 'app'
}>
```

### `GET /admin/membros/exportar` (admin)

Usa os mesmos filtros da listagem, sem paginação e com limite de 100 000 linhas. Responde `text/csv` como anexo `membros.csv`, **sem envelope**.

```text
nome,email,telefone,bairro,status,origem
```

Em caso de falha, a resposta é **200** com o corpo `erro\n"<mensagem>"`. Verifique a primeira linha antes de oferecer o download.

### `POST /admin/membros/:id/inativar` (admin)

Retorna `200 { idPessoa: string }`. Pessoa inexistente: **204**.

### `GET /admin/visitantes` (admin, secretaria)

Lista os visitantes cadastrados pelo app que estão em status de revisão, com as possíveis duplicatas (mesmo nome **ou** mesmo telefone em GCs diferentes).

```ts
// 200
Array<{
  idPessoa: string
  nome: string
  telefone: string
  criadoEm: string // ISO
  gruposVinculados: string[] // ids de GC
  possiveisDuplicatas: Array<{
    idPessoa: string
    nome: string
    telefone: string
    motivos: Array<'mesmo_nome' | 'mesmo_telefone'>
  }>
}>
```

### `POST /admin/visitantes/:id/confirmar` (admin, secretaria)

Marca a pessoa como validada, o que a tira da fila.

- Sucesso: `200 { idPessoa: string }`
- `400`: `"Esta pessoa não está pendente de revisão"`
- `204`: pessoa inexistente

### `POST /admin/visitantes/:id/fundir` (admin, secretaria)

Funde a pessoa de origem (`:id`) na pessoa de destino: as participações e presenças passam para o destino, e a origem fica fundida/inativa.

```jsonc
// body
{ "idPessoaDestino": "<id>" }
```

- Sucesso: `200 { idPessoaDestino: string }`
- `400`: `"Origem e destino não podem ser a mesma pessoa"` e `"Apenas visitantes a revisar podem ser fundidos"`
- `204`: origem ou destino inexistente

### `POST /admin/usuarios/:idPessoa/papeis` (admin)

**Substitui** a lista de papéis da credencial.

```jsonc
// body
{ "papeis": ["lider", "admin"] }
```

- Sucesso: `200 { idPessoa: string; papeis: string[] }`
- Credencial inexistente: `204`
- Lista vazia: **500** (`CredencialException` não está mapeada)
- Os valores não são validados contra o enum: envie apenas `lider`, `admin` ou `secretaria`.

### `POST /admin/usuarios/:idPessoa/convite` (admin)

Cria ou reaproveita a credencial e emite um convite. Os pendentes anteriores são invalidados.

```jsonc
// body (opcional)
{ "papeis": ["secretaria"] } // padrão: ["lider"]
```

```ts
// 201
{
  token: string
  link: string
  expiraEm: string
} // link = APP_ATIVACAO_URL_BASE?token=<token>
```

- `409 CredencialJaAtivadaException`: `"Esta conta já foi ativada"`
- `204`: pessoa inexistente

### `POST /admin/relatorios/gerar-semana` (chave de admin)

Endpoint de cron. É idempotente: cria um relatório `pendente` para cada GC ativo que ainda não tem relatório na semana.

```jsonc
// body (opcional)
{ "semanaInicio": "2026-09-06" } // padrão: semana atual
```

```ts
// 200
{
  semanaInicio: string
  criados: number
}
```

---

## 8. Auth e Pessoas

### `POST /auth/convites` (chave de admin)

Tem o mesmo comportamento de `POST /admin/usuarios/:idPessoa/convite`, mas recebe `idPessoa` no body.

```jsonc
{ "idPessoa": "<uuid>", "papeis": ["lider"] }
```

- `201 { token, link, expiraEm }`
- `400`: `"Id da pessoa não informado"` e erros de e-mail da pessoa
- `409`: conta já ativada
- `204`: pessoa inexistente

### `GET /auth/convites/:token` e `GET /auth/recuperacao-senha/:token`

Validam o token antes de exibir a tela de definir senha.

```ts
// 200
{
  email: string
  nomePessoa: string
}
```

| Status | Classe                      | Mensagem                                                                                                          |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 422    | `TokenInvalidoException`    | `"Token não informado"`, `"Link inválido"`                                                                        |
| 409    | `TokenJaUtilizadoException` | `"Este link já foi utilizado"`                                                                                    |
| 410    | `TokenExpiradoException`    | `"O seu convite expirou. Contacte o administrador para um novo link."` (a mesma mensagem aparece também no reset) |
| 204    | —                           | Credencial ou pessoa do token inexistente                                                                         |

### `POST /auth/ativar-conta`

```jsonc
{ "token": "<token>", "senha": "senhaFake123" }
```

```ts
// 200 — já autentica o usuário
{
  accessToken: string
  accessTokenExpiraEm: string
  refreshToken: string
}
```

Erros: `422` senha fraca (verificada **antes** do token), `422 "Link de convite inválido"`, `409` token já usado ou conta já ativada, `410` token expirado.

### `POST /auth/login`

```jsonc
{ "email": "lider@example.test", "senha": "senhaFake123" }
```

```ts
// 200
{
  accessToken: string
  accessTokenExpiraEm: string
  refreshToken: string
}
```

| Status | Classe                         | Mensagem                                                                                         |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| 401    | `CredencialInvalidaException`  | `"E-mail ou senha inválidos."` (e-mail inválido, inexistente, conta não ativada ou senha errada) |
| 423    | `CredencialBloqueadaException` | `"Conta temporariamente bloqueada. Tente novamente mais tarde."`                                 |

Após `LOGIN_MAX_TENTATIVAS` (5) senhas erradas, a conta fica bloqueada por `LOGIN_BLOQUEIO_SEGUNDOS` (15 min).

### `POST /auth/refresh`

```jsonc
{ "refreshToken": "<refresh>" }
```

Retorna `200` com uma nova sessão (o mesmo formato do login).

- `401 SessaoInvalidaException`: `"Refresh token não informado"` e `"Sessão inválida ou expirada"`
- `403 CredencialInativaException`: `"Conta não está ativa"`
- `204`: credencial inexistente

Atenção à regra de reuso descrita na [seção 4](#ciclo-de-vida-da-conta-e-da-sessão).

### `POST /auth/logout` (JWT)

```jsonc
{ "refreshToken": "<refresh>" }
```

Retorna `200 {}` sempre, mesmo que o token não exista ou já esteja revogado.

### `POST /auth/recuperacao-senha`

```jsonc
{ "email": "lider@example.test" }
```

Responde `202`. O corpo é `{}` quando o e-mail é inválido, inexistente ou de conta não ativada. Quando a conta existe, o corpo é `{ data: { link, expiraEm } }` (ver Riscos).

### `POST /auth/redefinir-senha`

```jsonc
{ "token": "<token>", "senha": "novaSenhaFake123" }
```

Retorna `200 {}` e **revoga todas as sessões** da credencial. Os erros são os mesmos de `ativar-conta`, com a mensagem `"Link de recuperação inválido"`.

### `GET /perfil` (JWT)

```ts
// 200
{
  id: string
  nome: string
  email: string | null
  telefone: string
  gc: (DadosGC & { vinculo: VinculoParticipante | null }) | null
}
```

Erros: `400 "Id da pessoa não informado"`; pessoa inexistente → `204`.

### `PATCH /perfil/contato` (JWT)

Precisa de pelo menos um dos dois campos. Quando há credencial, o e-mail também é atualizado nela, e passa a ser o novo login.

```jsonc
{ "telefone": "11900000000", "email": "novo@example.test" }
```

```ts
// 200
{
  id: string
  nome: string
  email: string
  telefone: string
} // email '' quando ausente
```

- `400`: `"Informe telefone ou e-mail para atualizar"`; e-mail em formato inválido
- `409 EmailEmUsoException`: `"Este e-mail já está em uso"`
- `204`: pessoa inexistente

### `/core/pessoas` (sem autenticação)

> **Não consuma estes endpoints no frontend sem antes alinhar com o backend.**
> Eles são públicos, expõem dados pessoais (CPF, nascimento, gênero, endereço) e
> devolvem a entidade de domínio crua (ver Riscos).

| Método | Rota                | Body / parâmetros                                                                                                          | Sucesso                                                      |
| ------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| GET    | `/core/pessoas`     | cabeçalhos `page` e `limit`                                                                                                | `200 Pessoa[]` + cabeçalhos de paginação (ordenado por nome) |
| GET    | `/core/pessoas/:id` | —                                                                                                                          | `200 Pessoa`; inexistente → `204`                            |
| POST   | `/core/pessoas`     | `nome, cpf, dataNascimento, genero, email, telefone, endereco` + opcionais `profissao, escolaridade, estadoCivil, idCargo` | `201 Pessoa`                                                 |
| PATCH  | `/core/pessoas/:id` | os mesmos campos                                                                                                           | `200 Pessoa`; inexistente → `204`                            |

Comportamento real:

- **O formato de saída tem prefixo `_`**, porque o objeto `Pessoa` é serializado sem mapper: `_id`, `_nome`, `_cpf`, `_telefone`, `_status`, `_statusRevisao`, `_origemCadastro`, `_endereco: { _rua, _numero, … }`, e datas como `{ _valor: string | null }`.
- **`dataNascimento` precisa estar no formato `yyyy/MM/dd`** (com barras). O formato `1990-01-01` do Swagger gera uma data inválida, que é gravada como `null`.
- **`genero` e `endereco` são obrigatórios também no PATCH.** Sem eles o backend lança `TypeError` → 500, embora o Swagger diga que todos os campos são opcionais.
- `genero` aceita `masculino`, `feminino` ou `outro`.
- Qualquer erro diferente de "não encontrado" vira **500**.

---

## 9. Divergências do Swagger

O Swagger (`/docs`) descreve corretamente rotas, métodos, parâmetros e autenticação. Já os **exemplos de resposta e vários status de erro estão errados**. O que vale é o descrito nas seções 6 a 8. As principais divergências:

| Endpoint                                                          | Swagger diz                                                | Real                                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `GET /auth/convites/:token`, `GET /auth/recuperacao-senha/:token` | `{ valido, idPessoa }`; inexistente 204; expirado 400      | `{ email, nomePessoa }`; inexistente **422**; expirado **410**       |
| `POST /auth/ativar-conta`                                         | `{ idPessoa }`; senha fraca 400                            | sessão `{ accessToken, … }`; senha fraca **422**                     |
| `POST /auth/login`                                                | credencial inválida 400                                    | **401**                                                              |
| `POST /auth/refresh`                                              | sessão inválida 400                                        | **401**                                                              |
| `POST /auth/logout`, `POST /auth/redefinir-senha`                 | `{ data: null }`                                           | `{}`                                                                 |
| `POST /auth/recuperacao-senha`                                    | não revela a conta                                         | revela e devolve o link (ver Riscos)                                 |
| `GET /perfil`                                                     | `{ idPessoa, nome, email, telefone, vinculo }`             | `{ id, nome, email, telefone, gc }`                                  |
| `PATCH /perfil/contato`                                           | `{ telefone, email }`                                      | `{ id, nome, email, telefone }`                                      |
| `GET /gc`                                                         | `rede` é string                                            | `rede` é `{ id, nome } \| null`; `endereco` com 8 campos ou `null`   |
| `GET /gc/participantes`                                           | objeto indexado pelo nome do grupo                         | array `[{ grupo, itens }]`                                           |
| `GET /relatorios/:id`, `POST …/enviar`                            | campo `id`                                                 | campo `idRelatorio`                                                  |
| `PUT /relatorios/:id/presencas`                                   | `{ data: null }`; já entregue 409                          | `{ idRelatorio, totalPresentes }`; já entregue **400**               |
| `GET /admin/conformidade`                                         | `taxaConformidade: 83.33`                                  | inteiro (`83`)                                                       |
| `POST /admin/cobrancas/em-massa`                                  | `{ totalCobrado, cobrancas[] }`                            | `{ cobrancasCriadas, ignorados }`                                    |
| `GET /admin/membros`                                              | campo `gc`                                                 | não existe; tem `email`, `telefone`, `origemCadastro`                |
| `GET /admin/membros/exportar`                                     | colunas `nome,telefone,status,bairro,gc`                   | `nome,email,telefone,bairro,status,origem`                           |
| `POST /admin/membros/:id/inativar`                                | `{ id, status }`                                           | `{ idPessoa }`                                                       |
| `POST /admin/visitantes/:id/confirmar`                            | `{ idPessoa, statusRevisao }`                              | `{ idPessoa }`                                                       |
| `POST /admin/visitantes/:id/fundir`                               | `{ idPessoaOrigem, idPessoaDestino }`                      | `{ idPessoaDestino }`                                                |
| `POST /dispositivos`                                              | `{ id, ativo }`                                            | `{ idDispositivo }`                                                  |
| `PATCH /cobrancas/:id/lida`                                       | `{ idCobranca, status }`                                   | `{ idCobranca }`                                                     |
| `POST /admin/usuarios/:idPessoa/papeis`                           | lista vazia → 400                                          | **500**                                                              |
| `/core/pessoas`                                                   | `{ id, nome, telefone }`, data `YYYY-MM-DD`, PATCH parcial | campos com `_`, data `yyyy/MM/dd`, PATCH exige `genero` e `endereco` |
| Qualquer recurso inexistente                                      | 404 nos mapas                                              | **204**                                                              |

---

## 10. Riscos e pendências conhecidas

Estes itens são comportamento atual do backend, confirmado no código. Os que envolvem segurança ou dados pessoais **precisam ser validados por Segurança da Informação** (e, para o item 2, também pelo Jurídico/DPO, em razão da LGPD) antes de qualquer frontend em produção depender deles.

1. **Vazamento do link de reset de senha.** `POST /auth/recuperacao-senha` devolve `{ link, expiraEm }` na resposta pública quando a conta existe (`SolicitarRecuperacaoSenha.usecase.ts`). Quem souber o e-mail de alguém recebe o link de redefinição e pode tomar a conta. A diferença entre `{}` e `{ data }` também revela se o e-mail está cadastrado. **O frontend não deve ler nem exibir esse `link`.**
2. **`/core/pessoas` sem autenticação.** Ele lista, lê, cria e altera pessoas, incluindo CPF, nascimento, gênero e endereço, sem nenhum guard. No contexto da igreja, esses são dados de membros, e a filiação religiosa é dado pessoal sensível (LGPD, art. 5º, II).
3. **`PATCH /cobrancas/:id/lida` não verifica se a cobrança é do líder.** Qualquer líder pode marcar qualquer cobrança como lida.
4. **Token de push não muda de dono.** Se um aparelho troca de líder, `POST /dispositivos` mantém o token vinculado ao líder anterior.
5. **Push é só log.** `LogNotificacaoPushService` e `LogNotificacaoService` registram em log, e não enviam push nem e-mail de verdade. Os convites e resets dependem de alguém repassar o link.
6. **Erros não mapeados viram 500**: `CredencialException` (papéis vazios) e qualquer `BusinessException` em `/core/pessoas`, por exemplo.
7. **Os cabeçalhos de paginação não estão expostos via CORS** (ver [Paginação](#paginação)).
8. **Não há validação de DTO** (`ValidationPipe`). Enums como `papeis` e `plataforma` não são checados, e tipos errados podem chegar ao domínio.

---

## 11. Regras para consumir a API neste repo

As regras de `docs/constitution.md` e do `AGENTS.md` continuam valendo. Para o backend em particular:

- **URL base por variável de ambiente** (ex.: `NEXT_PUBLIC_API_URL` no web, `EXPO_PUBLIC_API_URL` no native). Nunca fixe o host no código.
- **Tokens nunca vão para log, fixture ou commit.** No native, guarde o refresh token em armazenamento seguro do sistema (Keychain/Keystore), e não em `AsyncStorage`.
- **Desembrulhe o envelope num único lugar** (o cliente HTTP), tratando:
  - `204` como "não existe" e `{}` como sucesso sem dados;
  - `{ error, message }` como erro de negócio, exibindo `message` (que já vem em pt-BR);
  - `{ statusCode, message }` como erro de guard: 401 → tentar refresh uma vez e, se falhar, deslogar; 403 → sem permissão.
- **Refresh serializado**: uma única renovação em voo; as requisições concorrentes esperam por ela (ver a regra de reuso na seção 4).
- **Testes sem rede real**: mocke o módulo de serviço ou o `fetch` com `jest.mock` / `jest.spyOn`. Cada chamada assíncrona precisa de um teste do caminho de rejeição, incluindo `204` e `{ error }`.
- **Fixtures sintéticas** com valores obviamente falsos (`Pessoa Exemplo`, `lider@example.test`, `11900000000`). Nunca copie respostas reais da API para fixtures.
- **Tipos do cliente seguem este documento**, e não o Swagger. Se o backend mudar, atualize esta página e os tipos no mesmo PR.
