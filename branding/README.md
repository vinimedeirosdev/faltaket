# Marca

Arquivos-fonte da identidade visual. **Nada desta pasta vai para o site**: o app
usa versões otimizadas, geradas a partir daqui.

| Arquivo             | O que é                                    |
| ------------------- | ------------------------------------------ |
| `logo-original.png` | Logo oficial em alta resolução (1254×1254) |

## Gerar as imagens do app

```bash
npm run marca
```

O script [`scripts/gerar-marca.mjs`](../scripts/gerar-marca.mjs) cria:

| Saída                                           | Onde aparece                                          |
| ----------------------------------------------- | ----------------------------------------------------- |
| `src/assets/brand/logo.webp`                    | Logo completa: login, cadastro e tela de carregamento |
| `src/assets/brand/icone.webp`                   | Só a ilustração, sem o texto: topo do app             |
| `public/pwa-*.png`, `maskable-icon-512x512.png` | Ícone do app instalado (Android, Chrome)              |
| `public/apple-touch-icon-180x180.png`           | Ícone no iPhone (Adicionar à Tela de Início)          |
| `public/favicon.ico`, `favicon-48x48.png`       | Aba do navegador (recorte do rosto, legível em 16 px) |

No código, use os componentes de [`src/components/brand.tsx`](../src/components/brand.tsx)
(`LogoCompleta`, `MarcaIcone`) em vez de importar as imagens direto.

## Trocar a logo

1. Substitua `logo-original.png` (de preferência quadrada, ≥ 1024 px).
2. Se a composição mudar, ajuste os recortes `ILUSTRACAO` e `ROSTO` no topo do script.
3. `npm run marca`, confira as imagens geradas e faça o deploy.
   O PWA instalado atualiza o ícone sozinho depois de algum tempo; no iPhone pode
   ser preciso remover e adicionar de novo à tela de início.
