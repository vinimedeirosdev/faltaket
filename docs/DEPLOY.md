# Deploy

O front é publicado no **Firebase Hosting** (plano grátis), que substitui o Render
da v1. HTTPS, CDN e fallback de SPA (`/qualquer-rota → index.html`) já vêm
configurados em [`firebase.json`](../firebase.json).

## Primeira vez

```bash
npm i -g firebase-tools        # ou use npx firebase ...
firebase login
cp .firebaserc.example .firebaserc   # troque "seu-projeto" pelo id do projeto
```

Confira que o `.env.local` (ou `.env.production.local`) aponta para o projeto de
produção, com `VITE_USE_EMULATORS=false`.

## Publicar

```bash
npm run deploy      # = npm run build && firebase deploy --only hosting
```

A URL aparece no fim (`https://<projeto>.web.app`). Domínio próprio: Console →
Hosting → **Adicionar domínio personalizado**.

> As **Security Rules** são publicadas a partir do repositório faltaket-server
> (`npm run deploy:rules`). Publique as rules **antes** do front quando mudar o
> modelo de dados.

### Cache

- `/assets/**` têm hash no nome → cache de 1 ano (`immutable`).
- `index.html`, `sw.js` e o manifest → `no-cache`, para o PWA perceber versões novas.
- Quem está com o app aberto vê o toast **"Nova versão disponível · Atualizar"**.

## Deploy automático (GitHub Actions, opcional)

1. Gere um token: `firebase login:ci` (ou crie uma service account com o papel
   _Firebase Hosting Admin_) e salve como secret `FIREBASE_SERVICE_ACCOUNT`.
2. Salve as variáveis `VITE_FIREBASE_*` como secrets do repositório.
3. Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint && npm test
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
```

## Checklist antes de publicar

- [ ] `npm run lint && npm test && npm run build` sem erros
- [ ] Rules publicadas e `npm run test:rules` passando (faltaket-server)
- [ ] No celular (ou DevTools em 375px): entrar, criar, editar e excluir matéria, _Faltei hoje_, −, Desfazer
- [ ] Histórico: registrar falta com data passada e observação, remover uma
- [ ] Offline: DevTools → Network → _Offline_ → marcar falta → voltar online → conferir no Console do Firestore
- [ ] Tema escuro (Perfil → Aparência)
- [ ] Instalar o PWA (Android/Chrome: botão no Perfil; iPhone: Compartilhar → Tela de Início)
- [ ] Matéria: aula dupla (Faltei hoje pergunta 1 ou 2), justificar falta, aba Notas com "quanto preciso"
- [ ] Agenda: criar prova, concluir e desfazer; exportar `.ics` no Perfil
- [ ] Lembretes (com `VITE_FIREBASE_VAPID_KEY`): ligar no Perfil e disparar o workflow manualmente
- [ ] Usuário com `features.termo` vê a página especial; os outros não

## Migrando da v1 (uma vez só)

Ordem recomendada:

1. Publicar as rules (faltaket-server).
2. Rodar a migração ([guia](https://github.com/vinimedeirosdev/faltaket-server/blob/main/docs/MIGRACAO.md)).
3. Publicar este front.
4. Validar o login com as senhas antigas.
5. Desligar o serviço antigo no Render.
6. Só depois, rodar o `--cleanup` da migração.
