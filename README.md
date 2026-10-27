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

**Faltas**

- Tela **Hoje** com as aulas do dia na ordem do horário, mais "Acontecendo agora" ou "Próxima aula"
- Anel de progresso e status por matéria: _tranquilo → atenção → no limite → estourou_. O app já mostra "pode faltar mais X vezes".
- **Aula dupla** conta 2; falta **justificada** (atestado) fica no histórico, mas não conta
- **Histórico** com data, observação e Desfazer em toda ação

**Grade e matérias**

- Vários dias por matéria, com horário, sala e professor; página da matéria com abas
- Cores por matéria e calculadora do limite (25% das aulas)

**Notas**

- Avaliações com peso, média ponderada, **"quanto preciso tirar"**, situação (aprovada / exame / reprovada) e média geral

**Agenda**

- Provas, trabalhos e entregas com checklist e contagem regressiva
- Exportação para o **Google Agenda / iPhone** (arquivo `.ics`)

**Lembretes**

- Push grátis às 07h (aulas do dia e limite de faltas) e às 18h (o que vence amanhã)

**App**

- Offline-first, PWA instalável, tema claro e escuro, foto de perfil
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
| `npm run marca`     | Gera ícones e logos a partir de `branding/`  |

## Documentação

| Documento                                                                                           | Conteúdo                                                       |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [docs/SETUP.md](docs/SETUP.md)                                                                      | Criar projeto Firebase, variáveis de ambiente, emuladores      |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                                                        | Como o app é organizado e por quê                              |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md)                                                            | Coleções do Firestore, regras de negócio e segurança           |
| [docs/DEPLOY.md](docs/DEPLOY.md)                                                                    | Publicar no Firebase Hosting (manual e via GitHub Actions)     |
| [docs/ROADMAP.md](docs/ROADMAP.md)                                                                  | Próximas ideias                                                |
| [CHANGELOG.md](CHANGELOG.md)                                                                        | O que mudou da v1 para a v2                                    |
| [Migração v1 → v2](https://github.com/vinimedeirosdev/faltaket-server/blob/main/docs/MIGRACAO.md) | Passo a passo para levar os dados antigos (no faltaket-server) |

## Estrutura

```
branding/          # logo original (fonte, não vai para o site) — ver branding/README.md
scripts/           # gerar-marca.mjs: gera ícones/logos otimizados a partir de branding/
public/            # ícones do PWA e favicon (gerados)
src/
├─ assets/brand/   # logo e ícone otimizados (gerados), usados via components/brand.tsx
├─ app/            # router, layout (header, bottom nav, FAB), tema
├─ features/
│  ├─ auth/        # login, cadastro, AuthProvider, API do Auth, schemas
│  ├─ materias/    # telas Hoje/Matérias, card, formulário, histórico, regras de status
│  ├─ perfil/
│  ├─ pwa/         # instalar app + aviso de atualização
│  └─ termo/
├─ components/
│  ├─ brand.tsx    # LogoCompleta, MarcaIcone
│  └─ ui/          # botões, inputs, modal responsivo, menu, confirmação
├─ lib/            # firebase, env (validado com Zod), username → e-mail, utils
└─ styles/         # tokens de tema (claro/escuro)
```
