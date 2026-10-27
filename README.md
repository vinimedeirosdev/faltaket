# Faltaket 💜

PWA para controlar as faltas da faculdade sem susto. Você cadastra cada matéria com
o limite de faltas, registra quando falta, e o app avisa quando estiver chegando
perto do limite.

Funciona no celular como um app instalado, inclusive **offline**.

| Hoje                                     | Matérias                    | Histórico                         | Escuro                           |
| ---------------------------------------- | --------------------------- | --------------------------------- | -------------------------------- |
| Aulas do dia, resumo e matérias em risco | Agrupadas por dia da semana | Datas e observações de cada falta | Tema claro, escuro ou do sistema |

---

## Funcionalidades

- **Tela "Hoje"**: as aulas do dia em destaque, com o botão **Faltei hoje** à mão
- **Status por matéria** com anel de progresso: _tranquilo → atenção → no limite → estourou_
- **"Pode faltar mais X vezes"**: o cálculo já vem feito
- **Histórico** de cada matéria: registrar falta em outra data, com observação, e remover uma específica
- **Desfazer** em toda ação de falta (toast com botão)
- **Editar matéria sem perder as faltas** (na v1 elas eram apagadas)
- **Cores** por matéria
- **Offline-first**: marca falta sem internet e sincroniza depois
- **PWA**: instalar no celular e aviso de "nova versão disponível"
- **Tema escuro** automático, com opção manual
- **Perfil**: trocar nome e senha e excluir a conta
- 💌 Uma página especial, liberada por usuário

## Stack

| Camada      | Tecnologia                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Build       | Vite 8 + TypeScript (strict)                                                                    |
| UI          | React 19, Tailwind CSS v4, componentes no estilo shadcn/ui (Radix + vaul), lucide-react, motion |
| Formulários | React Hook Form + Zod                                                                           |
| Dados       | Firebase Auth (e-mail/senha) + Firestore com cache offline persistente                          |
| Roteamento  | React Router                                                                                    |
| PWA         | vite-plugin-pwa (Workbox)                                                                       |
| Qualidade   | ESLint, Prettier, Vitest + Testing Library                                                      |
| Hospedagem  | Firebase Hosting                                                                                |

Não existe API própria: o app fala direto com o Firebase, e quem protege os dados
são as **Security Rules**, versionadas no repositório
[faltaket-server](https://github.com/vinimedeirosdev/faltaket-server).

## Começando em 5 minutos

Pré-requisitos: **Node 22.12+**. Para usar os emuladores locais, também **Java 21+**.

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Firebase
npm run dev                  # http://localhost:5173
```

Para criar o projeto Firebase e preencher o `.env.local`, ou para rodar tudo
localmente com emuladores, sem tocar em produção, veja **[docs/SETUP.md](docs/SETUP.md)**.

## Scripts

| Comando             | O que faz                                    |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                  |
| `npm run build`     | Typecheck + build de produção em `dist/`     |
| `npm run preview`   | Serve o build localmente                     |
| `npm run typecheck` | Só o TypeScript                              |
| `npm run lint`      | ESLint                                       |
| `npm run format`    | Prettier (com ordenação de classes Tailwind) |
| `npm test`          | Testes unitários (Vitest)                    |
| `npm run deploy`    | Build + deploy no Firebase Hosting           |

## Documentação

| Documento                                                                                           | Conteúdo                                                       |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [docs/SETUP.md](docs/SETUP.md)                                                                      | Criar projeto Firebase, variáveis de ambiente, emuladores      |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                                                        | Como o app é organizado e por quê                              |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md)                                                            | Coleções do Firestore, regras de negócio e segurança           |
| [docs/DEPLOY.md](docs/DEPLOY.md)                                                                    | Publicar no Firebase Hosting (manual e via GitHub Actions)     |
| [docs/ROADMAP.md](docs/ROADMAP.md)                                                                  | Próximas ideias                                                |
| [CHANGELOG.md](CHANGELOG.md)                                                                        | O que mudou da v1 para a v2                                    |
| [Migração v1 → v2](https://github.com/vinimedeirosdev/faltaket-server/blob/master/docs/MIGRACAO.md) | Passo a passo para levar os dados antigos (no faltaket-server) |

## Estrutura

```
src/
├─ app/            # router, layout (header, bottom nav, FAB), tema
├─ features/
│  ├─ auth/        # login, cadastro, AuthProvider, API do Auth, schemas
│  ├─ materias/    # telas Hoje/Matérias, card, formulário, histórico, regras de status
│  ├─ perfil/
│  ├─ pwa/         # instalar app + aviso de atualização
│  └─ termo/
├─ components/ui/  # botões, inputs, modal responsivo, menu, confirmação
├─ lib/            # firebase, env (validado com Zod), username → e-mail, utils
└─ styles/         # tokens de tema (claro/escuro)
```
