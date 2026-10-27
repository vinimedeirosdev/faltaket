# Arquitetura

## Visão geral

```
┌──────────────────────────── navegador / PWA ────────────────────────────┐
│                                                                          │
│  React (rotas, telas)                                                    │
│     │                                                                    │
│     ├── AuthProvider ──── onAuthStateChanged + onSnapshot(users/{uid})   │
│     └── MateriasProvider ─ onSnapshot(users/{uid}/materias)              │
│              │                                                           │
│        Firebase JS SDK ── cache persistente (IndexedDB) ◄── offline      │
│                                                                          │
│  Service Worker (Workbox) ── precache do app ◄── abre sem internet       │
└───────────────┬──────────────────────────────────────────────────────────┘
                │ HTTPS / WebSocket
     ┌──────────▼──────────┐      ┌───────────────────────────┐
     │   Firebase Auth     │      │  Firestore                │
     │   (e-mail/senha)    │      │  + Security Rules         │◄── faltaket-server
     └─────────────────────┘      └───────────────────────────┘
```

Não existe backend próprio. A v1 tinha uma API Express no Render que:

- guardava e devolvia **senhas em texto puro**;
- aceitava qualquer `id_user` sem autenticação (dava para ler e apagar dados de outra pessoa);
- tinha _cold start_ de ~30 s no plano grátis.

Na v2, o **Firebase Auth** cuida das senhas (com hash) e das sessões, e as
**Security Rules** garantem que cada pessoa só acesse `users/{seu uid}/**`. Isso
roda no servidor do Firebase e não depende do front se comportar bem.

## Decisões e motivos

| Decisão                                                                     | Por quê                                                                                                                                                                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firestore direto do cliente, sem API                                        | Menos infraestrutura, sem cold start, tempo real e offline de graça. As regras de negócio são simples e cabem nas Rules.                                                                        |
| Login por **nome de usuário** com e-mail sintético (`usuario@faltaket.app`) | Mantém a experiência da v1 (ninguém usava e-mail) e permite migrar as contas antigas. Custo: não dá para recuperar senha por e-mail (ver Roadmap).                                              |
| Faltas como **array dentro do doc da matéria**                              | 1 leitura por matéria (a v1 fazia N+1 consultas). O limite de 200 itens deixa o doc muito abaixo de 1 MiB.                                                                                      |
| `arrayUnion` / `arrayRemove` para adicionar e remover falta                 | São operações atômicas: não dependem do estado local estar atualizado e funcionam offline.                                                                                                      |
| **Não aguardar** as escritas na UI                                          | Offline, a promise só resolve quando a conexão volta. O `onSnapshot` já entrega a mudança local na hora (update otimista), e erros viram toast via `.catch`.                                    |
| Um único `MateriasProvider`                                                 | Uma assinatura em tempo real compartilhada por todas as telas, em vez de uma por componente.                                                                                                    |
| `MateriaModaisProvider`                                                     | Qualquer lugar (card, FAB, tela vazia) abre os mesmos modais de criar, editar, histórico e excluir. O modal busca a matéria "ao vivo" pelo id, então o histórico atualiza enquanto está aberto. |
| Modal responsivo: **bottom sheet** no celular e **dialog** no desktop       | Padrão nativo de mobile, alcançável com o polegar e arrastável para fechar.                                                                                                                     |
| Componentes próprios no estilo shadcn/ui                                    | Código dentro do repositório, sem dependência de tema pesada (a v1 usava MUI + Emotion).                                                                                                        |
| Tokens de cor em CSS (`oklch`) + `.dark`                                    | Um lugar só para o tema; o modo escuro troca as variáveis. Um script inline no `index.html` aplica o tema antes do React, evitando o "piscar".                                                  |
| `registerType: 'prompt'` no PWA                                             | O usuário escolhe quando atualizar e não perde o que está fazendo (a v1 tinha dois service workers concorrendo).                                                                                |
| Página especial via `features.termo` no perfil                              | Antes era um id fixo no código. Agora é um dado que só o Admin SDK grava (as Rules bloqueiam o cliente), e o código da página só é baixado por quem tem acesso (lazy import).                   |

## Fluxos

### Autenticação

1. `AuthProvider` escuta `onAuthStateChanged`. Enquanto o Firebase não responde,
   as rotas mostram o splash (`carregando`).
2. Com usuário: assina `users/{uid}` (nome, username, features).
3. `RequireAuth` protege as rotas internas; `SomenteVisitante` manda quem já está
   logado de `/login` para a home (ou para a página que tentou abrir).
4. A sessão fica salva pelo próprio Firebase (IndexedDB). **Nada sensível vai para
   o `localStorage`**; a v1 guardava a senha lá.

### Registrar uma falta

```
clique "Faltei hoje"
  → vibrate()  (feedback tátil)
  → updateDoc(faltas: arrayUnion(novaFalta), updatedAt: serverTimestamp())   ← sem await
  → onSnapshot dispara com a escrita local → anel e status atualizam
  → toast "Falta registrada · Desfazer"  (Desfazer = arrayRemove da mesma falta)
  → Firestore sincroniza; se as Rules recusarem, o snapshot reverte e aparece um toast de erro
```

### Regras de status

Em [`src/features/materias/model.ts`](../src/features/materias/model.ts), com testes:

| Situação                   | Status                |
| -------------------------- | --------------------- |
| ainda pode faltar 2+ vezes | `ok` (verde)          |
| só pode faltar mais 1      | `atencao` (amarelo)   |
| usou todas                 | `limite` (vermelho)   |
| passou do limite           | `estourou` (vermelho) |

## Pastas

| Pasta                 | Responsabilidade                                             |
| --------------------- | ------------------------------------------------------------ |
| `src/app`             | Router, layout com navegação, tema                           |
| `src/features/<nome>` | Tudo de uma funcionalidade: telas, componentes, API e regras |
| `src/components/ui`   | Componentes visuais genéricos, sem regra de negócio          |
| `src/lib`             | Infra: Firebase, env, utilitários                            |

Regra prática: uma `feature` pode importar de `lib` e `components/ui`, e de outra
feature só via hooks públicos (`useUsuario`, `useMaterias`).

## Testes

- **Unitários** (Vitest): regras de status, ordenação, dia da semana, schemas de
  formulário, `usernameToEmail`. Rodar com `npm test`.
- **Security Rules** (emulador): no repositório faltaket-server, `npm run test:rules`.
- **Manual / ponta a ponta**: roteiro em [DEPLOY.md](DEPLOY.md#checklist-antes-de-publicar).
