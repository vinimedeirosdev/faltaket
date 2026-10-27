# Changelog

## 2.0.0

Reescrita completa: visual, arquitetura e segurança.

### Novidades

- Visual novo, mobile-first: bottom navigation, botão flutuante, bottom sheets, animações
- Tela **Hoje** com as aulas do dia, resumo e matérias que precisam de atenção
- Card com anel de progresso, status colorido e "pode faltar mais X vezes"
- Botões **Faltei hoje** e **−** no lugar da fileira de checkboxes
- **Histórico** de faltas com data e observação; registrar em outra data
- **Desfazer** nas ações de falta
- **Cor** por matéria
- **Tema escuro** (automático ou manual)
- **Offline**: funciona sem internet e sincroniza depois
- PWA: botão de instalar e aviso de nova versão
- Perfil: alterar nome e senha e excluir a conta

### Correções

- Editar matéria não apaga mais as faltas marcadas
- Marcar falta não trava a tela com loading
- Fim dos dois service workers concorrendo
- Login instantâneo (sem o cold start do Render)

### Segurança

- Senhas saem do banco e do `localStorage`: agora ficam no Firebase Auth, com hash
- Cada usuário só acessa os próprios dados (Security Rules testadas)
- Página especial liberada por flag no perfil, não mais por id fixo no código

### Técnico

- MUI/Emotion → Tailwind CSS v4 + componentes no estilo shadcn/ui (Radix, vaul)
- API Express → Firebase Auth + Firestore direto do cliente
- Axios + estado global mutável → providers React com `onSnapshot`
- Formulários com React Hook Form + Zod; variáveis de ambiente validadas
- Vite 8, React 19, TypeScript strict, ESLint, Prettier, Vitest
- Ícones do PWA gerados a partir de um SVG (`npx pwa-assets-generator`)
- Removidos: `better-sqlite3`, `workbox-webpack-plugin`, `axios`, `react-toastify`, imagens de fundo de 300 KB
- Rotas antigas (`/home`, `/profile`, `/register`, `/termos`) redirecionam para as novas
