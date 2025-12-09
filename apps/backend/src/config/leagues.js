"use strict";
/**
 * League Configuration
 * Maps league IDs to their metadata including logos, names, and countries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEAGUE_CONFIGS = void 0;
exports.getLeagueConfig = getLeagueConfig;
exports.getLeagueLogo = getLeagueLogo;
exports.getSupportedLeagueIds = getSupportedLeagueIds;
exports.isLeagueSupported = isLeagueSupported;
exports.LEAGUE_CONFIGS = {
    // England
    39: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024
    },
    40: {
        id: 40,
        name: 'Championship',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/40.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024
    },
    41: {
        id: 41,
        name: 'League One',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/41.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024
    },
    42: {
        id: 42,
        name: 'League Two',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/42.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024
    },
    // Spain
    140: {
        id: 140,
        name: 'La Liga',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/leagues/140.png',
        flag: 'https://media.api-sports.io/flags/es.svg',
        season: 2024
    },
    141: {
        id: 141,
        name: 'Segunda Division',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/leagues/141.png',
        flag: 'https://media.api-sports.io/flags/es.svg',
        season: 2024
    },
    // Germany
    78: {
        id: 78,
        name: 'Bundesliga',
        country: 'Germany',
        logo: 'https://media.api-sports.io/football/leagues/78.png',
        flag: 'https://media.api-sports.io/flags/de.svg',
        season: 2024
    },
    79: {
        id: 79,
        name: '2. Bundesliga',
        country: 'Germany',
        logo: 'https://media.api-sports.io/football/leagues/79.png',
        flag: 'https://media.api-sports.io/flags/de.svg',
        season: 2024
    },
    // Italy
    135: {
        id: 135,
        name: 'Serie A',
        country: 'Italy',
        logo: 'https://media.api-sports.io/football/leagues/135.png',
        flag: 'https://media.api-sports.io/flags/it.svg',
        season: 2024
    },
    136: {
        id: 136,
        name: 'Serie B',
        country: 'Italy',
        logo: 'https://media.api-sports.io/football/leagues/136.png',
        flag: 'https://media.api-sports.io/flags/it.svg',
        season: 2024
    },
    // France
    61: {
        id: 61,
        name: 'Ligue 1',
        country: 'France',
        logo: 'https://media.api-sports.io/football/leagues/61.png',
        flag: 'https://media.api-sports.io/flags/fr.svg',
        season: 2024
    },
    62: {
        id: 62,
        name: 'Ligue 2',
        country: 'France',
        logo: 'https://media.api-sports.io/football/leagues/62.png',
        flag: 'https://media.api-sports.io/flags/fr.svg',
        season: 2024
    },
    // Portugal
    94: {
        id: 94,
        name: 'Primeira Liga',
        country: 'Portugal',
        logo: 'https://media.api-sports.io/football/leagues/94.png',
        flag: 'https://media.api-sports.io/flags/pt.svg',
        season: 2024
    },
    // Netherlands
    88: {
        id: 88,
        name: 'Eredivisie',
        country: 'Netherlands',
        logo: 'https://media.api-sports.io/football/leagues/88.png',
        flag: 'https://media.api-sports.io/flags/nl.svg',
        season: 2024
    },
    // Belgium
    144: {
        id: 144,
        name: 'Jupiler Pro League',
        country: 'Belgium',
        logo: 'https://media.api-sports.io/football/leagues/144.png',
        flag: 'https://media.api-sports.io/flags/be.svg',
        season: 2024
    },
    // Turkey
    203: {
        id: 203,
        name: 'Super Lig',
        country: 'Turkey',
        logo: 'https://media.api-sports.io/football/leagues/203.png',
        flag: 'https://media.api-sports.io/flags/tr.svg',
        season: 2024
    },
    // Scotland
    179: {
        id: 179,
        name: 'Premiership',
        country: 'Scotland',
        logo: 'https://media.api-sports.io/football/leagues/179.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024
    },
    // Brazil
    71: {
        id: 71,
        name: 'Serie A',
        country: 'Brazil',
        logo: 'https://media.api-sports.io/football/leagues/71.png',
        flag: 'https://media.api-sports.io/flags/br.svg',
        season: 2024
    },
    // Argentina
    128: {
        id: 128,
        name: 'Liga Profesional',
        country: 'Argentina',
        logo: 'https://media.api-sports.io/football/leagues/128.png',
        flag: 'https://media.api-sports.io/flags/ar.svg',
        season: 2024
    },
    // USA
    253: {
        id: 253,
        name: 'MLS',
        country: 'USA',
        logo: 'https://media.api-sports.io/football/leagues/253.png',
        flag: 'https://media.api-sports.io/flags/us.svg',
        season: 2024
    },
    // Champions League
    2: {
        id: 2,
        name: 'UEFA Champions League',
        country: 'Europe',
        logo: 'https://media.api-sports.io/football/leagues/2.png',
        flag: 'https://media.api-sports.io/flags/eu.svg',
        season: 2024
    },
    // Europa League
    3: {
        id: 3,
        name: 'UEFA Europa League',
        country: 'Europe',
        logo: 'https://media.api-sports.io/football/leagues/3.png',
        flag: 'https://media.api-sports.io/flags/eu.svg',
        season: 2024
    },
    // Conference League
    848: {
        id: 848,
        name: 'UEFA Europa Conference League',
        country: 'Europe',
        logo: 'https://media.api-sports.io/football/leagues/848.png',
        flag: 'https://media.api-sports.io/flags/eu.svg',
        season: 2024
    },
    // FA Cup
    45: {
        id: 45,
        name: 'FA Cup',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/45.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024
    },
    // Copa del Rey
    143: {
        id: 143,
        name: 'Copa del Rey',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/leagues/143.png',
        flag: 'https://media.api-sports.io/flags/es.svg',
        season: 2024
    },
    // DFB Pokal
    81: {
        id: 81,
        name: 'DFB Pokal',
        country: 'Germany',
        logo: 'https://media.api-sports.io/football/leagues/81.png',
        flag: 'https://media.api-sports.io/flags/de.svg',
        season: 2024
    },
    // Coppa Italia
    137: {
        id: 137,
        name: 'Coppa Italia',
        country: 'Italy',
        logo: 'https://media.api-sports.io/football/leagues/137.png',
        flag: 'https://media.api-sports.io/flags/it.svg',
        season: 2024
    },
    // Coupe de France
    66: {
        id: 66,
        name: 'Coupe de France',
        country: 'France',
        logo: 'https://media.api-sports.io/football/leagues/66.png',
        flag: 'https://media.api-sports.io/flags/fr.svg',
        season: 2024
    },
};
/**
 * Get league configuration by ID
 */
function getLeagueConfig(leagueId) {
    return exports.LEAGUE_CONFIGS[leagueId] || null;
}
/**
 * Get league logo URL by ID
 */
function getLeagueLogo(leagueId) {
    var config = exports.LEAGUE_CONFIGS[leagueId];
    return config ? config.logo : null;
}
/**
 * Get all supported league IDs
 */
function getSupportedLeagueIds() {
    return Object.keys(exports.LEAGUE_CONFIGS).map(Number);
}
/**
 * Check if a league is supported
 */
function isLeagueSupported(leagueId) {
    return leagueId in exports.LEAGUE_CONFIGS;
}
