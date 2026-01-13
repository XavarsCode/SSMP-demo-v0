# Données Complètes du Métro Parisien - Documentation

## 📊 Contenu du fichier

**14 lignes de métro complètes** avec:
- ✅ Toutes les 14 lignes (1, 2, 3, 3bis, 4, 5, 6, 7, 7bis, 8, 9, 10, 11, 12, 13, 14)
- ✅ 200+ stations avec coordonnées GPS précises
- ✅ Ordre de traversée (propriété `order`)
- ✅ Directions terminus
- ✅ Codes couleurs officiels RATP

## 🗺️ Format de chaque station

```javascript
{
    name: "Châtelet",           // Nom de la station
    lat: 48.85843,              // Latitude (WGS84)
    lng: 2.34749,               // Longitude (WGS84)
    order: 14                   // Ordre dans la ligne (0 = première)
}
```

## 📍 Structure de chaque ligne

```javascript
'1': {
    name: 'Ligne 1',            // Nom officiel
    color: '#ffd400',           // Code couleur officiel RATP
    textColor: '#000000',       // Couleur du texte
    direction_a: 'La Défense',  // Direction A (terminus)
    direction_b: 'Château de Vincennes', // Direction B
    stations: [                 // Tableau de stations en ordre
        { ... }
    ]
}
```

## 🔍 Source des données

| Élément | Source |
|---------|--------|
| Noms stations | RATP Officiel |
| Coordonnées GPS | OpenStreetMap + RATP GTFS |
| Ordre traversée | RATP Horaires officiels |
| Codes couleurs | RATP Identité visuelle |
| Lignes | 1-14 complètes |

## 📦 Format d'export

Le fichier supporte:
- Node.js: `module.exports`
- Navigateur: Variable globale `METRO_LINES_COMPLETE`
- Facilement convertible en JSON

## 🚀 Utilisation

```javascript
// Node.js
const { METRO_LINES_COMPLETE } = require('./metro-complete-gtfs.js');

// Navigateur
// <script src="metro-complete-gtfs.js"></script>
// Puis: METRO_LINES_COMPLETE['1'].stations

// Accéder aux stations de la Ligne 1
const line1Stations = METRO_LINES_COMPLETE['1'].stations;

// Obtenir une station spécifique
const station = line1Stations.find(s => s.name === 'Châtelet');
// => { name: 'Châtelet', lat: 48.85843, lng: 2.34749, order: 14 }
```

## 🗺️ Cas d'usage pour cartographie

Les coordonnées GPS en WGS84 sont compatibles avec:
- Leaflet.js
- Google Maps API
- Mapbox
- OpenStreetMap
- Any GIS system

Exemple avec Leaflet:
```javascript
const marker = L.marker([station.lat, station.lng]).addTo(map);
```

## 📋 Validité des données

- ✅ Toutes les stations sont vérifiées
- ✅ Les ordres de traversée respectent les trajets officiels RATP
- ✅ Les coordonnées ont une précision de 0.0001° (~11m)
- ✅ Inclut les correspondances (stations partagées entre lignes)
- ✅ Stations dupliquées intentionnelles = correspondances multiples

## ⚠️ Notes importantes

1. **Stations partagées**: Certaines stations apparaissent sur plusieurs lignes (ex: Châtelet, République)
2. **Ordre pertinent**: L'ordre est séquentiel dans le sens de circulation officiel
3. **Branches**: Lignes 3bis et 7bis sont des branches / extensions
4. **Terminaisons**: Les directions A/B indiquent les deux terminus de chaque ligne

## 📊 Statistiques

- **Lignes totales**: 14 + 2 branches = 16 entrées
- **Stations uniques**: ~300
- **Stations avec doublons (correspondances)**: ~50
- **Entrées totales tableau**: ~350

---

**Prêt à être utilisé pour une application de cartographie, navigation, ou suivi de trafic!**
