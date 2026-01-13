/* Système de tracking des trains pour MetroPulse */

class Train {
    constructor(lineId, stationStart, stationEnd, trainNumber, model) {
        this.id = generateId();
        this.lineId = lineId;
        this.trainNumber = trainNumber;
        this.model = model;
        this.stationStart = stationStart;
        this.stationEnd = stationEnd;
        this.currentSegmentIndex = stationStart;
        this.progress = 0; // 0 à 1
        this.status = 'running'; // running, stopped, waiting
        this.createdAt = Date.now();
        
        // Temps de trajet entre les stations (en secondes)
        this.travelTime = 60; // Par défaut 1 minute
        this.startTime = Date.now();
        this.endTime = this.startTime + (this.travelTime * 1000);
    }

    getCurrentPosition() {
        const line = METRO_LINES[this.lineId];
        if (!line || !line.stations[this.currentSegmentIndex]) {
            return null;
        }

        const currentStation = line.stations[this.currentSegmentIndex];
        const nextStation = line.stations[this.currentSegmentIndex + 1];

        if (!nextStation) {
            return currentStation; // Dernière station
        }

        // Interpoler la position basée sur le progrès
        const position = interpolatePosition(
            currentStation.lat,
            currentStation.lng,
            nextStation.lat,
            nextStation.lng,
            this.progress
        );

        return position;
    }

    getCurrentStationName() {
        const line = METRO_LINES[this.lineId];
        if (!line || !line.stations[this.currentSegmentIndex]) {
            return 'Unknown';
        }
        return line.stations[this.currentSegmentIndex].name;
    }

    getNextStationName() {
        const line = METRO_LINES[this.lineId];
        if (!line || !line.stations[this.currentSegmentIndex + 1]) {
            return null;
        }
        return line.stations[this.currentSegmentIndex + 1].name;
    }

    update(currentTime, trafficMultiplier = 1) {
        if (this.status === 'stopped') return;

        const elapsed = (currentTime - this.startTime) / 1000; // en secondes
        const adjustedTravelTime = this.travelTime * trafficMultiplier;

        if (elapsed >= adjustedTravelTime) {
            // Passer à la station suivante
            this.currentSegmentIndex++;
            const line = METRO_LINES[this.lineId];

            if (this.currentSegmentIndex >= line.stations.length - 1) {
                // Fin de ligne
                this.status = 'stopped';
                this.progress = 1;
                return;
            }

            this.startTime = currentTime;
            this.endTime = currentTime + (adjustedTravelTime * 1000);
            this.progress = 0;
        } else {
            this.progress = elapsed / adjustedTravelTime;
        }
    }

    getInfo() {
        const modelData = TRAIN_MODELS[this.model] || {};
        return {
            id: this.id,
            number: this.trainNumber,
            model: this.model,
            modelName: modelData.name || 'Inconnu',
            line: this.lineId,
            lineName: METRO_LINES[this.lineId]?.name || 'Ligne inconnue',
            currentStation: this.getCurrentStationName(),
            nextStation: this.getNextStationName(),
            progress: Math.round(this.progress * 100),
            position: this.getCurrentPosition(),
            status: this.status
        };
    }
}

class TrainTracker {
    constructor() {
        this.trains = [];
        this.visibleLines = new Set(Object.keys(METRO_LINES));
        this.trafficStatus = {};
        this.updateInterval = 1000; // ms
        this.speedMultiplier = 1;
        this.lastUpdateTime = Date.now();
        
        // Initialiser le statut du trafic pour chaque ligne
        Object.keys(METRO_LINES).forEach(lineId => {
            this.trafficStatus[lineId] = 'normal';
        });
    }

    addTrain(lineId, trainNumber = null, model = null) {
        if (!METRO_LINES[lineId] || METRO_LINES[lineId].stations.length < 2) {
            return null;
        }

        const line = METRO_LINES[lineId];
        const stationStart = Math.floor(Math.random() * (line.stations.length - 2));
        const stationEnd = line.stations.length - 1;
        const number = trainNumber || generateTrainNumber();
        const trainModel = model || getTrainModelForLine(lineId);

        const train = new Train(lineId, stationStart, stationEnd, number, trainModel);
        this.trains.push(train);
        return train;
    }

    generateTrains(targetCount = 10) {
        const activeLines = Object.keys(METRO_LINES);
        
        while (this.trains.length < targetCount) {
            const randomLine = activeLines[Math.floor(Math.random() * activeLines.length)];
            this.addTrain(randomLine);
        }
    }

    removeTrain(trainId) {
        this.trains = this.trains.filter(train => train.id !== trainId);
    }

    removeStoppedTrains() {
        this.trains = this.trains.filter(train => train.status !== 'stopped');
    }

    updateTrains(currentTime = Date.now()) {
        this.trains.forEach(train => {
            if (this.visibleLines.has(train.lineId)) {
                const trafficMultiplier = TRAFFIC_STATUS[this.trafficStatus[train.lineId]]?.speedMultiplier || 1;
                train.update(currentTime, trafficMultiplier * this.speedMultiplier);
            }
        });

        // Générer de nouveaux trains si nécessaire
        const currentHour = new Date(currentTime).getHours();
        const targetCount = getActiveTrainCount(currentHour);
        
        if (this.trains.length < targetCount) {
            this.generateTrains(Math.max(targetCount, 5));
        }

        // Nettoyer les trains arrêtés
        if (Math.random() > 0.9) {
            this.removeStoppedTrains();
        }
    }

    getVisibleTrains() {
        return this.trains.filter(train => {
            return this.visibleLines.has(train.lineId) && train.status !== 'stopped';
        });
    }

    setVisibleLines(lineIds) {
        this.visibleLines = new Set(lineIds);
    }

    toggleLine(lineId) {
        if (this.visibleLines.has(lineId)) {
            this.visibleLines.delete(lineId);
        } else {
            this.visibleLines.add(lineId);
        }
    }

    setTrafficStatus(lineId, status) {
        if (TRAFFIC_STATUS[status]) {
            this.trafficStatus[lineId] = status;
        }
    }

    getStatistics() {
        const lineStats = {};
        Object.keys(METRO_LINES).forEach(lineId => {
            lineStats[lineId] = {
                line: METRO_LINES[lineId].name,
                trains: this.trains.filter(t => t.lineId === lineId).length,
                traffic: this.trafficStatus[lineId],
                visible: this.visibleLines.has(lineId)
            };
        });

        return {
            totalTrains: this.trains.length,
            activeTrains: this.getVisibleTrains().length,
            visibleLines: this.visibleLines.size,
            lineStats
        };
    }
}

const trainTracker = new TrainTracker();
