# 🗺️ Projet-Dnd-CNAM – Plateau de Jeu Interactif

## 📌 Présentation

Ce projet propose une **application web interactive** de plateau de jeu, permettant de déplacer des pièces, d’interagir via un menu contextuel, et de gérer l’état du plateau en temps réel. L’architecture du projet met l’accent sur la maintenabilité, l’extensibilité et la clarté, en appliquant les principes **SOLID** et plusieurs **patrons de conception** reconnus.

---

## ⚙️ Fonctionnalités

- 🖱️ Déplacement de pièces par glisser-déposer avec mise à jour dynamique du plateau.
- 📋 Menu contextuel riche (options d’action sur les pièces et le plateau).
- 💾 Persistance de l’état du plateau (sauvegarde/chargement via JSON).
- 🔄 Synchronisation graphique et logique entre la vue et le modèle.
- 🧩 Architecture modulaire facilitant l’ajout de nouvelles fonctionnalités.

---

## 🚀 Installation & Utilisation

1. **Pour activer la sauvegarde/chargement serveur et l’API**, placez le projet dans le dossier web de votre serveur PHP (ex : `htdocs` sous XAMPP, `www` sous WAMP/MAMP, ou sur un serveur distant).
2. **Démarrez votre serveur web avec PHP** (XAMPP, WAMP, MAMP, etc.).
3. **Accédez à l’application via l’URL locale** (ex : `http://localhost/Projet-Dnd-CNAM/index.html`).
4. **Personnalisez le plateau** via les fichiers de configuration ou l’interface graphique.
5. **Les images et ressources** sont dans le dossier `img/`.

---

## 📁 Structure des fichiers

| Fichier                  | Description                                         |
|--------------------------|-----------------------------------------------------|
| `index.html`             | Point d’entrée principal, structure de la page      |
| `script.js`              | Logique principale de l’application                 |
| `Board.js`               | Modèle du plateau, gestion de l’état                |
| `BoardElement.js`        | Représentation des éléments (pièces, cases, etc.)   |
| `BoardElementFactory.js` | Fabrique d’éléments du plateau                      |
| `BoardGraphic.js`        | Gestion de l’affichage graphique                    |
| `Observable.js`          | Implémentation du pattern Observer                  |
| `Command.js`             | Gestion des commandes (actions)                     |
| `boardstate.json`        | Sauvegarde de l’état du plateau                     |
| `styles.css`             | Styles de l’interface                               |
| `api/board.php`          | Fichier PHP pour la gestion serveur du plateau      |

---

## 🧠 Patrons de conception utilisés

### 🏭 1. **Factory Method**
- `BoardElementFactory` permet de créer dynamiquement différents types d’éléments du plateau.
- ➕ Ajout facile de nouveaux types de pièces sans modifier la logique principale.

### 👁️ 2. **Observer**
- `Observable` permet de notifier automatiquement la vue lors de changements d’état du modèle.
- ➕ Synchronisation efficace entre la logique et l’affichage.

### 🕹️ 3. **Command**
- `Command.js` encapsule les actions utilisateur (déplacement, suppression, etc.).

### 🔒 4. **Singleton**
- `Board` (dans `Board.js`) utilise le pattern Singleton pour garantir qu’il n’existe qu’une seule instance du plateau de jeu dans toute l’application.
- ➕ Cela centralise la gestion de l’état du plateau et évite les incohérences lors des interactions.
---

## 🛡️ Sécurité & Bonnes pratiques

- ✅ Validation des actions utilisateur (déplacements autorisés, options du menu contextuel).
- ✅ Persistance sécurisée de l’état (fichiers JSON, gestion des accès).
- ✅ Architecture modulaire pour faciliter la maintenance et l’évolution.

---

## 🧱 Principes SOLID appliqués

### 📌 S — Single Responsibility Principle
Chaque classe/fichier a une responsabilité unique :
- `Board` gère l’état du plateau,
- `BoardElement` la logique des pièces,
- `BoardGraphic` l’affichage,
- `Command` les actions utilisateur.

---

### 📌 O — Open/Closed Principle
Les classes sont **ouvertes à l’extension** (ajout de nouveaux types de pièces, de commandes, etc.) mais **fermées à la modification** :
- Ajoutez de nouveaux comportements via l’héritage ou la composition, sans toucher au code existant.

---

### 📌 L — Liskov Substitution Principle
Toutes les sous-classes de `BoardElement` peuvent être utilisées partout où un `BoardElement` est attendu, sans casser la logique.

---

## 📏 Autres principes de développement appliqués

### 💡 KISS – *Keep It Simple, Stupid*
- Code lisible, chaque fonction a une tâche claire.
- Pas de complexité inutile.

### 🔁 DRY – *Don’t Repeat Yourself*
- Comportements partagés centralisés (ex : gestion des événements, logique de déplacement).

### 🚫 YAGNI – *You Ain’t Gonna Need It*
- Aucune fonctionnalité superflue, le code reste proche des besoins réels.

---

## 🧩 Extensibilité

L’architecture permet d’ajouter facilement :
- De nouveaux types de pièces ou d’actions,
- Des règles de jeu supplémentaires,
- Des options dans le menu contextuel.

---

## 🌐 Intégration serveur (API PHP)

Pour la persistance avancée, la gestion multi-utilisateur ou l’intégration avec une base de données, le projet inclut une **API PHP** :

- Le dossier `api/` contient un script côté serveur, `board.php` pour la gestion du plateau.
- Pour utiliser l’API, il est nécessaire d’installer un **serveur web avec PHP** (ex : XAMPP, WAMP, MAMP, ou un serveur distant).
- Les appels AJAX du front-end peuvent interagir avec l’API pour sauvegarder, charger ou synchroniser l’état du plateau.

### Exemple d’utilisation de l’API

```http
POST /api/board.php
Content-Type: application/json

{
  "action": "save",
  "state": { ... }
}
```

---
