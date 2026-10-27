# Changelog

## 3.0.0

Mais do que faltas: tudo que a faculdade pede, num lugar só.

### Novidades

- **Grade horária**: cada matéria pode ter vários dias, com horário de início/fim, sala e
  **aula dupla**. A tela Hoje ordena as aulas pelo horário e mostra "Acontecendo agora" ou "Próxima aula".
- **Faltas mais justas**: em aula dupla o "Faltei hoje" pergunta se foram 1 ou 2 aulas;
  falta **justificada** (atestado) aparece no histórico, mas não conta no limite.
- **Página da matéria** (`/materias/:id`) com abas Faltas, Notas, Agenda e Info (horários,
  sala, professor com e-mail clicável).
- **Notas e médias**: provas e trabalhos com peso, média ponderada, **"quanto preciso tirar"**,
  situação (aprovada / exame / reprovada), média própria por matéria e média geral do semestre.
- **Agenda**: provas, trabalhos e entregas com data, hora, local, anotações e checklist;
  contagem regressiva, filtros, concluir com Desfazer. Ao criar uma prova, dá para criar a avaliação nas Notas.
  Nova aba **Agenda** na navegação; a tela Hoje mostra os próximos 7 dias.
- **Exportar para o Google Agenda / iPhone** (`.ics`): aulas semanais até o fim do semestre + provas e entregas.
- **Perfil → Faculdade**: média de aprovação, média de exame e datas do semestre.
- **Lembretes no celular** (push grátis): 07h com as aulas do dia e o aviso de limite de faltas, e
  18h com o que vence amanhã e em 3 dias. Liga e desliga por aparelho e por tipo.
- **Logo sem fundo** (PNG transparente, também em `branding/logo-transparente.png`) e **tema rosa**
  tirado das cores da logo, nos modos claro e escuro.

### Técnico

- Matérias da v2.0 (só `diaSemana`) continuam funcionando e são convertidas para `horarios` na
  primeira edição, sem script de migração.
- Service worker próprio (`src/sw.ts`, estratégia `injectManifest`): cache offline + Firebase Cloud Messaging.
- Nova variável opcional `VITE_FIREBASE_VAPID_KEY` (lembretes).
- Correção: o texto longo da "Próxima aula" alargava a página no celular (grids com `grid-cols-1`).
- Testes: 40 no front (status com aula dupla e justificada, horários legados, "agora/próxima aula",
  cálculo de notas, agenda, `.ics`) + 28 de Security Rules + 6 dos lembretes.

## 2.1.0

- **Nova logo** (estudante + calendário): aparece no login, no cadastro, na tela de carregamento, no topo do app, no ícone do app instalado e na aba do navegador. O nome passa a ser escrito **FaltaKet**.
- Logo original em `branding/`; `npm run marca` gera todas as versões otimizadas (WebP para o app, PNG/ICO para PWA e favicon).
- **Foto de perfil**: no Perfil, toque no avatar para escolher uma foto (câmera ou galeria), ver a prévia, salvar ou remover. A foto aparece também no topo do app.
- A imagem é recortada no centro, reduzida para 256×256 e comprimida em WebP (~10–30 KB) no próprio navegador, e fica salva no perfil do Firestore. Não usa Firebase Storage, então continua no plano gratuito.
- Security Rules: o dono pode alterar ou remover o campo `foto` (só imagem WebP/JPEG em data URL, até 150 mil caracteres).

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
- Ícones do PWA gerados por script (substituídos pela logo oficial na 2.1.0)
- Removidos: `better-sqlite3`, `workbox-webpack-plugin`, `axios`, `react-toastify`, imagens de fundo de 300 KB
- Rotas antigas (`/home`, `/profile`, `/register`, `/termos`) redirecionam para as novas
