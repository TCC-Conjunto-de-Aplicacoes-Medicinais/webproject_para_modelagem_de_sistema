# 📋 Checklist de Alinhamento Acadêmico — CONIC 2026
## Módulo 1: Portal de Solicitação & Wizard de Parametrização Clínica

> **Documento Base:** *Artigo CONIC SEMESP 2026 — Plataforma SaaS Open Health (POHINC)*  
> **Repositório:** `webproject_para_modelagem_de_sistema`  
> **Domínio de Produção Citado:** `https://www.pohinc.com.br`

---

### 📌 1. Visão Geral do Módulo no Artigo
Conforme descrito nas Seções **3.2, 4.1 e 5 (Figura 1)** do artigo:
* **Papel:** Interface web guiada (*wizard*) em Next.js para captação de requisitos, perfis de acesso, capacidade computacional e pré-visualização em tempo real.
* **Saída Esperada:** Consolidação dos parâmetros em um payload JSON estruturado e criptografado com Zero-Knowledge Storage (AES-256-GCM via PBKDF2), disparado para o motor de orquestração em Go.

---

### 🎯 2. Status da Implementação — 100% Concluído ✅

#### 2.1. Funcionalidades do Wizard e Interface
- [x] Wizard interativo passo a passo em Next.js 16 + React 19 + Material UI 7.
- [x] Seleção visual de identidade da marca, módulos ativos e simulação em tempo real.
- [x] Backend em Go (Gin) com Clean Architecture e autenticação Keycloak (OAuth2/OIDC).
- [x] Persistência relacional de clínicas no MariaDB e armazenamento de Blueprints no MinIO/S3.
- [x] Criptografia de payloads com derivação de chave PBKDF2 (`pkg/vault/vault.go`).
- [x] Disparo assíncrono para o motor de geração via `POST /api/v1/instantiate` e `POST /generate` em `project_service.go`.

#### 2.2. Acompanhamento e Métricas de Convergência (< 4 min)
- [x] **Feedback de Progresso e Acompanhamento da Infraestrutura:**
  - Implementado modal dinâmico `ProvisioningProgressDialog` em `StepFinalization.tsx`.
  - Exibe cronômetro em tempo real (`Tempo: MM:SS | Meta CONIC: < 4 min`).
  - Apresenta as 6 fases acadêmicas: Cifra PBKDF2/AES-GCM -> Disparo ao Motor -> Cirurgia de Código -> Orquestração VPC/ALB -> Sonda de Health Check (HTTP 200) -> Clínica Ativa.
  - Endpoint de consulta de status de provisionamento implementado no backend: `GET /api/v1/projects/:id/status`.

#### 2.3. Exportação e Portabilidade da Especificação
- [x] **Download do Arquivo JSON de Especificação (`blueprint.json`):**
  - Adicionado botão dedicado para baixar o arquivo `blueprint_<clinic_name>_<id>.json` tanto na tela de finalização quanto no modal de conclusão.

#### 2.4. Dimensionamento e Ambientes
- [x] **Mapeamento de Capacidade para o Terraform:**
  - Garantida a propagação completa do nó `technical.sizing` (`minPatients`, `maxPatients`, `avgDoctors`, `avgAssistants`) para o motor dimensionar adequadamente os recursos.
- [x] **Configuração e Domínios:**
  - Arquivo `.env.example` atualizado com o `MOTOR_URL=http://localhost:8082` e suporte aos microsserviços integrados.
