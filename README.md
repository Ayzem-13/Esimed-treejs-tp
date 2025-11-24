# 🏙️ MicroVille - Projet Three.js
Le tp est dans la branch TP et le projet est dans la branch main


Un jeu de survie en 3D développé avec **Three.js** et **React**, où vous devez survivre aux vagues de zombies dans une ville moderne.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-r150-green)
![React](https://img.shields.io/badge/React-18-blue)

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Commandes du jeu](#-commandes-du-jeu)
- [Modes de jeu](#-modes-de-jeu)
- [Technologies utilisées](#-technologies-utilisées)

---

## ✨ Fonctionnalités

- 🎮 **Mode Joueur** : Survivez aux vagues de zombies
- 🛠️ **Mode Éditeur** : Créez et modifiez votre propre ville
- 🚗 **Véhicules** : Conduisez des voitures dans la ville
- 📝 **Système de quiz** : Répondez aux questions pour progresser
- 🏆 **Système de score** : Gagnez des points en éliminant les zombies
- 💚 **Barre de vie** : Surveillez votre santé
- 🌊 **Système de vagues** : Affrontez des vagues de plus en plus difficiles

---

## 🚀 Installation

### Prérequis

- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn**

### Étapes d'installation

1. **Cloner le projet**

   ```bash
   git clone <url-du-repo>
   cd Esimed-treejs-tp
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**

   ```bash
   npm run dev
   ```

   ou

   ```bash
   vite
   ```

4. **Ouvrir dans le navigateur**

   Le jeu sera accessible sur `http://localhost:5173`

### 🌿 Branches Git

Le projet utilise plusieurs branches pour organiser le développement :

| Branche    | Description                                                                          |
| ---------- | ------------------------------------------------------------------------------------ |
| **`main`** | 🚀 **Production** - Version stable et déployable du jeu                              |
| **`dev`**  | 🔧 **Développement** - Développement actif du jeu avec les nouvelles fonctionnalités |
| **`tp`**   | 📚 **TP** - Version pour les travaux pratiques et exercices                          |

**Pour changer de branche :**

```bash
# Passer sur la branche de développement
git checkout dev

# Passer sur la branche de production
git checkout main

# Passer sur la branche TP
git checkout tp
```

---

## 🎮 Commandes du jeu

### 🚶 Déplacements à pied

| Touche         | Action          |
| -------------- | --------------- |
| **Z** ou **↑** | Avancer         |
| **S** ou **↓** | Reculer         |
| **Q** ou **←** | Aller à gauche  |
| **D** ou **→** | Aller à droite  |
| **Espace**     | Sauter          |
| **Shift**      | Courir          |
| **Souris**     | Regarder autour |

### 🚗 Conduite de véhicule

| Touche         | Action             |
| -------------- | ------------------ |
| **Z** ou **↑** | Accélérer          |
| **S** ou **↓** | Freiner / Reculer  |
| **Q** ou **←** | Tourner à gauche   |
| **D** ou **→** | Tourner à droite   |
| **Espace**     | Frein à main       |
| **F**          | Sortir du véhicule |

### 🎯 Actions

| Touche          | Action                                              |
| --------------- | --------------------------------------------------- |
| **E**           | Interagir (entrer dans véhicule, répondre aux quiz) |
| **Clic gauche** | Tirer / Attaquer                                    |
| **R**           | Recharger                                           |
| **Échap**       | Menu pause                                          |

### 🛠️ Mode Éditeur

| Touche          | Action             |
| --------------- | ------------------ |
| **Clic gauche** | Placer un objet    |
| **Clic droit**  | Supprimer un objet |
| **Molette**     | Zoomer / Dézoomer  |
| **Souris**      | Déplacer la caméra |

---

## 🎯 Modes de jeu

### Mode Joueur

Survivez aux vagues de zombies qui deviennent de plus en plus difficiles :

- **Objectif** : Éliminer tous les zombies de chaque vague
- **Vagues** : Numérotées en chiffres romains (I, II, III, etc.)
- **Quiz** : Répondez correctement aux questions pour progresser
- **Game Over** : 3 mauvaises réponses ou santé à 0

### Mode Éditeur

Créez votre propre ville :

- Ajoutez des bâtiments
- Placez des véhicules
- Modifiez l'environnement
- Sauvegardez votre création

---

## 🛠️ Technologies utilisées

- **Three.js** - Moteur 3D
- **React** - Interface utilisateur
- **Vite** - Build tool
- **TailwindCSS** - Styles
- **GSAP** - Animations
- **Lucide React** - Icônes

---

## 📦 Structure du projet

```
Esimed-treejs-tp/
├── public/           # Assets publics (modèles 3D, textures)
├── src/
│   ├── components/   # Composants React
│   │   ├── screens/  # Écrans (Menu, Pause, GameOver, Victory)
│   │   └── ui/       # Composants UI (HUD, Score, Health, etc.)
│   ├── context/      # Context React (SceneContext)
│   ├── three/        # Logique Three.js
│   ├── App.jsx       # Composant principal
│   └── main.jsx      # Point d'entrée
├── package.json
└── README.md
```

---

## 🎨 Interface utilisateur

L'interface utilise le style **Mantine UI** avec :

- **Couleur principale** : `#242424` (gris foncé)
- **Couleur d'accent** : `#1a77cb` (bleu)
- **Design moderne** : Cartes glassmorphiques, bordures subtiles
- **Animations fluides** : Transitions GSAP

---

## 👥 Crédits

site asset utilise : https://poly.pizza/
