# 🏥 Web Project para Modelagem de Sistema

Projeto de TCC — Conjunto de Aplicações Medicinais. Este repositório contém uma aplicação web para modelagem de sistemas, com um wizard guiado para criação de projetos.

## 📁 Estrutura do Projeto

```
├── front-end/      # Interface web (Next.js + React + MUI)
├── back-end/       # API do servidor (Go)
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- **Front-end:** Node.js 18+ e npm
- **Back-end:** Go 1.21+

### Front-end

```bash
cd front-end
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Back-end

```bash
cd back-end
go run main.go
```

> ⚠️ O back-end ainda está em fase inicial de desenvolvimento.

## 🛠️ Tecnologias

### Front-end
- **Framework:** Next.js 16
- **UI Library:** React 19 + Material UI (MUI) 7
- **Linguagem:** TypeScript
- **Componentes:** Leaflet (mapas), React Dropzone (upload)

### Back-end
- **Linguagem:** Go

## 📋 Scripts Disponíveis (Front-end)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o linter (ESLint) |
