# Rafael Dias - Technical Blog

Um blog técnico sobre arquitetura de software, microsserviços e engenharia de sistemas distribuídos.

## 🚀 Sobre o Projeto

Este é o site pessoal e blog técnico do Rafael Dias, construído com [Astro](https://astro.build/) e CSS personalizado. O foco é compartilhar conhecimento sobre:

- **Arquitetura de Microsserviços**
- **Patterns de Design** (Saga, CQRS, Event Sourcing, etc.)
- **Sistemas Distribuídos**
- **Performance e Escalabilidade**
- **DevOps e Cloud Computing**

## 🛠️ Stack Tecnológica

- **[Astro](https://astro.build/)** - Framework estático moderno
- **CSS Personalizado** - Styling responsivo com variáveis CSS
- **[MDX](https://mdxjs.com/)** - Markdown com componentes JSX
- **TypeScript** - Tipagem estática
- **Sistema de Busca** - Busca em tempo real com modal
- **RSS Feed** - Feed automático de posts
- **Sitemap** - Para otimização SEO
- **Modo Escuro** - Tema dark/light com persistência

## 📁 Estrutura do Projeto

```
/
├── public/              # Arquivos estáticos
├── src/
│   ├── assets/         # Imagens e recursos
│   ├── components/     # Componentes reutilizáveis
│   ├── content/        # Posts do blog (Markdown/MDX)
│   ├── layouts/        # Layouts das páginas
│   ├── pages/          # Rotas da aplicação
│   └── styles/         # Estilos globais
├── astro.config.mjs    # Configuração do Astro
└── package.json        # Dependências
```

## 🚦 Como Executar

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/rafaelsdias/rafaelsdias-dev.git
cd rafaelsdias-dev

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
```

## ✍️ Criando Novos Posts

1. Crie um novo arquivo `.md` ou `.mdx` em `src/content/blog/`
2. Adicione o frontmatter necessário:

```markdown
---
title: 'Título do Post'
description: 'Descrição breve do conteúdo'
pubDate: '2024-12-30'
heroImage: '../../assets/imagem-opcional.jpg' # opcional
---

Conteúdo do post em Markdown...
```

3. O post será automaticamente incluído na listagem e no RSS feed

## 🎨 Personalização

### Constantes do Site

Edite `src/consts.ts` para modificar:
- Título do site
- Descrição
- Informações do autor
- URL base

### Estilos

- Estilos globais: `src/styles/global.css`
- Configuração do Tailwind: `tailwind.config.js`
- Componentes têm estilos próprios

## 📱 Features

- ✅ Design responsivo
- ✅ Dark mode friendly
- ✅ SEO otimizado
- ✅ RSS feed
- ✅ Sitemap automático
- ✅ Performance otimizada
- ✅ Sintaxe highlighting para código
- ✅ Navegação acessível

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contato

- **LinkedIn**: [linkedin.com/in/rafaelsdias](https://linkedin.com/in/rafaelsdias)
- **GitHub**: [github.com/rafaelsdias](https://github.com/rafaelsdias)
- **Website**: [rafaelsdias.dev](https://rafaelsdias.dev)

---

Desenvolvido com ❤️ usando Astro
