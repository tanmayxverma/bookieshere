# BOOKIE

### The Study & Resource Hub for Competitive Exam Aspirants

BOOKIE is an independent, student-focused platform built to make competitive-exam resources easier to discover, organize, and use.

The platform brings together study resources, organized material libraries, useful student tools, support features, and an AI-powered assistant in one place.

**Live Website:** https://bookieshere.vercel.app

---

## What is BOOKIE?

BOOKIE started as a simple study-material project and has evolved into a broader platform for competitive-exam aspirants.

The goal is simple:

> **Make useful study resources easier to find, easier to organize, and easier to access.**

The platform is designed around a clean interface, fast navigation, organized resources, and student-oriented tools rather than unnecessary complexity.

---

## Core Features

### 📚 Resource Library

BOOKIE provides an organized collection of study resources for competitive examinations.

Resources can be categorized by areas such as:

* Exam
* Subject
* Resource type
* Topic / chapter
* Other relevant filters and metadata

The goal is to make large collections of resources searchable and manageable instead of turning them into an endless pile of links.

---

### 🤖 AI Assistant

BOOKIE includes an AI-powered assistant designed to help users interact with the platform and get useful study-related assistance.

The AI layer uses **OpenRouter** for model access, allowing the application to work with supported AI models through a unified API interface.

The AI functionality is integrated into the BOOKIE platform rather than being a separate external service.

---

### 👤 User Accounts

BOOKIE supports user accounts and personalized functionality.

Depending on the enabled features, registered users can access things such as:

* User profiles
* Personalized platform features
* Saved or associated user data
* Account-based functionality

Authentication and application data are handled through **Supabase**.

---

### 🗂️ Organized Portal & Resources

BOOKIE is not limited to a single material-download page.

The platform can organize different types of useful resources, tools, and educational content into dedicated sections so that users can navigate the ecosystem from one place.

---

### 💬 Support

BOOKIE provides dedicated support functionality for users who face issues with resources, links, accounts, or the platform itself.

Support channels may include external communication such as Telegram where applicable.

---

## Technology Stack

BOOKIE is independently developed and deployed.

### Frontend / Application

The application is served through **Vercel** and runs as an independent web application.

### Database & Backend Services

**Supabase** is used for application data and backend functionality, including database-driven features and account-related functionality.

### AI

AI functionality is powered through **OpenRouter**, providing access to supported language models through its API.

### Deployment

**Vercel** is used for production deployment.

### Previous Development Platform

BOOKIE was originally prototyped and developed using Lovable.

The current version is **no longer dependent on Lovable** and is deployed and maintained independently.

---

## Architecture Overview

At a high level, BOOKIE consists of:

```text
                    ┌─────────────────────┐
                    │     BOOKIE Web App  │
                    │   bookieshere.vercel.app
                    └──────────┬──────────┘
                               │
               ┌───────────────┼────────────────┐
               │               │                │
               ▼               ▼                ▼
        ┌────────────┐  ┌────────────┐  ┌──────────────┐
        │  Supabase  │  │ OpenRouter │  │   External   │
        │ Database & │  │ AI Gateway │  │ Resources /  │
        │ Backend    │  │            │  │ Integrations │
        └────────────┘  └────────────┘  └──────────────┘
```

This keeps the main application separate from its database, AI provider, and external resource integrations.

---

## Project Goals

BOOKIE is built with a few principles in mind:

**Simple**
The interface should remain easy to understand.

**Organized**
Resources should be structured instead of dumped into an unmanageable collection of links.

**Student-Focused**
Features should solve actual problems faced by students and aspirants.

**Fast**
Pages and resources should remain quick to access.

**Maintainable**
The project should be structured so that new resources and features can be added without rebuilding everything from scratch.

---

## Development

Clone the repository and install the project dependencies:

```bash
git clone <repository-url>
cd <repository-name>
npm install
npm run dev
```

The development server will start locally and provide the application URL.

---

## Environment Configuration

The application uses external services such as Supabase and OpenRouter.

Required configuration values should be added through environment variables rather than hard-coded into the source code.

Typical configuration includes:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
```

Use the exact variable names expected by the current application when configuring the local environment or Vercel deployment.

**Never commit private API keys, service-role keys, passwords, or other secrets to the repository.**

---

## Production Deployment

The production application is deployed through Vercel.

### Production URL

https://bookieshere.vercel.app

For production deployments, make sure the required environment variables are configured in the Vercel project settings.

---

## Data & Privacy

BOOKIE uses Supabase for application data and account-related functionality.

Sensitive credentials and private API keys should never be stored directly in frontend source code or committed to Git.

Only the minimum data required for platform functionality should be stored.

---

## Resource & Copyright Disclaimer

BOOKIE is intended to help students discover and organize educational resources.

The availability of a resource on the platform does not automatically imply ownership of that resource by BOOKIE.

Users are responsible for respecting applicable copyright, licensing, and intellectual-property laws.

Where appropriate, resources should be removed or updated in response to valid rights-holder requests.

---

## Contributing

Contributions, bug reports, feature suggestions, and improvements are welcome.

Before submitting changes:

1. Keep the existing design and usability principles in mind.
2. Avoid exposing credentials or sensitive configuration.
3. Test changes locally before deployment.
4. Keep new features focused on genuine student needs.

---

## Current Project Status

BOOKIE is an actively developed project.

Features, resource categories, AI functionality, backend systems, and the overall platform may continue to evolve as the project grows.

For the latest version, visit:

**https://bookieshere.vercel.app**

---

## Built Independently

BOOKIE is independently maintained and deployed.

The current production application is **not hosted on or dependent on Lovable**.

The project has evolved from its original prototype into its own independently deployed platform using modern web infrastructure including **Vercel, Supabase, and OpenRouter**.

---

### BOOKIE

**Organized. Simple. Student-Focused.**

Made for students who would rather spend time studying than searching through seventeen different Telegram chats for one PDF.
