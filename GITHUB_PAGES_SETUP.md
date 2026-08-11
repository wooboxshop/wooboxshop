# GitHub Pages

Este projeto é a aplicação original da Woobox Shop, preparada para publicação no GitHub Pages.

- O workflow usa Node.js 24.
- O build é `npm run build`, gerando `dist/`.
- O Vite usa `/wooboxshop/` como base quando executado no GitHub Actions.
- No GitHub, em Settings → Pages, selecione **GitHub Actions** como fonte.

Observação: funcionalidades que dependem de um servidor Node/Express (por exemplo, endpoints `/api`) não são hospedadas pelo GitHub Pages. A interface principal usa Firebase/Firestore diretamente.
