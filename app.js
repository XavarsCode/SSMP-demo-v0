/* Application principale MetroPulse */

class MetroPulseApp {
    constructor() {
        this.map = null;
        this.trainMarkers = {};
        this.stationMarkers = {};
        this.polylines = {};
        this.animationFrame = null;
        this.lastRenderTime = 0;
        this.renderInterval = 100; // ms
        
        this.init();
    }

    init() {
        this.initializeMap();
        this.setupEventListeners();
        this.drawLines();
        this.drawStations();
        this.startAnimation();
        this.updateTime();
        
        logger.log('Application initialisée');
    }

    initializeMap() {
        // Centrer sur Paris
        const parisCenter = [48.8566, 2.3522];
        
        this.map = L.map('map').setView(parisCenter, 12);
        
        // Couche cartographique OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
    }

    drawLines() {
        Object.entries(METRO_LINES).forEach(([lineId, lineData]) => {
            const coordinates = lineData.stations.map(s => [s.lat, s.lng]);
            
            const polyline = L.polyline(coordinates, {
                color: lineData.color,
                weight: 4,
                opacity: 0.7,
                className: `metro-line line-${lineId}`
            }).addTo(this.map);
            
            this.polylines[lineId] = polyline;
        });
    }

    drawStations() {
        Object.entries(METRO_LINES).forEach(([lineId, lineData]) => {
            lineData.stations.forEach((station, index) => {
                const stationKey = `${lineId}-${index}`;
                
                const circle = L.circleMarker([station.lat, station.lng], {
                    radius: 4,
                    fillColor: lineData.color,
                    color: '#fff',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.7,
                    className: `station station-${lineId}`
                }).addTo(this.map);
                
                circle.bindPopup(`
                    <div class="station-popup">
                        <strong>${station.name}</strong><br>
                        Ligne ${lineId}
                    </div>
                `);
                
                this.stationMarkers[stationKey] = circle;
            });
        });
    }

    updateTrainMarkers() {
        const visibleTrains = trainTracker.getVisibleTrains();
        
        // Mettre à jour les marqueurs existants
        visibleTrains.forEach(train => {
            const position = train.getCurrentPosition();
            if (!position) return;
            
            const markerKey = train.id;
            const lineData = METRO_LINES[train.lineId];
            
            if (this.trainMarkers[markerKey]) {
                // Mettre à jour la position
                this.trainMarkers[markerKey].setLatLng([position.lat, position.lng]);
            } else {
                // Créer un nouveau marqueur
                const modelData = TRAIN_MODELS[train.model];
                const popup = this.createTrainPopup(train);
                
                const marker = L.marker([position.lat, position.lng], {
                    icon: L.divIcon({
                        className: `train-marker line-${train.lineId}`,
                        html: `
                            <div class="train-icon" style="background-color: ${lineData.color}; color: ${lineData.textColor};">
                                ${train.trainNumber}
                            </div>
                        `,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                    })
                }).addTo(this.map);
                
                marker.bindPopup(popup);
                this.trainMarkers[markerKey] = marker;
            }
        });
        
        // Supprimer les marqueurs des trains qui ne sont plus visibles
        Object.keys(this.trainMarkers).forEach(markerKey => {
            const stillExists = visibleTrains.some(t => t.id === markerKey);
            if (!stillExists) {
                this.map.removeLayer(this.trainMarkers[markerKey]);
                delete this.trainMarkers[markerKey];
            }
        });
    }

    createTrainPopup(train) {
        const info = train.getInfo();
        const modelData = TRAIN_MODELS[train.model] || {};
        
        return `
            <div class="train-popup">
                <strong>Train ${info.number}</strong><br>
                <small>Modèle: ${modelData.name || 'Inconnu'}</small><br>
                <hr>
                <strong>Ligne ${info.line}</strong> ${info.lineName}<br>
                <strong>Actuellement à:</strong> ${info.currentStation}<br>
                <strong>Prochaine:</strong> ${info.nextStation || 'Fin de ligne'}<br>
                <strong>Progrès:</strong> ${info.progress}%
            </div>
        `;
    }

    updateSidebar() {
        const visibleTrains = trainTracker.getVisibleTrains().slice(0, 20);
        const trainsList = document.getElementById('trainsList');
        const trainCount = document.getElementById('trainCount');
        
        trainCount.textContent = visibleTrains.length;
        
        if (visibleTrains.length === 0) {
            trainsList.innerHTML = '<div class="train-item empty">Aucun train en circulation</div>';
            return;
        }
        
        trainsList.innerHTML = visibleTrains.map(train => {
            const info = train.getInfo();
            const lineData = METRO_LINES[train.lineId];
            const modelData = TRAIN_MODELS[train.model];
            
            return `
                <div class="train-item" style="border-left-color: ${lineData.color}" data-train-id="${train.id}">
                    <div class="train-icon" style="background-color: ${lineData.color}; color: ${lineData.textColor};">
                        ${train.trainNumber}
                    </div>
                    <div class="train-info">
                        <div class="train-line">Ligne ${train.lineId}</div>
                        <div class="train-model">${modelData.name}</div>
                        <div class="train-station">📍 ${info.currentStation}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Ajouter les event listeners
        document.querySelectorAll('.train-item[data-train-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                const trainId = e.currentTarget.dataset.trainId;
                const train = trainTracker.trains.find(t => t.id === trainId);
                if (train) {
                    const marker = this.trainMarkers[trainId];
                    if (marker) {
                        this.map.setView(marker.getLatLng(), 15);
                        marker.openPopup();
                    }
                }
            });
        });
    }

    updateTime() {
        const now = new Date();
        document.getElementById('timeDisplay').textContent = formatTime(now);
    }

    startAnimation() {
        const animate = () => {
            const now = Date.now();
            
            if (now - this.lastRenderTime >= this.renderInterval) {
                const currentTime = Date.now();
                
                // Mettre à jour les trains
                trainTracker.updateTrains(currentTime);
                
                // Mettre à jour les marqueurs
                this.updateTrainMarkers();
                
                // Mettre à jour la barre latérale
                this.updateSidebar();
                
                // Mettre à jour l'heure
                this.updateTime();
                
                this.lastRenderTime = now;
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    setupEventListeners() {
        // Bouton paramètres
        document.getElementById('toggleSettings').addEventListener('click', () => {
            const panel = document.getElementById('settingsPanel');
            panel.classList.toggle('active');
        });
        
        // Fermer le panneau
        document.getElementById('closeSettings').addEventListener('click', () => {
            document.getElementById('settingsPanel').classList.remove('active');
        });
        
        // Affichage du trafic
        document.getElementById('toggleTraffic').addEventListener('change', (e) => {
            logger.log('Affichage du trafic:', e.target.checked);
        });
        
        // Vitesse d'animation
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            trainTracker.speedMultiplier = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value + 'x';
        });
        
        // Checkboxes des lignes
        const linesContainer = document.getElementById('linesCheckboxes');
        Object.entries(METRO_LINES).forEach(([lineId, lineData]) => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.value = lineId;
            checkbox.addEventListener('change', (e) => {
                trainTracker.toggleLine(lineId);
                logger.log('Ligne', lineId, 'toggled:', e.target.checked);
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` Ligne ${lineId}`));
            label.style.borderColor = lineData.color;
            linesContainer.appendChild(label);
        });
        
        // Fermer le panneau en cliquant en dehors
        document.getElementById('settingsPanel').addEventListener('click', (e) => {
            if (e.target.id === 'settingsPanel') {
                e.currentTarget.classList.remove('active');
            }
        });
    }

    startSimulation() {
        // Générer les premiers trains
        trainTracker.generateTrains(8);
        logger.log('Simulation démarrée avec', trainTracker.trains.length, 'trains');
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialiser l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new MetroPulseApp();
    app.startSimulation();
    
    // Exposer l'app globalement pour déboguer
    window.metropulse = {
        app,
        trainTracker,
        METRO_LINES,
        TRAIN_MODELS
    };
});
