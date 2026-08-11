# Woobox Shop — versão pública para GitHub Pages

Esta versão contém somente a loja pública. A administração deve ficar no sistema administrativo separado.

## Publicação pelo site do GitHub

1. Extraia este ZIP.
2. No repositório existente, use **Add file → Upload files**.
3. Envie todos os arquivos e pastas desta versão.
4. Faça commit na branch `main`.
5. Vá em **Settings → Pages** e deixe **Source = GitHub Actions**.
6. Em **Actions**, aguarde `Deploy to GitHub Pages`.

### Importante sobre arquivos antigos

O upload do GitHub **substitui arquivos com o mesmo nome, mas não apaga arquivos antigos que não fazem parte do novo ZIP**.

Por isso, depois do upload, remova do repositório os arquivos administrativos antigos que não aparecem nesta versão, especialmente:

- `src/components/AdminPanel.tsx`
- `src/components/AdminUnlockModal.tsx`
- `src/components/ProductFormModal.tsx`
- `src/components/HighlightFormModal.tsx`
- `src/services/auth.ts`
- `src/services/gmail.ts`
- `server.ts`

Se esses arquivos continuarem no repositório, eles ainda ficarão públicos mesmo que não sejam usados pela loja.

## Build

O GitHub Pages executa somente:

```bash
npm ci
npm run build
```

O resultado estático fica em `dist/`.

## Firebase

A loja pública lê produtos, destaques, categorias e configurações. Ela só escreve:

- contador de cliques do produto, limitado a +1 por atualização;
- registro de clique;
- inscrição/desinscrição da newsletter.

As regras de Firestore desta pasta bloqueiam alterações públicas no catálogo.

**Atenção:** se o seu sistema administrativo separado usa o mesmo Firestore, as regras dele precisam permitir as operações administrativas autenticadas. Não publique estas regras no Firebase sem conferir a configuração do sistema administrativo separado.
