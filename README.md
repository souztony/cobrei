# 📘 Projeto: Cobrei

## 🧠 Descrição Geral

**Cobrei** é uma plataforma simples e prática para controle de cobranças e recebimentos, voltada para autônomos e pequenos negócios.

O objetivo é permitir que o usuário:

* registre clientes
* crie cobranças
* envie lembretes automaticamente via WhatsApp
* acompanhe pagamentos

Tudo de forma rápida, sem complexidade e sem conhecimento técnico.

---

## 🎯 Problema que resolve

Muitos profissionais:

* controlam dívidas em cadernos ou memória
* esquecem de cobrar clientes
* perdem dinheiro por falta de organização
* sentem constrangimento ao cobrar

O Cobrei resolve isso automatizando e simplificando o processo de cobrança.

---

## 👤 Público-alvo

* Barbeiros
* Manicures
* Mecânicos
* Freelancers
* Pequenos comerciantes
* Prestadores de serviço em geral

---

## ⚙️ Funcionalidades (MVP)

### 👥 Clientes

* Criar cliente (nome, telefone)
* Listar clientes
* Editar e excluir cliente

---

### 💸 Cobranças

* Criar cobrança:

  * cliente
  * valor
  * descrição
  * data de vencimento

* Listar cobranças

* Marcar como:

  * Pendente
  * Pago

---

### 📲 Integração com WhatsApp

* Botão para enviar mensagem de cobrança
* Geração automática de mensagem com:

  * nome do cliente
  * valor
  * descrição
  * data

---

### 📊 Dashboard

* Total recebido
* Total pendente
* Total atrasado

---

## 🚀 Funcionalidades futuras

* Envio automático de lembretes (cron job)
* Cobrança recorrente
* Integração com PIX
* Link de pagamento
* Notificações
* Multiusuário

---

## 🧱 Stack Tecnológica

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Fastify

### Banco de Dados

* PostgreSQL
* Prisma ORM

---

## 🔐 Autenticação

* JWT (JSON Web Token)
* Cadastro e login com email e senha

---

## 🗄️ Modelagem de Dados (Resumo)

### User

* id
* name
* email
* password

### Client

* id
* name
* phone
* userId

### Charge

* id
* amount
* description
* dueDate
* status (PENDING | PAID)
* clientId
* userId

---

## 🔄 Fluxo Principal

1. Usuário cria conta
2. Cadastra clientes
3. Cria cobranças
4. Envia mensagem via WhatsApp
5. Marca como pago ao receber

---

## 💡 Diferencial

* Simplicidade extrema
* Foco em usuários não técnicos
* Integração com WhatsApp
* Redução de constrangimento ao cobrar

---

## 🧠 Objetivo do Produto

Ser a forma mais fácil e rápida de:

> cobrar, lembrar e receber pagamentos

---

## 📌 Frase do Produto

**Cobrei — cobre sem complicação.**
