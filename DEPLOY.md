# 🚀 Deploy no GitHub Pages

Este guia explica como habilitar o GitHub Pages para seu site Astro.

## 📋 Pré-requisitos

- ✅ Configuração do Astro já está pronta (`astro.config.mjs`)
- ✅ Workflow do GitHub Actions já foi criado (`.github/workflows/deploy.yml`)
- ✅ Build local está funcionando (`npm run build`)

## 🔧 Passos para Habilitar o GitHub Pages

### 1. Fazer Commit e Push dos Arquivos

Primeiro, você precisa enviar os arquivos para o GitHub:

```bash
git add .
git commit -m "Configure GitHub Pages with Astro"
git push origin master
```

### 2. Habilitar GitHub Pages no Repositório

1. Vá para o seu repositório no GitHub: https://github.com/rafaelsdiasdev/rafaelsdias.dev
2. Clique na aba **Settings** (Configurações)
3. No menu lateral esquerdo, clique em **Pages**
4. Em **Source**, selecione **GitHub Actions**
5. A configuração será salva automaticamente

### 3. Aguardar o Deploy

- O workflow será executado automaticamente após o push
- Você pode acompanhar o progresso na aba **Actions** do repositório
- O site ficará disponível em: https://rafaelsdiasdev.github.io/rafaelsdias.dev

## 🎯 URLs do Site

- **Produção**: https://rafaelsdiasdev.github.io/rafaelsdias.dev
- **Desenvolvimento**: http://localhost:4321

## 🔄 Deploy Automático

O site será atualizado automaticamente sempre que você fizer push para a branch `master`.

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## ✨ Recursos Configurados

- ✅ Deploy automático via GitHub Actions
- ✅ Sitemap.xml gerado automaticamente
- ✅ Suporte a MDX para blog posts
- ✅ Otimizações de performance (minificação CSS/JS)
- ✅ URLs amigáveis com trailing slash

## 🐛 Troubleshooting

Se o deploy falhar:

1. Verifique os logs na aba **Actions**
2. Certifique-se de que o GitHub Pages está configurado como **GitHub Actions**
3. Verifique se as permissões do repositório permitem GitHub Actions

---

**Próximos passos**: Após habilitar o GitHub Pages, faça o commit e push deste arquivo para ativar o deploy automático! 🎉 