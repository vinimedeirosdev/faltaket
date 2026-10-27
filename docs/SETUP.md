# Setup

Há dois jeitos de rodar o Faltaket:

- **A. Com emuladores**: tudo local, sem conta no Firebase. Recomendado para desenvolver.
- **B. Com um projeto Firebase de verdade**: necessário para produção.

Os dois começam igual:

```bash
git clone git@github.com:vinimedeirosdev/faltaket.git
git clone git@github.com:vinimedeirosdev/faltaket-server.git   # rules, emuladores, migração
cd faltaket && npm install
cd ../faltaket-server && npm install
```

---

## A. Local com emuladores

Requisitos: **Node 22.12+** e **Java 21+** (os emuladores do Firebase rodam na JVM).

1. Suba os emuladores de Auth e Firestore (já com as Security Rules do repositório):

   ```bash
   cd faltaket-server
   npm run emulators          # Auth :9099 · Firestore :8080 · UI :4000
   ```

2. Crie o `.env.local` do front:

   ```dotenv
   VITE_FIREBASE_API_KEY=demo-key
   VITE_FIREBASE_AUTH_DOMAIN=demo-faltaket.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=demo-faltaket
   VITE_FIREBASE_APP_ID=demo-app
   VITE_AUTH_EMAIL_DOMAIN=faltaket.app
   VITE_USE_EMULATORS=true
   ```

   O `projectId` precisa ser **`demo-faltaket`**, o mesmo usado pelo `npm run emulators`.

3. Rode o app:

   ```bash
   cd faltaket
   npm run dev
   ```

4. Crie uma conta em `/cadastro`. Os dados ficam só no emulador e somem quando ele
   é desligado. Na UI dos emuladores (http://localhost:4000) dá para ver e editar
   usuários e documentos.

> **Liberar a página especial no emulador:** na UI, abra `users/<seu uid>` e
> adicione o campo `features` (map) com `termo: true`.

---

## B. Projeto Firebase real

### 1. Criar o projeto

1. https://console.firebase.google.com → **Adicionar projeto**.
2. **Authentication** → _Começar_ → **Método de login** → ative **E-mail/senha**.
3. **Firestore Database** → _Criar banco de dados_ → modo **produção** → região
   `southamerica-east1` (São Paulo).
4. **⚙ Configurações do projeto** → _Seus apps_ → ícone **Web (`</>`)** → registre
   o app (não precisa marcar Hosting aqui).

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha com os valores de **Configurações do projeto → Seus apps → Configuração do SDK**:

| Variável                            | Obrigatória                 | Descrição                                                                                                                                                                                                                                                |
| ----------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | sim                         | `apiKey`                                                                                                                                                                                                                                                 |
| `VITE_FIREBASE_AUTH_DOMAIN`         | sim                         | `authDomain`                                                                                                                                                                                                                                             |
| `VITE_FIREBASE_PROJECT_ID`          | sim                         | `projectId`                                                                                                                                                                                                                                              |
| `VITE_FIREBASE_STORAGE_BUCKET`      | não                         | `storageBucket` (não usado hoje)                                                                                                                                                                                                                         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | não                         | `messagingSenderId` (futuras notificações)                                                                                                                                                                                                               |
| `VITE_FIREBASE_APP_ID`              | sim                         | `appId`                                                                                                                                                                                                                                                  |
| `VITE_FIREBASE_VAPID_KEY`           | não                         | Chave pública Web Push para os lembretes no celular (Console → Cloud Messaging → Certificados push da Web). Sem ela os lembretes ficam desligados. Ver [LEMBRETES.md](https://github.com/vinimedeirosdev/faltaket-server/blob/main/docs/LEMBRETES.md). |
| `VITE_AUTH_EMAIL_DOMAIN`            | não (padrão `faltaket.app`) | Domínio do e-mail sintético do login. **Nunca mude depois de ter usuários**: o mesmo usuário passaria a gerar outro e-mail e não conseguiria entrar. Precisa ser igual ao `AUTH_EMAIL_DOMAIN` da migração.                                               |
| `VITE_USE_EMULATORS`                | não (padrão `false`)        | `true` conecta nos emuladores locais                                                                                                                                                                                                                     |

> Esses valores **não são segredos**: eles vão para o navegador de qualquer forma.
> A proteção dos dados vem das Security Rules. Mesmo assim, o `.env.local` fica
> fora do git.

Se faltar alguma variável obrigatória, o app não sobe e mostra exatamente qual é
(validação em [`src/lib/env.ts`](../src/lib/env.ts)).

### 3. Publicar as Security Rules

Sem isso o Firestore recusa todas as leituras e escritas:

```bash
cd faltaket-server
cp .firebaserc.example .firebaserc   # coloque o id do seu projeto
npx firebase login
npm run deploy:rules
```

### 4. Rodar

```bash
cd faltaket
npm run dev
```

### 5. (Se vier da v1) Migrar os dados

Siga o [guia de migração](https://github.com/vinimedeirosdev/faltaket-server/blob/main/docs/MIGRACAO.md).
Ele cria as contas no Auth **com as senhas antigas** e mantém os mesmos IDs, então
ninguém perde nada.

---

## Problemas comuns

| Sintoma                                                      | Causa provável                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Tela branca com "Variáveis de ambiente inválidas" no console | `.env.local` faltando ou incompleto                                           |
| "Usuário ou senha incorretos" para um usuário migrado        | `VITE_AUTH_EMAIL_DOMAIN` diferente do usado na migração                       |
| "Não foi possível carregar suas matérias"                    | Rules não publicadas, ou o projeto do `.env.local` não é o mesmo das rules    |
| No emulador, todo login dá erro de rede                      | Emuladores não estão rodando, ou `VITE_FIREBASE_PROJECT_ID` ≠ `demo-faltaket` |
| `firebase-tools no longer supports Java version before 21`   | Atualize o Java (ou use um JDK 21 portátil apontando o `JAVA_HOME`)           |
