# Woobox Shop — GitHub Pages

Projeto preparado para deploy no GitHub Pages com Vite + React.

## Publicar

1. Envie todos os arquivos deste projeto para o repositório GitHub.
2. Vá em **Settings → Pages**.
3. Em **Build and deployment**, selecione **GitHub Actions**.
4. Faça push para a branch `main`.
5. Acesse **Actions** e aguarde o workflow `Deploy to GitHub Pages` terminar.

O workflow usa Node.js 24 e as versões atuais das actions de Pages/checkout.

## Teste local

```bash
npm install
npm run build
```

O resultado será criado na pasta `dist/`.
