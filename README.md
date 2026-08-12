# TrelloClone 📋

Une application web inspirée de **Trello**, permettant de gérer des tableaux (boards), des listes et des cartes de manière collaborative et en temps réel.

🔗 **Démo en ligne :** [trello-clone-ashy.vercel.app](https://trello-clone-ashy.vercel.app)

> ⚠️ Ce dépôt contient uniquement le **frontend** du projet. Le backend est développé séparément et reste **privé pour des raisons de sécurité** (gestion des données utilisateurs, authentification, etc.).

---

## 🧭 Aperçu du projet

TrelloClone reproduit les fonctionnalités essentielles de Trello :

- Création et gestion de tableaux (boards)
- Organisation des tâches en listes et cartes (drag & drop)
- Mises à jour en temps réel grâce à une connexion WebSocket
- Interface moderne, responsive et fluide

L'objectif de ce projet est de mettre en pratique la création d'une application front-end complète, connectée à une API backend via REST et WebSocket, avec une expérience utilisateur proche des outils de gestion de projet professionnels.

---

## 🛠️ Stack technique

| Catégorie | Technologie |
|---|---|
| Framework | [Angular 17](https://angular.io/) |
| Style | [Tailwind CSS](https://tailwindcss.com/) |
| Composants UI | [Angular CDK](https://material.angular.io/cdk/categories) (drag & drop) |
| Temps réel | [STOMP.js](https://stomp-js.github.io/) + [SockJS](https://github.com/sockjs/sockjs-client) |
| Notifications | [SweetAlert2](https://sweetalert2.github.io/) |
| Langage | TypeScript |
| Réactivité | RxJS |
| Tests | Karma / Jasmine |

---

## 📦 Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [Angular CLI](https://angular.io/cli) v17

```bash
npm install -g @angular/cli@17
```

---

## 🚀 Installation et lancement

1. **Cloner le dépôt**

```bash
git clone https://github.com/AlaAydi/Trello_Clone.git
cd Trello_Clone
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer l'URL du backend**

Ce frontend communique avec une API backend (REST + WebSocket) qui n'est pas incluse dans ce dépôt. Vous devrez configurer l'URL de votre propre backend dans les fichiers d'environnement d'Angular (`src/environments/`).

4. **Lancer le serveur de développement**

```bash
ng serve
```

Rendez-vous ensuite sur `http://localhost:4200/`. L'application se recharge automatiquement à chaque modification des fichiers sources.

---

## 🏗️ Build

Pour générer une version de production :

```bash
ng build
```

Les fichiers compilés seront disponibles dans le dossier `dist/`.

---

## 🧪 Tests

Pour exécuter les tests unitaires via [Karma](https://karma-runner.github.io) :

```bash
ng test
```

---

## 📁 Structure du projet

```
Trello_Clone/
├── src/              # Code source de l'application Angular
├── .vscode/          # Configuration de l'éditeur
├── angular.json      # Configuration Angular CLI
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🔒 À propos du backend

Le backend de ce projet (API REST, gestion des WebSockets, base de données, authentification, etc.) a été entièrement développé mais **n'est pas rendu public** afin de protéger la logique métier et les informations sensibles du projet. Seul le frontend est partagé ici à titre de démonstration.

---

## ✍️ Auteur

Développé par [AlaAydi](https://github.com/AlaAydi).

---

## 📄 Licence

Ce projet est fourni à des fins de démonstration et d'apprentissage. N'hésitez pas à me contacter pour toute question concernant son fonctionnement.
