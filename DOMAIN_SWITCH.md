# 🔄 Como Trocar o Domínio

Este guia explica como alternar entre o GitHub Pages padrão e o domínio personalizado.

## 📝 Configuração Atual

O site está configurado para facilitar a troca entre domínios através do arquivo `src/consts.ts`.

### Para usar GitHub Pages (rafaelsdiasdev.github.io/rafaelsdias.dev):

1. No arquivo `src/consts.ts`, defina:
   ```typescript
   const USE_CUSTOM_DOMAIN = false;
   ```

2. No arquivo `astro.config.mjs`, configure:
   ```javascript
   export default defineConfig({
     site: 'https://rafaelsdiasdev.github.io',
     base: '/rafaelsdias.dev',
   ```

### Para usar domínio personalizado (rafaelsdias.dev):

1. No arquivo `src/consts.ts`, defina:
   ```typescript
   const USE_CUSTOM_DOMAIN = true;
   ```

2. No arquivo `astro.config.mjs`, configure:
   ```javascript
   export default defineConfig({
     site: 'https://rafaelsdias.dev',
     base: '/',
   ```

## 🚀 Comandos para aplicar mudanças:

```bash
# Fazer build local para testar
npm run build

# Fazer commit e push
git add -A
git commit -m "Switch to custom domain / Switch to GitHub Pages"
git push origin master
```

## ✅ Verificações:

- URLs nos metadados (BaseHead.astro)
- Links internos e referências ao domínio
- Configuração do sitemap
- Schema.org structured data

---

**Nota**: Sempre teste o build localmente antes de fazer o deploy!
