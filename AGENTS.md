# epository Guidelines

## How to Use This Guide

Start here for cross-project norms.

This repository is a domain-driven ecommerce platform.

- Each component has an `AGENTS.md` file with specific guidelines (e.g., `api/AGENTS.md`, `new-ecommerce-java/AGENTS.md`).

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills (Any Project)

| Skill        | Description                                 | URL                                    |
| ------------ | ------------------------------------------- | -------------------------------------- |
| `typescript` | Const types, flat interfaces, utility types | [SKILL.md](skills/typescript/SKILL.md) |
| `react-19`   | No useMemo/useCallback, React Compiler      | [SKILL.md](skills/react-19/SKILL.md)   |
| `nextjs-15`  | App Router, Server Actions, streaming       | [SKILL.md](skills/nextjs-15/SKILL.md)  |
| `tailwind-4` | cn() utility, no var() in className         | [SKILL.md](skills/tailwind-4/SKILL.md) |
| `playwright` | Page Object Model, MCP workflow, selectors  | [SKILL.md](skills/playwright/SKILL.md) |
| `zod-4`      | New API (z.email(), z.uuid())               | [SKILL.md](skills/zod-4/SKILL.md)      |
| `zustand-5`  | Persist, selectors, slices                  | [SKILL.md](skills/zustand-5/SKILL.md)  |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                                                | Skill              |
| ------------------------------------------------------------------------------------- | ------------------ |
| After creating/modifying a skill                                                      | `skill-sync`       |
| App Router / Server Actions                                                           | `nextjs-15`        |
| Building AI chat features                                                             | `ai-sdk-5`         |
| Creating Zod schemas                                                                  | `zod-4`            |
| Creating new skills                                                                   | `skill-creator`    |
| Handling database transactions, queries, or Prisma schema changes                     | `prisma-7`         |
| Working with Authentication (NextAuth v5 / Auth.js)                                   | `nextauth-5`       |
| Working with payments, webhooks, or generating checkout links                         | `mercadopago`      |
| Fill .github/pull_request_template.md (Context/Description/Steps to review/Checklist) | `prowler-pr`       |
| Regenerate AGENTS.md Auto-invoke tables (sync.sh)                                     | `skill-sync`       |
| Reviewing JSON:API compliance                                                         | `jsonapi`          |
| Testing RLS tenant isolation                                                          | `prowler-test-api` |
| Troubleshoot why a skill is missing from AGENTS.md auto-invoke                        | `skill-sync`       |
| Using Zustand stores                                                                  | `zustand-5`        |
| Working on Prowler UI structure (actions/adapters/types/hooks)                        | `src`              |
| Working with Tailwind classes                                                         | `tailwind-4`       |
| Writing Prowler API tests                                                             | `prowler-test-api` |
| Writing React components                                                              | `react-19`         |
| Writing TypeScript types/interfaces                                                   | `typescript`       |
| Writing documentation                                                                 | `prowler-docs`     |

---

## Project Overview

This repository is a production-grade ecommerce platform built with:

Next.js 15 App Router

React 19

TypeScript strict mode

Prisma ORM

PostgreSQL

NextAuth v5

Tailwind v4

Zustand v5

Zod v4

Agents must assume modern patterns and MUST NOT generate legacy code.

Global Architectural Rule (Highest Priority)

Server Components first.
Client Components only when strictly necessary.

Default assumptions:

pages → server

layouts → server

data fetching → server

mutations → server actions

Client components allowed only if:

user interaction required

browser APIs required

animations required

Zustand store used

form state required

Never add "use client" without justification.

Source of Truth Hierarchy

When rules conflict:

This file

Folder AGENTS.md

TypeScript types

Prisma schema

ESLint rules

Domain Architecture

Project is domain-driven, not layer-driven.

Domains:

auth

products

cart

checkout

orders

admin

profile

ui

data

infra

Agents must place code inside correct domain.
Never create new architectural patterns.

Coding Standards
TypeScript

Always type returns

Never use any

Prefer type over interface

Use discriminated unions

Data Access

All database access must go through Prisma.

Forbidden:

raw SQL (unless requested)

duplicated queries

manual joins already modeled

Validation

All external input must be validated with Zod.

Includes:

request body

forms

params

API payloads

Never trust user input.

State Management

Global state = Zustand only.

Rules:

use slices

use selectors

never expose full store

never use Context API for global state

Forms

Forms must use:

react-hook-form + zodResolver

Never manage form state manually.

Styling

Styling must use Tailwind only.

Forbidden:

CSS modules

styled-components

emotion

external UI frameworks

Authentication

Auth system = NextAuth v5.

Agents must:

use server session helpers

never decode tokens manually

never store auth state client-side

File Placement Rules
Type Location
UI Components components/
Server Actions actions/
DB logic lib/ or actions/
Schemas lib/zod.ts or domain file
Stores store/
Types interfaces/ or types/

Never mix responsibilities.

Naming Conventions

files → kebab-case
components → PascalCase
functions → camelCase
constants → UPPER_CASE

Performance Rules

Always prefer:

server fetching

streaming

partial rendering

Never optimize prematurely.

Security Rules

Always assume production environment.

Required:

validate input

sanitize output

safe errors

no stack traces

never expose secrets

Dependency Policy

Agents may only use installed dependencies.

If new dependency is required:

Agent must:

justify why

explain size impact

wait approval

Forbidden Actions

Agents must NOT:

refactor unrelated files

rename folders globally

change configs silently

alter Prisma schema without instruction

introduce new architectures

downgrade libraries

Expected Agent Behavior

When implementing something:

Agent must:

locate domain

reuse patterns

respect types

validate inputs

return typed data

avoid client code unless required

Definition of Done

Before finishing a task:

types compile

lint passes

imports valid

no unused code

no console logs

no TODO comments

architecture respected

Instruction for All Agents

If unsure where code belongs:

STOP.
Analyze project structure.
Never guess.



## PROJECT STRUCTURE

```
src/
    2 ├── actions/              - [Lógica de Servidor (Server Actions)]
    3 │   ├── auth/             - [Lógica de Servidor]
    4 │   └── product/          - [Lógica de Servidor]
    5 ├── app/                  - [Páginas y Rutas]
    6 │   ├── (auth)/           - [Grupo de Rutas]
    7 │   ├── (shop)/           - [Grupo de Rutas]
    8 │   └── api/              - [API Endpoints (Server)]
    9 ├── components/           - [Componentes de UI (React)]
   10 │   ├── product/          - [Componentes Específicos]
   11 │   ├── products/         - [Componentes Específicos]
   12 │   ├── provider/         - [Componentes de Contexto (cc)]
   13 │   └── ui/               - [Componentes Genéricos]
   14 ├── config/               - [Configuración]
   15 ├── generated/            - [Código Autogenerado por Herramientas]
   16 │   └── prisma/           - [Generado por Prisma]
   17 ├── interfaces/           - [Utilidades (Tipos y Contratos de Datos)]
   18 ├── lib/                  - [Servicios y Lógica Compartida (Server)]
   19 │   └── api/              - [Utilidades de API (Server)]
   20 ├── seed /                - [Utilidades (Scripts de Base de Datos)]
   21 ├── store/                - [Manejo de Estado (Client-Side / cc)]
   22 │   ├── cart/             - [Estado del Carrito (cc)]
   23 │   └── ui/               - [Estado de la UI (cc)]
   24 ├── types/                - [Utilidades (Tipos de Datos Globales)]
   25 └── utils/                - [Utilidades (Funciones Generales)]
       # Global CSS
```

---