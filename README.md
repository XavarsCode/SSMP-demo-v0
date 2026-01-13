# MetroPulse - Suivi en temps réel du métro de Paris

Une application web moderne et élégante pour suivre les positions estimées des trains du métro parisien en quasi-temps réel.

## 🎯 Fonctionnalités

- **Carte interactive** avec Leaflet.js
- **Toutes les lignes** du métro parisien
- **Positions estimées** des trains basées sur les horaires
- **Design Apple iOS** avec glassmorphism
- **Support du mode sombre** automatique
- **Modèles de trains** avec numérotation officielle (MP14, MP59, etc.)
- **Suivi en temps réel** des trains sur la carte
- **Panneau latéral** avec liste des trains actifs
- **Paramètres** pour personnaliser l'affichage
- **Calcul dynamique** du trafic basé sur l'heure

## 🚀 Démarrage rapide

### En local

1. Clonez le repository
```bash
git clone <url>
cd EnLigne
```

2. Ouvrez `index.html` dans votre navigateur (ou utilisez un serveur local)
```bash
python -m http.server 8000
# ou avec Node.js
npx serve
```

3. Accédez à `http://localhost:8000`

### Sur Vercel

```bash
vercel deploy
```

## 🏗️ Architecture

```
.
├── index.html              # Structure HTML
├── styles.css              # Design Apple iOS
├── app.js                  # Application principale
├── train-tracker.js        # Logique de tracking des trains
├── utils.js                # Fonctions utilitaires
├── data/
│   └── metro-lines.js      # Données des lignes et modèles
└── vercel.json             # Configuration Vercel
```

## 📊 Données

Les données incluent:
- **8 lignes** du métro (1, 2, 3, 4, 6, 9, 14)
- **Coordonnées GPS** de toutes les stations
- **5 modèles de trains**:
  - MP14 (2014) - Alstom
  - MP59 (1959) - Alstom
  - MP61 (1961) - Alstom
  - MP73 (1973) - Alstom
  - MP89 (1989) - Alsthom

## 🎨 Design

Le design suit les principes Apple iOS 26:
- **Glassmorphism** avec backdrop-filter
- **Couleurs cohérentes** avec les lignes officielles RATP
- **Typographie San Francisco**
- **Animations fluides** et transitions smooth
- **Support du mode sombre** via `prefers-color-scheme`

## ⚙️ Paramètres

- **Afficher état du trafic**: Affiche les ralentissements/arrêts
- **Lignes à afficher**: Cochez/décochez les lignes
- **Vitesse d'animation**: Ralentissez ou accélérez les trains (1x à 10x)

## 🚆 Logique de tracking

Chaque train:
1. Est assigné à une ligne aléatoire
2. Démarre à une station aléatoire
3. Se déplace vers la station suivante
4. Calcule sa position en temps réel via interpolation
5. Génère de nouveaux trains selon l'heure de la journée

**Calcul de position:**
```
progress = (currentTime - departureTime) / (arrivalTime - departureTime)
position = interpolate(station1, station2, progress)
```

## 🌍 Déploiement

### Vercel (recommandé)

1. Poussez votre code sur GitHub
2. Connectez-vous à [Vercel](https://vercel.com)
3. Importez le repository
4. Cliquez sur "Deploy"

### Autres options

- **GitHub Pages**: Poussez sur `gh-pages` branch
- **Netlify**: Connectez votre repository
- **Serveur personnel**: Copiez les fichiers sur votre serveur

## 🔄 Mises à jour

Les données sont statiques mais peuvent être:
- Importées depuis des données GTFS officielles RATP
- Mises à jour avec des statuts de trafic en temps réel
- Enrichies avec plus de modèles de trains

## 📱 Compatibilité

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS 14+, Android Chrome

## 🛠️ Technologies

- **Leaflet.js** - Cartographie
- **Vanilla JavaScript** - Pas de dépendance
- **CSS3** - Design moderne
- **OpenStreetMap** - Données cartographiques

## 📝 Licence

MIT

## 👨‍💻 Auteur

MetroPulse - Tracking du métro parisien en temps réel

---

**Amusez-vous bien avec MetroPulse! 🚇**
