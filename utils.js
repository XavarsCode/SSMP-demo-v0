/* Fonctions utilitaires pour le projet MetroPulse */

/**
 * Calcule la distance en mètres entre deux points (Haversine)
 */
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + 
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Interpole la position entre deux points
 * @param {number} progress - Valeur entre 0 et 1
 */
function interpolatePosition(lat1, lng1, lat2, lng2, progress) {
    const lat = lat1 + (lat2 - lat1) * progress;
    const lng = lng1 + (lng2 - lng1) * progress;
    return { lat, lng };
}

/**
 * Formate l'heure en HH:MM
 */
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Convertit une heure en secondes depuis minuit
 */
function timeToSeconds(hours, minutes, seconds = 0) {
    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convertit les secondes en heures, minutes, secondes
 */
function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
}

/**
 * Génère un ID unique
 */
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

/**
 * Crée une couleur HSL à partir d'une valeur
 */
function hslColor(hue, saturation = 70, lightness = 50) {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Vérifie si une heure est dans la plage horaire du métro
 * (environ 5h30 à 1h du matin)
 */
function isMetroRunning(hour, minute = 0) {
    const totalMinutes = hour * 60 + minute;
    // De 5h30 (330 min) à 1h du matin (60 min du jour suivant = 1440 min)
    return totalMinutes >= 330 || totalMinutes < 60;
}

/**
 * Calcule le nombre de trains actifs à une heure donnée
 */
function getActiveTrainCount(hour, minute = 0) {
    if (!isMetroRunning(hour, minute)) return 0;
    
    // Trafic minimal tôt le matin et tard le soir
    if ((hour >= 5 && hour < 7) || (hour >= 22)) return 3;
    // Trafic réduit
    if ((hour >= 7 && hour < 9) || (hour >= 21 && hour < 22)) return 4;
    // Trafic normal
    if ((hour >= 9 && hour < 17)) return 5;
    // Trafic dense
    if ((hour >= 17 && hour < 21)) return 6;
    // Trafic réduit late evening
    return 3;
}

/**
 * Obtient les lignes actives à une heure donnée
 */
function getActiveLines(hour, minute = 0) {
    const activeCount = getActiveTrainCount(hour, minute);
    const allLines = Object.keys(METRO_LINES);
    return allLines.slice(0, Math.min(activeCount, allLines.length));
}

/**
 * Génère un numéro de train aléatoire
 */
function generateTrainNumber() {
    return Math.floor(Math.random() * 10000).toString().padStart(5, '0');
}

/**
 * Sélectionne aléatoirement un modèle de train
 */
function getRandomTrainModel() {
    const models = Object.keys(TRAIN_MODELS);
    return models[Math.floor(Math.random() * models.length)];
}

/**
 * Obtient un modèle de train compatible avec une ligne
 */
function getTrainModelForLine(lineId) {
    for (const [modelId, model] of Object.entries(TRAIN_MODELS)) {
        if (model.lines.includes(parseInt(lineId))) {
            return modelId;
        }
    }
    return getRandomTrainModel();
}

/**
 * Calcule le statut du trafic basé sur l'heure
 */
function getTrafficStatus(hour, minute = 0) {
    // Trafic normal en heures normales
    if ((hour >= 9 && hour < 18) || (hour >= 19 && hour < 20)) return 'normal';
    // Trafic ralenti en heures de pointe
    if ((hour >= 7 && hour < 9) || (hour >= 18 && hour < 19) || (hour >= 20 && hour < 21)) return 'slowed';
    // Trafic arrêté après minuit
    if (hour >= 1 && hour < 5) return 'stopped';
    return 'normal';
}

/**
 * Classe Logger pour déboguer facilement
 */
class Logger {
    constructor(prefix = 'MetroPulse') {
        this.prefix = prefix;
    }

    log(...args) {
        console.log(`[${this.prefix}]`, ...args);
    }

    warn(...args) {
        console.warn(`[${this.prefix}]`, ...args);
    }

    error(...args) {
        console.error(`[${this.prefix}]`, ...args);
    }

    info(...args) {
        console.info(`[${this.prefix}]`, ...args);
    }
}

const logger = new Logger('MetroPulse');
