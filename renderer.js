// Pixel-Art Retro Character Renderer for Ki Clash
// Generates authentic Super-Deformed (SD) retro fighter sprites procedural pixel matrices

class FighterRenderer {
    constructor() {
        this.cache = new Map();
    }

    // 32 Iconic Retro Anime Fighters
    static CHARACTERS = {
        goku: {
            name: 'GOKU',
            title: 'Earth Hero',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'wild_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#ff5500',
            giUndershirt: '#0033aa',
            beltColor: '#0033aa',
            wristColor: '#0033aa',
            bootsColor: '#0033aa',
            auraColor: '#00e1ff',
            specialName: 'KAMEHAMEHA',
            beamColor: '#00e1ff',
            beamCore: '#ffffff'
        },
        vegeta: {
            name: 'VEGETA',
            title: 'Saiyan Prince',
            hairColor: '#121218',
            hairHighlight: '#252636',
            hairType: 'flame_tall',
            skinColor: '#ffd1a4',
            skinShade: '#e5a578',
            giColor: '#0c2266',
            armorChest: '#f0f0e8',
            armorStrap: '#c59420',
            beltColor: '#c59420',
            wristColor: '#ffffff',
            bootsColor: '#ffffff',
            auraColor: '#b400ff',
            specialName: 'GALICK GUN',
            beamColor: '#b400ff',
            beamCore: '#ffffff'
        },
        gohan: {
            name: 'GOHAN (SSJ2)',
            title: 'Hidden Potential',
            hairColor: '#ffe600',
            hairHighlight: '#fff899',
            hairType: 'ssj_gohan',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#531b7a',
            giUndershirt: null,
            beltColor: '#c91e1e',
            wristColor: '#c91e1e',
            bootsColor: '#966028',
            auraColor: '#ffe600',
            specialName: 'MASENKO',
            beamColor: '#ffe600',
            beamCore: '#ffffff'
        },
        trunks: {
            name: 'TRUNKS',
            title: 'Future Warrior',
            hairColor: '#9c7cb8',
            hairHighlight: '#c2a8dc',
            hairType: 'trunks_parted',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#1f2026',
            jacketColor: '#2b3a6b',
            beltColor: '#d69e2e',
            wristColor: '#1f2026',
            bootsColor: '#c9a13b',
            auraColor: '#ffe600',
            specialName: 'BURNING ATTACK',
            beamColor: '#ff9900',
            beamCore: '#fff8a6'
        },
        piccolo: {
            name: 'PICCOLO',
            title: 'Namekian Master',
            hairColor: null,
            hairType: 'namek_turban',
            skinColor: '#54b848',
            skinShade: '#388a2e',
            giColor: '#4d1e70',
            beltColor: '#45b8eb',
            wristColor: '#d62432',
            bootsColor: '#966028',
            auraColor: '#ffe600',
            specialName: 'SPECIAL BEAM',
            beamColor: '#ffe600',
            beamCore: '#ff2255'
        },
        krillin: {
            name: 'KRILLIN',
            title: 'Earth Brave',
            hairColor: null,
            hairType: 'krillin_bald',
            skinColor: '#ffd1a4',
            skinShade: '#e0a070',
            giColor: '#ff5500',
            giUndershirt: '#0033aa',
            beltColor: '#0033aa',
            wristColor: '#0033aa',
            bootsColor: '#0033aa',
            auraColor: '#ffffff',
            specialName: 'KIEZAN DISC',
            beamColor: '#fff200',
            beamCore: '#ffffff'
        },
        frieza: {
            name: 'FRIEZA',
            title: 'Galactic Emperor',
            hairColor: null,
            hairType: 'frieza_head',
            skinColor: '#e8e8f8',
            skinShade: '#b8b8d0',
            giColor: '#6f199e',
            beltColor: '#6f199e',
            wristColor: '#6f199e',
            bootsColor: '#6f199e',
            auraColor: '#ff0055',
            specialName: 'DEATH BEAM',
            beamColor: '#ff0066',
            beamCore: '#ffffff'
        },
        cell: {
            name: 'CELL',
            title: 'Perfect Being',
            hairColor: null,
            hairType: 'cell_crown',
            skinColor: '#46a33f',
            skinShade: '#2f7529',
            giColor: '#181a18',
            beltColor: '#45b8eb',
            wristColor: '#181a18',
            bootsColor: '#c59420',
            auraColor: '#ffe600',
            specialName: 'PERFECT BEAM',
            beamColor: '#00e1ff',
            beamCore: '#ffea00'
        },
        buu: {
            name: 'MAJIN BUU',
            title: 'Ancient Terror',
            hairColor: null,
            hairType: 'buu_head',
            skinColor: '#ff77aa',
            skinShade: '#d64d80',
            giColor: '#f5f5f5',
            vestColor: '#18181f',
            beltColor: '#d69e2e',
            wristColor: '#d69e2e',
            bootsColor: '#7a4214',
            auraColor: '#ff3399',
            specialName: 'VANISHING BALL',
            beamColor: '#ff3399',
            beamCore: '#ffffff'
        },
        broly: {
            name: 'BROLY',
            title: 'Legendary Saiyan',
            hairColor: '#96ff00',
            hairHighlight: '#d4ff80',
            hairType: 'broly_wild',
            skinColor: '#ffd1a4',
            skinShade: '#e5a578',
            giColor: '#e0f0f5',
            beltColor: '#b81424',
            wristColor: '#d4af37',
            bootsColor: '#1f2026',
            auraColor: '#39ff14',
            specialName: 'ERASER CANNON',
            beamColor: '#39ff14',
            beamCore: '#ffffff'
        },
        black: {
            name: 'GOKU BLACK',
            title: 'Divine Rose',
            hairColor: '#ff77a8',
            hairHighlight: '#ffa6c7',
            hairType: 'black_rose',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#2b2b30',
            giUndershirt: '#151518',
            beltColor: '#b81424',
            wristColor: '#151518',
            bootsColor: '#ffffff',
            auraColor: '#9900ee',
            specialName: 'BLACK KAMEHA',
            beamColor: '#b800e6',
            beamCore: '#ff66cc'
        },
        beerus: {
            name: 'BEERUS',
            title: 'Destruction God',
            hairColor: null,
            hairType: 'beerus_cat',
            skinColor: '#926bb5',
            skinShade: '#724e94',
            giColor: '#141724',
            collarColor: '#258f9c',
            beltColor: '#258f9c',
            wristColor: '#d4af37',
            bootsColor: '#8a4b1f',
            auraColor: '#ff4500',
            specialName: 'HAKAI BEAM',
            beamColor: '#ff4500',
            beamCore: '#7a00ff'
        },
        vegito: {
            name: 'VEGITO',
            title: 'Ultimate Potara',
            hairColor: '#1a1820',
            hairHighlight: '#3c354a',
            hairType: 'vegito_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#08338f',
            giUndershirt: '#ff5500',
            beltColor: '#08338f',
            wristColor: '#ffffff',
            bootsColor: '#ffffff',
            auraColor: '#00ffff',
            specialName: 'FINAL KAMEHA',
            beamColor: '#00ffff',
            beamCore: '#ffee00'
        },
        gogeta: {
            name: 'GOGETA',
            title: 'Fusion Supreme',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'gogeta_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#ffffff',
            vestColor: '#18181f',
            paddingColor: '#ff8800',
            beltColor: '#00ccff',
            wristColor: '#18181f',
            bootsColor: '#18181f',
            auraColor: '#00e5ff',
            specialName: 'BIG BANG BEAM',
            beamColor: '#00e5ff',
            beamCore: '#ffffff'
        },
        bardock: {
            name: 'BARDOCK',
            title: 'Lone Rebel',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'bardock_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#151518',
            armorChest: '#184724',
            armorStrap: '#40994d',
            beltColor: '#151518',
            wristColor: '#b81424',
            bootsColor: '#184724',
            auraColor: '#0066ff',
            specialName: 'SPIRIT CANNON',
            beamColor: '#0066ff',
            beamCore: '#ffffff'
        },
        a18: {
            name: 'ANDROID 18',
            title: 'Infinite Power',
            hairColor: '#ffd700',
            hairHighlight: '#fff8a6',
            hairType: 'a18_bob',
            skinColor: '#ffe0bd',
            skinShade: '#e8be99',
            giColor: '#1f253d',
            giUndershirt: '#111111',
            beltColor: '#7a5230',
            wristColor: '#ffe0bd',
            bootsColor: '#7a5230',
            auraColor: '#ffd700',
            specialName: 'INFINITY WAVE',
            beamColor: '#ffe600',
            beamCore: '#ffffff'
        },
        // 16 NEW FIGHTERS (TOTAL 32)
        goku_ui: {
            name: 'GOKU (U.I.)',
            title: 'Ultra Instinct',
            hairColor: '#e0e8f0',     // Silver hair
            hairHighlight: '#ffffff',
            hairType: 'wild_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#0c1b40',       // Dark blue torn gi pants
            giUndershirt: null,
            beltColor: '#0033aa',
            wristColor: '#0033aa',
            bootsColor: '#0033aa',
            auraColor: '#ffffff',     // Silvery galaxy aura
            specialName: 'DIVINE KAMEHA',
            beamColor: '#e6f7ff',
            beamCore: '#ffffff'
        },
        vegeta_ue: {
            name: 'VEGETA (U.E.)',
            title: 'Ultra Ego',
            hairColor: '#6f199e',     // Dark purple flame
            hairHighlight: '#9b30d9',
            hairType: 'flame_tall',
            skinColor: '#ffd1a4',
            skinShade: '#e5a578',
            giColor: '#0c1a40',
            armorChest: '#2c133b',    // Dark purple destruction vest
            armorStrap: '#9b30d9',
            beltColor: '#9b30d9',
            wristColor: '#ffffff',
            bootsColor: '#ffffff',
            auraColor: '#7a00cc',
            specialName: 'HAKAI FLASH',
            beamColor: '#7a00cc',
            beamCore: '#ff00aa'
        },
        gohan_beast: {
            name: 'GOHAN BEAST',
            title: 'Awakened Beast',
            hairColor: '#d9e2ec',     // Huge silver spike
            hairHighlight: '#ffffff',
            hairType: 'beast_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#531b7a',
            beltColor: '#c91e1e',
            wristColor: '#c91e1e',
            bootsColor: '#966028',
            auraColor: '#ff0033',     // Crimson/purple aura
            specialName: 'BEAST CANNON',
            beamColor: '#ff0033',
            beamCore: '#ffffff'
        },
        jiren: {
            name: 'JIREN',
            title: 'The Invicible',
            hairColor: null,
            hairType: 'jiren_head',
            skinColor: '#c8cbd9',     // Grey alien
            skinShade: '#a4a8bc',
            giColor: '#121214',       // Pride trooper black/red suit
            armorChest: '#d11b27',    // Red chest
            beltColor: '#121214',
            wristColor: '#ffffff',    // White gloves
            bootsColor: '#ffffff',    // White boots
            auraColor: '#ff2200',     // Fiery red aura
            specialName: 'POWER IMPACT',
            beamColor: '#ff1a00',
            beamCore: '#ffea00'
        },
        hit: {
            name: 'HIT',
            title: 'Time Assassin',
            hairColor: null,
            hairType: 'hit_head',
            skinColor: '#7d52a8',     // Purple alien
            skinShade: '#5d3882',
            giColor: '#2b233d',       // Long trenchcoat
            beltColor: '#45b8eb',
            wristColor: '#1b1726',
            bootsColor: '#1b1726',
            auraColor: '#00f0ff',     // Time-skip blue/cyan aura
            specialName: 'FLASH FIST',
            beamColor: '#00e1ff',
            beamCore: '#b800ff'
        },
        raditz: {
            name: 'RADITZ',
            title: 'Saiyan Invader',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'raditz_mane',  // Giant mane past waist
            skinColor: '#ffd1a4',
            skinShade: '#e5a578',
            giColor: '#151518',
            armorChest: '#4d3d22',    // Brown armor
            armorStrap: '#151518',
            beltColor: '#151518',
            wristColor: '#4d3d22',
            bootsColor: '#4d3d22',
            scouter: '#11ff33',       // Green scouter
            auraColor: '#ff00aa',
            specialName: 'DOUBLE SUNDAY',
            beamColor: '#ff00aa',
            beamCore: '#ffffff'
        },
        nappa: {
            name: 'NAPPA',
            title: 'Saiyan Giant',
            hairColor: null,
            hairType: 'nappa_bald',   // Bald with mustache
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#151518',
            armorChest: '#54462b',
            armorStrap: '#151518',
            beltColor: '#151518',
            wristColor: '#54462b',
            bootsColor: '#54462b',
            scouter: '#3388ff',       // Blue scouter
            auraColor: '#ffe600',
            specialName: 'BREAK CANNON',
            beamColor: '#ffe600',
            beamCore: '#ffffff'
        },
        yamcha: {
            name: 'YAMCHA',
            title: 'Desert Bandit',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'yamcha_hair',  // Long spiky mullet with scars
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#ff5500',
            giUndershirt: '#0033aa',
            beltColor: '#0033aa',
            wristColor: '#0033aa',
            bootsColor: '#0033aa',
            auraColor: '#ffffff',
            specialName: 'SOKIDAN BALL',
            beamColor: '#ffaa00',
            beamCore: '#ffffff'
        },
        tien: {
            name: 'TIEN',
            title: 'Crane Hermit',
            hairColor: null,
            hairType: 'tien_head',    // 3 Eyes, bald
            skinColor: '#ffd1a4',
            skinShade: '#e0a070',
            giColor: '#2b7835',       // Green gi pants
            giUndershirt: null,       // Bare chest
            beltColor: '#b81424',     // Red sash
            wristColor: '#2b7835',
            bootsColor: '#ffd1a4',
            auraColor: '#ffffff',
            specialName: 'TRI-BEAM',
            beamColor: '#ffe600',
            beamCore: '#ffffff'
        },
        ginyu: {
            name: 'GINYU',
            title: 'Special Force',
            hairColor: null,
            hairType: 'ginyu_horns',  // Horns & purple ridged head
            skinColor: '#8a40a8',
            skinShade: '#672882',
            giColor: '#151518',
            armorChest: '#f0f0e8',    // White Ginyu armor
            armorStrap: '#45b8eb',
            beltColor: '#151518',
            wristColor: '#f0f0e8',
            bootsColor: '#f0f0e8',
            scouter: '#11ff33',
            auraColor: '#b400ff',
            specialName: 'MILKY CANNON',
            beamColor: '#b400ff',
            beamCore: '#00e1ff'
        },
        cooler: {
            name: 'COOLER',
            title: 'Coldest Brother',
            hairColor: null,
            hairType: 'cooler_mask',  // 4 Head crests & mouth mask
            skinColor: '#6f199e',
            skinShade: '#4c0f6e',
            giColor: '#e8e8f8',       // Heavy white armor carapace
            beltColor: '#6f199e',
            wristColor: '#e8e8f8',
            bootsColor: '#e8e8f8',
            auraColor: '#ff2200',
            specialName: 'SUPERNOVA',
            beamColor: '#ff3300',
            beamCore: '#ffea00'
        },
        janemba: {
            name: 'JANEMBA',
            title: 'Pure Evil',
            hairColor: null,
            hairType: 'janemba_horns',// Curved demon horns
            skinColor: '#d61e38',     // Red demon
            skinShade: '#9e1125',
            giColor: '#6f199e',       // Purple carapace
            beltColor: '#6f199e',
            wristColor: '#6f199e',
            bootsColor: '#6f199e',
            auraColor: '#ff0033',
            specialName: 'DIMENSION CUT',
            beamColor: '#ff0033',
            beamCore: '#ffffff'
        },
        gotenks: {
            name: 'GOTENKS (SSJ3)',
            title: 'Grim Reaper',
            hairColor: '#ffe600',
            hairHighlight: '#fff899',
            hairType: 'ssj3_long',    // Long golden hair down to knees
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#ffffff',
            vestColor: '#18181f',
            paddingColor: '#45b8eb',  // Cyan padding
            beltColor: '#00ccff',
            wristColor: '#18181f',
            bootsColor: '#18181f',
            auraColor: '#ffe600',
            specialName: 'GHOST CANNON',
            beamColor: '#00ffcc',
            beamCore: '#ffffff'
        },
        a17: {
            name: 'ANDROID 17',
            title: 'Nature Ranger',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'a17_hair',     // Straight black bob + orange scarf
            skinColor: '#ffe0bd',
            skinShade: '#e8be99',
            giColor: '#2b3652',       // Blue jeans
            giUndershirt: '#151518',  // Black shirt with white long sleeves
            beltColor: '#7a5230',
            wristColor: '#ffe0bd',
            bootsColor: '#228ba8',    // Blue shoes
            auraColor: '#00e1ff',
            specialName: 'BARRIER BLITZ',
            beamColor: '#00ff88',
            beamCore: '#ffffff'
        },
        a16: {
            name: 'ANDROID 16',
            title: 'Gentle Giant',
            hairColor: '#ff6600',     // Orange mohawk
            hairHighlight: '#ff9933',
            hairType: 'a16_mohawk',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#151518',       // Black undersuit
            armorChest: '#2e6b35',    // Green armor vest with RR logo
            armorStrap: '#4ca857',
            beltColor: '#151518',
            wristColor: '#2e6b35',
            bootsColor: '#2e6b35',
            auraColor: '#ff6600',
            specialName: 'HELL\'S FLASH',
            beamColor: '#ff5500',
            beamCore: '#ffff00'
        },
        roshi: {
            name: 'MASTER ROSHI',
            title: 'Turtle Master',
            hairColor: null,
            hairType: 'roshi_buff',   // Bald buff old man, beard & sunglasses
            skinColor: '#ffd1a4',
            skinShade: '#e0a070',
            giColor: '#1c1b18',       // Black pants
            giUndershirt: null,       // Muscle bare chest
            beltColor: '#d69e2e',
            wristColor: '#1c1b18',
            bootsColor: '#1c1b18',
            auraColor: '#00e1ff',
            specialName: 'MAX KAMEHA',
            beamColor: '#00e1ff',
            beamCore: '#ffffff'
        },
        kid_goku: {
            name: 'KID GOKU',
            title: 'Dragon Ball Kid',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'wild_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#1a53b8',        // Classic blue gi
            giUndershirt: null,
            beltColor: '#ffffff',      // White sash
            wristColor: '#d62432',     // Red wristbands
            bootsColor: '#111115',
            tail: true,
            auraColor: '#00e1ff',
            specialName: 'POWER POLE',
            beamColor: '#ff2200',
            beamCore: '#ffffff'
        },
        tao: {
            name: 'MERCENARY TAO',
            title: 'Crane Assassin',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'tao_braid',
            skinColor: '#ffd1a4',
            skinShade: '#e0a070',
            giColor: '#e0539c',        // Pink changshan
            giUndershirt: '#151518',
            beltColor: '#151518',
            wristColor: '#ffffff',
            bootsColor: '#151518',
            auraColor: '#ff8800',
            specialName: 'DODON RAY',
            beamColor: '#ff9900',
            beamCore: '#ffffff'
        },
        king_piccolo: {
            name: 'KING PICCOLO',
            title: 'Demon King',
            hairColor: null,
            hairType: 'demon_king_head',
            skinColor: '#459938',
            skinShade: '#2c6d22',
            giColor: '#181b30',        // Navy demon robe
            beltColor: '#c91e1e',
            wristColor: '#c91e1e',
            bootsColor: '#8a4b1f',
            auraColor: '#b400ff',
            specialName: 'DEMON EXPLODE',
            beamColor: '#b400ff',
            beamCore: '#ffffff'
        },
        recoome: {
            name: 'RECOOME',
            title: 'Ginyu Brute',
            hairColor: '#d65415',      // Orange flat top
            hairHighlight: '#ff7733',
            hairType: 'recoome_flat',
            skinColor: '#ffd1a4',
            skinShade: '#e0a070',
            giColor: '#151518',
            armorChest: '#f0f0e8',
            armorStrap: '#45b8eb',
            beltColor: '#151518',
            wristColor: '#f0f0e8',
            bootsColor: '#f0f0e8',
            scouter: '#11ff33',
            auraColor: '#ff3300',
            specialName: 'ERASER GUN',
            beamColor: '#ffe600',
            beamCore: '#ffffff'
        },
        zarbon: {
            name: 'ZARBON',
            title: 'Monster Beauty',
            hairColor: '#258a7f',      // Teal hair
            hairHighlight: '#40b5a7',
            hairType: 'zarbon_braid',
            skinColor: '#8ee0d6',      // Pale cyan skin
            skinShade: '#5fb8ad',
            giColor: '#151518',
            armorChest: '#4d3d22',
            armorStrap: '#c59420',
            beltColor: '#151518',
            wristColor: '#f0f0e8',
            bootsColor: '#f0f0e8',
            scouter: '#3388ff',
            auraColor: '#ff00aa',
            specialName: 'ELEGANT BLAST',
            beamColor: '#ff00aa',
            beamCore: '#ffffff'
        },
        dabura: {
            name: 'DABURA',
            title: 'Demon Realm King',
            hairColor: null,
            hairType: 'dabura_horns',
            skinColor: '#d64d50',      // Red demon skin
            skinShade: '#a82c2e',
            giColor: '#3069b3',        // Blue suit
            vestColor: '#f0f0e8',      // White cape
            beltColor: '#f0f0e8',
            wristColor: '#f0f0e8',
            bootsColor: '#f0f0e8',
            auraColor: '#ff3300',
            specialName: 'EVIL FLAME',
            beamColor: '#ff4400',
            beamCore: '#ffea00'
        },
        kid_buu: {
            name: 'KID BUU',
            title: 'Pure Evil Chaos',
            hairColor: null,
            hairType: 'kid_buu_head',
            skinColor: '#ff77aa',
            skinShade: '#d64d80',
            giColor: '#f5f5f5',
            beltColor: '#18181f',
            wristColor: '#d69e2e',
            bootsColor: '#7a4214',
            auraColor: '#ff0077',
            specialName: 'PLANET BURST',
            beamColor: '#ff0055',
            beamCore: '#ffffff'
        },
        majin_vegeta: {
            name: 'MAJIN VEGETA',
            title: 'Prince of Pride',
            hairColor: '#ffe600',
            hairHighlight: '#fff899',
            hairType: 'flame_tall',
            foreheadM: true,
            skinColor: '#ffd1a4',
            skinShade: '#e5a578',
            giColor: '#0c2266',
            beltColor: '#ffffff',
            wristColor: '#ffffff',
            bootsColor: '#ffffff',
            auraColor: '#ffe600',
            specialName: 'FINAL EXPLODE',
            beamColor: '#ffaa00',
            beamCore: '#ffffff'
        },
        ultimate_gohan: {
            name: 'ULTIMATE GOHAN',
            title: 'Mystic Warrior',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'mystic_gohan',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#ff5500',
            giUndershirt: '#0033aa',
            beltColor: '#0033aa',
            wristColor: '#0033aa',
            bootsColor: '#0033aa',
            auraColor: '#ffffff',
            specialName: 'BURST RUSH',
            beamColor: '#00e1ff',
            beamCore: '#ffffff'
        },
        turles: {
            name: 'TURLES',
            title: 'Shadow Saiyan',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'wild_spikes',
            skinColor: '#967054',
            skinShade: '#735038',
            giColor: '#151518',
            armorChest: '#3b3547',
            armorStrap: '#7a3899',
            beltColor: '#151518',
            wristColor: '#3b3547',
            bootsColor: '#3b3547',
            scouter: '#ff1133',
            auraColor: '#9900ee',
            specialName: 'KILL DRIVER',
            beamColor: '#9900ff',
            beamCore: '#ff00aa'
        },
        bojack: {
            name: 'BOJACK',
            title: 'Space Pirate',
            hairColor: '#ff6600',
            hairHighlight: '#ff9933',
            hairType: 'bojack_orange',
            skinColor: '#2e8f66',
            skinShade: '#1b6144',
            giColor: '#2b233d',
            beltColor: '#d69e2e',
            wristColor: '#d69e2e',
            bootsColor: '#18181f',
            auraColor: '#39ff14',
            specialName: 'GALACTIC BUST',
            beamColor: '#39ff14',
            beamCore: '#ffffff'
        },
        golden_frieza: {
            name: 'GOLDEN FRIEZA',
            title: 'Golden Emperor',
            hairColor: null,
            hairType: 'frieza_head',
            skinColor: '#ffd700',
            skinShade: '#c99e10',
            giColor: '#6f199e',
            beltColor: '#6f199e',
            wristColor: '#ffd700',
            bootsColor: '#6f199e',
            auraColor: '#ffea00',
            specialName: 'GOLDEN BEAM',
            beamColor: '#ffea00',
            beamCore: '#ff0055'
        },
        orange_piccolo: {
            name: 'ORANGE PICCOLO',
            title: 'Namekian Titan',
            hairColor: null,
            hairType: 'orange_piccolo_head',
            skinColor: '#e86617',
            skinShade: '#b84400',
            giColor: '#4d1e70',
            beltColor: '#45b8eb',
            wristColor: '#d62432',
            bootsColor: '#966028',
            auraColor: '#ff5500',
            specialName: 'GREAT SMASH',
            beamColor: '#ff5500',
            beamCore: '#ffff00'
        },
        ssj4_goku: {
            name: 'SSJ4 GOKU',
            title: 'Primal Apex (GT)',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'ssj4_goku_hair',
            eyeliner: '#c91e1e',
            furColor: '#c91e1e',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#d99820',
            beltColor: '#0055dd',
            wristColor: '#0055dd',
            bootsColor: '#151518',
            tail: true,
            auraColor: '#ff3300',
            specialName: '10X KAMEHA',
            beamColor: '#ff0033',
            beamCore: '#ffffff'
        },
        ssj4_vegeta: {
            name: 'SSJ4 VEGETA',
            title: 'Crimson Pride (GT)',
            hairColor: '#2b1d14',
            hairHighlight: '#4a3325',
            hairType: 'ssj4_vegeta_hair',
            eyeliner: '#c91e1e',
            furColor: '#c91e1e',
            skinColor: '#ffd1a4',
            skinShade: '#e5a578',
            giColor: '#1f253d',
            beltColor: '#111115',
            wristColor: '#ffffff',
            bootsColor: '#111115',
            tail: true,
            auraColor: '#00ffcc',
            specialName: 'FINAL SHINE',
            beamColor: '#00ff88',
            beamCore: '#ffffff'
        },
        ssj4_gogeta: {
            name: 'SSJ4 GOGETA',
            title: 'Primal Fusion (GT)',
            hairColor: '#e62200',
            hairHighlight: '#ff6644',
            hairType: 'ssj4_gogeta_hair',
            eyeliner: '#9e1a1a',
            furColor: '#8a1818',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#ffffff',
            vestColor: '#18181f',
            paddingColor: '#d67515',
            beltColor: '#00ccff',
            wristColor: '#18181f',
            bootsColor: '#18181f',
            tail: true,
            auraColor: '#ffea00',
            specialName: '100X BIG BANG',
            beamColor: '#ff0044',
            beamCore: '#ffea00'
        }
    };

    draw(ctx, fighter, x, y, facing, state, animFrame) {
        const char = FighterRenderer.CHARACTERS[fighter.charKey] || FighterRenderer.CHARACTERS.goku;
        const pSize = 2.4;

        ctx.save();
        ctx.translate(Math.floor(x), Math.floor(y));
        if (facing < 0) {
            ctx.scale(-1, 1);
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 24, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        if (state === 'charge') {
            this.drawChargingAura(ctx, char.auraColor, animFrame);
        }

        this.drawFighterPose(ctx, char, state, animFrame, pSize);

        ctx.restore();
    }

    drawChargingAura(ctx, auraColor, frame) {
        ctx.save();
        const pulse = Math.sin(Date.now() * 0.02) * 4;
        const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, 36 + pulse);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.3, auraColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -38 - pulse);
        ctx.lineTo(18 + pulse, -12);
        ctx.lineTo(26 + pulse, 14);
        ctx.lineTo(12, 28);
        ctx.lineTo(-12, 28);
        ctx.lineTo(-26 - pulse, 14);
        ctx.lineTo(-18 - pulse, -12);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawFighterPose(ctx, char, state, frame, p) {
        const f = Math.floor(frame) % 4;
        let bobY = 0;
        let legOffset = 0;
        let punchExtend = 0;
        let headTilt = 0;
        let armPose = 'normal';

        switch (state) {
            case 'idle':
                bobY = (f === 1 || f === 2) ? 1 : 0;
                armPose = 'guard_ready';
                break;
            case 'walk':
                bobY = (f % 2 === 1) ? -1 : 0;
                legOffset = (f === 0 || f === 2) ? (f === 0 ? 3 : -3) : 0;
                armPose = 'walk_swing';
                break;
            case 'dash':
                bobY = 4;
                headTilt = 3;
                legOffset = -5;
                armPose = 'dash_trail';
                break;
            case 'punch1':
                punchExtend = 7;
                armPose = 'punch_jab';
                break;
            case 'punch2':
                punchExtend = 9;
                headTilt = 1;
                armPose = 'punch_cross';
                break;
            case 'kick':
                legOffset = 9;
                armPose = 'kick_balance';
                break;
            case 'smash':
                punchExtend = 12;
                headTilt = 2;
                armPose = 'heavy_smash';
                break;
            case 'charge':
                bobY = 2 + (Math.random() > 0.5 ? 1 : -1);
                armPose = 'charge_flex';
                break;
            case 'ki_blast':
                punchExtend = 6;
                armPose = 'palm_blast';
                break;
            case 'beam':
                bobY = 2;
                punchExtend = 8;
                armPose = 'two_hand_beam';
                break;
            case 'guard':
                bobY = 2;
                armPose = 'cross_guard';
                break;
            case 'hurt':
                bobY = -2;
                headTilt = -4;
                armPose = 'hurt_flail';
                break;
            case 'knockdown':
                this.drawKnockedDown(ctx, char, p);
                return;
        }

        const originY = -12 + bobY;

        if (char.tail) {
            ctx.fillStyle = '#7a4214'; // Brown monkey tail
            ctx.fillRect(-10, originY + 12, 4, 3);
            ctx.fillRect(-14, originY + 10, 4, 3);
            ctx.fillRect(-16, originY + 6, 3, 5);
            ctx.fillRect(-15, originY + 4, 3, 3);
        }

        this.drawLegs(ctx, char, p, originY, legOffset, state);
        this.drawTorso(ctx, char, p, originY, state);
        this.drawArms(ctx, char, p, originY, armPose, punchExtend);
        this.drawHead(ctx, char, p, originY + headTilt, state);

        if (state === 'guard') {
            ctx.save();
            ctx.strokeStyle = char.auraColor || '#00f0ff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(8, originY + 8, 18, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawLegs(ctx, char, p, originY, legOffset, state) {
        const pantColor = char.giColor;
        const bootColor = char.bootsColor || '#111';
        const leftLegX = -7 - legOffset * 0.5;
        const rightLegX = 2 + legOffset;
        const legY = originY + 14;

        if (state === 'kick') {
            ctx.fillStyle = pantColor;
            ctx.fillRect(leftLegX, legY, 6, 9);
            ctx.fillRect(rightLegX, legY - 6, 12, 6);
            ctx.fillStyle = bootColor;
            ctx.fillRect(leftLegX, legY + 9, 6, 4);
            ctx.fillRect(rightLegX + 12, legY - 6, 5, 6);
            return;
        }

        ctx.fillStyle = pantColor;
        ctx.fillRect(leftLegX, legY, 6, 8);
        ctx.fillStyle = bootColor;
        ctx.fillRect(leftLegX - 1, legY + 8, 7, 4);

        ctx.fillStyle = pantColor;
        ctx.fillRect(rightLegX, legY, 6, 8);
        ctx.fillStyle = bootColor;
        ctx.fillRect(rightLegX - 1, legY + 8, 7, 4);
    }

    drawTorso(ctx, char, p, originY, state) {
        const chestX = -7;
        const chestY = originY + 3;
        const width = 14;
        const height = 12;

        if (char.furColor) {
            ctx.fillStyle = char.furColor;
            ctx.fillRect(chestX, chestY, width, height);

            ctx.fillStyle = char.skinColor;
            ctx.fillRect(chestX + 3, chestY + 1, width - 6, 8);

            ctx.fillStyle = char.skinShade;
            ctx.fillRect(chestX + 5, chestY + 3, 4, 5);

            if (char.beltColor) {
                ctx.fillStyle = char.beltColor;
                ctx.fillRect(chestX, chestY + height - 3, width, 3);
            }
        } else if (char.armorChest) {
            ctx.fillStyle = char.giColor;
            ctx.fillRect(chestX, chestY, width, height);

            ctx.fillStyle = char.armorChest;
            ctx.fillRect(chestX + 1, chestY, width - 2, height - 2);

            ctx.fillStyle = char.armorStrap || '#c59420';
            ctx.fillRect(chestX + 3, chestY + 1, 3, 4);
            ctx.fillRect(chestX + 8, chestY + 1, 3, 4);
            ctx.fillRect(chestX + 2, chestY + 6, width - 4, 3);
        } else if (char.vestColor) {
            ctx.fillStyle = char.skinColor;
            ctx.fillRect(chestX + 3, chestY, width - 6, height);

            ctx.fillStyle = char.vestColor;
            ctx.fillRect(chestX, chestY, 4, height);
            ctx.fillRect(chestX + width - 4, chestY, 4, height);

            if (char.paddingColor) {
                ctx.fillStyle = char.paddingColor;
                ctx.fillRect(chestX - 2, chestY, 4, 5);
                ctx.fillRect(chestX + width - 2, chestY, 4, 5);
            }
            if (char.beltColor) {
                ctx.fillStyle = char.beltColor;
                ctx.fillRect(chestX, chestY + height - 3, width, 3);
            }
        } else {
            ctx.fillStyle = char.giUndershirt || char.giColor;
            ctx.fillRect(chestX, chestY, width, height);

            ctx.fillStyle = char.giColor;
            ctx.fillRect(chestX + 1, chestY, width - 2, height - 1);

            ctx.fillStyle = char.skinColor;
            ctx.fillRect(chestX + 5, chestY, 4, 3);

            if (char.beltColor) {
                ctx.fillStyle = char.beltColor;
                ctx.fillRect(chestX, chestY + height - 3, width, 3);
            }
        }

        if (char.name === 'CELL') {
            ctx.fillStyle = '#111115';
            ctx.fillRect(chestX - 6, chestY - 4, 4, 14);
            ctx.fillRect(chestX + width + 2, chestY - 4, 4, 14);
        }
    }

    drawArms(ctx, char, p, originY, pose, punchExtend) {
        const skin = char.skinColor;
        const wrist = char.wristColor || char.skinColor;
        const gi = char.furColor || char.jacketColor || char.giUndershirt || char.giColor;
        const armY = originY + 5;

        switch (pose) {
            case 'punch_jab':
            case 'punch_cross':
            case 'heavy_smash':
                ctx.fillStyle = gi;
                ctx.fillRect(-9, armY, 4, 6);
                ctx.fillStyle = wrist;
                ctx.fillRect(-9, armY + 6, 4, 3);

                ctx.fillStyle = gi;
                ctx.fillRect(3, armY - 1, 6 + punchExtend * 0.5, 5);
                ctx.fillStyle = skin;
                ctx.fillRect(8 + punchExtend * 0.5, armY - 1, 4 + punchExtend * 0.4, 5);
                ctx.fillStyle = wrist;
                ctx.fillRect(12 + punchExtend * 0.8, armY - 1, 5, 5);
                break;

            case 'charge_flex':
                ctx.fillStyle = gi;
                ctx.fillRect(-11, armY, 4, 7);
                ctx.fillRect(7, armY, 4, 7);
                ctx.fillStyle = wrist;
                ctx.fillRect(-12, armY + 5, 5, 4);
                ctx.fillRect(7, armY + 5, 5, 4);
                break;

            case 'two_hand_beam':
            case 'palm_blast':
                ctx.fillStyle = gi;
                ctx.fillRect(1, armY - 2, 7, 5);
                ctx.fillStyle = skin;
                ctx.fillRect(7, armY - 2, 5 + punchExtend, 5);
                ctx.fillStyle = wrist;
                ctx.fillRect(11 + punchExtend, armY - 3, 5, 7);
                break;

            case 'cross_guard':
                ctx.fillStyle = gi;
                ctx.fillRect(0, armY, 7, 7);
                ctx.fillStyle = wrist;
                ctx.fillRect(2, armY + 1, 6, 5);
                break;

            default:
                ctx.fillStyle = gi;
                ctx.fillRect(-9, armY, 4, 6);
                ctx.fillRect(5, armY, 4, 6);
                ctx.fillStyle = wrist;
                ctx.fillRect(-10, armY + 5, 4, 3);
                ctx.fillRect(6, armY + 4, 4, 3);
                break;
        }
    }

    drawHead(ctx, char, p, originY, state) {
        const headX = -7;
        const headY = originY - 14;
        const skin = char.skinColor;
        const shade = char.skinShade;

        ctx.fillStyle = skin;
        ctx.fillRect(headX, headY, 14, 13);
        ctx.fillRect(headX + 1, headY + 13, 12, 2);

        ctx.fillStyle = shade;
        ctx.fillRect(headX + 3, headY + 13, 8, 1);

        // Eyes
        ctx.fillStyle = '#111111';
        if (state === 'hurt') {
            ctx.fillRect(headX + 5, headY + 6, 3, 2);
            ctx.fillRect(headX + 10, headY + 6, 3, 2);
        } else if (char.eyeliner) {
            // SSJ4 Eyeliner & fierce gaze
            ctx.fillStyle = char.eyeliner;
            ctx.fillRect(headX + 4, headY + 4, 7, 5);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(headX + 6, headY + 6, 2, 2);
            ctx.fillStyle = '#111111';
            ctx.fillRect(headX + 5, headY + 5, 2, 2);
        } else if (char.name.includes('BEAST')) {
            // Glowing Red Beast Eyes
            ctx.fillStyle = '#ff0033';
            ctx.fillRect(headX + 5, headY + 5, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(headX + 6, headY + 6, 2, 2);
        } else if (char.name.includes('U.I.')) {
            // Silver Ultra Instinct Eyes
            ctx.fillStyle = '#b0c4de';
            ctx.fillRect(headX + 5, headY + 5, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(headX + 6, headY + 6, 2, 2);
        } else {
            ctx.fillRect(headX + 5, headY + 5, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(headX + 6, headY + 6, 2, 2);
            ctx.fillStyle = '#111111';
            ctx.fillRect(headX + 4, headY + 4, 6, 1);
        }

        // Draw Scouter if character has one
        if (char.scouter) {
            ctx.fillStyle = char.scouter;
            ctx.fillRect(headX + 3, headY + 4, 6, 4);
        }

        // Majin symbol
        if (char.foreheadM) {
            ctx.fillStyle = '#111115';
            ctx.fillRect(headX + 4, headY + 1, 2, 3);
            ctx.fillRect(headX + 6, headY + 3, 2, 2);
            ctx.fillRect(headX + 8, headY + 1, 2, 3);
        }

        this.drawHair(ctx, char, headX, headY);
    }

    drawHair(ctx, char, hx, hy) {
        const hair = char.hairColor;
        const hi = char.hairHighlight;

        switch (char.hairType) {
            case 'wild_spikes':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 4, hy - 8, 22, 9);
                ctx.fillRect(hx - 8, hy - 4, 5, 7);
                ctx.fillRect(hx - 11, hy - 8, 4, 6);
                ctx.fillRect(hx - 1, hy - 13, 6, 6);
                ctx.fillRect(hx + 7, hy - 12, 7, 5);
                ctx.fillRect(hx + 14, hy - 5, 5, 8);
                ctx.fillRect(hx + 1, hy, 4, 3);
                ctx.fillRect(hx + 8, hy + 1, 3, 3);
                ctx.fillStyle = hi;
                ctx.fillRect(hx - 1, hy - 11, 4, 2);
                ctx.fillRect(hx + 7, hy - 10, 4, 2);
                break;

            case 'flame_tall':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 2, hy - 16, 18, 17);
                ctx.fillRect(hx, hy - 21, 14, 6);
                ctx.fillRect(hx + 3, hy - 25, 8, 5);
                ctx.fillRect(hx - 5, hy - 10, 4, 8);
                ctx.fillRect(hx + 15, hy - 9, 4, 7);
                ctx.fillStyle = char.skinColor;
                ctx.fillRect(hx + 2, hy, 4, 3);
                ctx.fillRect(hx + 8, hy, 4, 3);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 4, hy - 18, 5, 8);
                break;

            case 'ssj_gohan':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 12, 20, 13);
                ctx.fillRect(hx + 2, hy - 18, 9, 7);
                ctx.fillRect(hx - 6, hy - 8, 4, 7);
                ctx.fillRect(hx + 15, hy - 8, 4, 7);
                ctx.fillRect(hx + 4, hy - 2, 3, 6);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 3, hy - 16, 4, 4);
                break;

            case 'beast_spikes':
                // Giant Gohan Beast hair rising to heavens
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 16, 20, 17);
                ctx.fillRect(hx + 1, hy - 28, 11, 13);
                ctx.fillRect(hx + 4, hy - 35, 6, 8);
                ctx.fillRect(hx - 7, hy - 12, 5, 9);
                ctx.fillRect(hx + 15, hy - 12, 5, 9);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 3, hy - 25, 5, 10);
                break;

            case 'trunks_parted':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 7, 20, 9);
                ctx.fillRect(hx - 4, hy - 2, 4, 10);
                ctx.fillRect(hx + 14, hy - 2, 4, 10);
                ctx.fillRect(hx + 5, hy - 2, 3, 4);
                ctx.fillStyle = hi;
                ctx.fillRect(hx - 1, hy - 5, 6, 2);
                ctx.fillRect(hx + 8, hy - 5, 6, 2);
                break;

            case 'namek_turban':
                ctx.fillStyle = '#388a2e';
                ctx.fillRect(hx - 2, hy + 5, 3, 4);
                ctx.fillStyle = '#ffd15c';
                ctx.fillRect(hx + 3, hy - 3, 2, 4);
                ctx.fillRect(hx + 8, hy - 3, 2, 4);
                break;

            case 'krillin_bald':
                ctx.fillStyle = '#9c6b3b';
                ctx.fillRect(hx + 4, hy + 1, 1, 1);
                ctx.fillRect(hx + 6, hy + 1, 1, 1);
                ctx.fillRect(hx + 8, hy + 1, 1, 1);
                ctx.fillRect(hx + 4, hy + 3, 1, 1);
                ctx.fillRect(hx + 6, hy + 3, 1, 1);
                ctx.fillRect(hx + 8, hy + 3, 1, 1);
                break;

            case 'frieza_head':
                ctx.fillStyle = '#6f199e';
                ctx.fillRect(hx + 2, hy - 2, 10, 4);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(hx + 4, hy - 1, 3, 2);
                break;

            case 'cell_crown':
                ctx.fillStyle = '#181a18';
                ctx.fillRect(hx - 4, hy - 14, 5, 14);
                ctx.fillRect(hx + 13, hy - 14, 5, 14);
                ctx.fillStyle = '#6f199e';
                ctx.fillRect(hx + 5, hy - 2, 4, 4);
                break;

            case 'buu_head':
                ctx.fillStyle = '#ff77aa';
                ctx.fillRect(hx + 5, hy - 8, 4, 8);
                ctx.fillRect(hx + 8, hy - 12, 6, 5);
                ctx.fillStyle = '#111115';
                ctx.fillRect(hx + 2, hy - 1, 2, 2);
                ctx.fillRect(hx + 10, hy - 1, 2, 2);
                break;

            case 'broly_wild':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 6, hy - 16, 26, 17);
                ctx.fillRect(hx - 3, hy - 22, 18, 7);
                ctx.fillRect(hx - 8, hy - 8, 4, 9);
                ctx.fillRect(hx + 18, hy - 8, 4, 9);
                ctx.fillStyle = hi;
                ctx.fillRect(hx, hy - 18, 8, 4);
                break;

            case 'black_rose':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 4, hy - 10, 22, 11);
                ctx.fillRect(hx - 1, hy - 15, 7, 6);
                ctx.fillRect(hx + 8, hy - 14, 6, 5);
                ctx.fillStyle = hi;
                ctx.fillRect(hx, hy - 12, 5, 3);
                ctx.fillStyle = '#00ff66';
                ctx.fillRect(hx - 2, hy + 9, 2, 3);
                break;

            case 'beerus_cat':
                ctx.fillStyle = char.skinColor;
                ctx.fillRect(hx - 2, hy - 14, 4, 14);
                ctx.fillRect(hx + 12, hy - 14, 4, 14);
                ctx.fillStyle = '#4a2f66';
                ctx.fillRect(hx, hy - 10, 2, 8);
                ctx.fillRect(hx + 12, hy - 10, 2, 8);
                break;

            case 'jiren_head':
                // Smooth alien grey dome with deep dark ears
                ctx.fillStyle = '#595d73';
                ctx.fillRect(hx - 2, hy + 4, 3, 5);
                ctx.fillRect(hx + 13, hy + 4, 3, 5);
                break;

            case 'hit_head':
                // Assassin helmet
                ctx.fillStyle = '#402e5c';
                ctx.fillRect(hx - 2, hy - 4, 18, 6);
                ctx.fillStyle = '#221933';
                ctx.fillRect(hx + 5, hy - 5, 4, 3);
                break;

            case 'raditz_mane':
                // Giant black mane falling behind knees
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 5, hy - 8, 24, 9);
                ctx.fillRect(hx - 7, hy - 4, 4, 32); // Left waist mane
                ctx.fillRect(hx + 17, hy - 4, 4, 32); // Right waist mane
                ctx.fillRect(hx - 1, hy - 12, 6, 5);
                ctx.fillRect(hx + 8, hy - 11, 7, 5);
                break;

            case 'nappa_bald':
                // Mustache
                ctx.fillStyle = '#111115';
                ctx.fillRect(hx + 4, hy + 9, 6, 2);
                ctx.fillRect(hx + 3, hy + 10, 2, 3);
                ctx.fillRect(hx + 9, hy + 10, 2, 3);
                break;

            case 'yamcha_hair':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 7, 20, 9);
                ctx.fillRect(hx - 5, hy + 1, 4, 12);
                ctx.fillRect(hx + 15, hy + 1, 4, 12);
                // Cheek scars
                ctx.fillStyle = '#b84444';
                ctx.fillRect(hx + 2, hy + 8, 3, 1);
                ctx.fillRect(hx + 10, hy + 5, 2, 2);
                break;

            case 'tien_head':
                // Third Eye on forehead
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(hx + 5, hy - 1, 4, 3);
                ctx.fillStyle = '#111111';
                ctx.fillRect(hx + 6, hy, 2, 2);
                break;

            case 'ginyu_horns':
                ctx.fillStyle = '#181a18';
                ctx.fillRect(hx - 4, hy - 10, 4, 11);
                ctx.fillRect(hx + 14, hy - 10, 4, 11);
                break;

            case 'cooler_mask':
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(hx - 5, hy - 12, 4, 12);
                ctx.fillRect(hx + 15, hy - 12, 4, 12);
                ctx.fillRect(hx - 1, hy - 16, 5, 14);
                ctx.fillRect(hx + 10, hy - 16, 5, 14);
                // Mouth mask
                ctx.fillRect(hx + 3, hy + 8, 8, 6);
                break;

            case 'janemba_horns':
                ctx.fillStyle = '#541275';
                ctx.fillRect(hx - 4, hy - 11, 4, 11);
                ctx.fillRect(hx + 14, hy - 11, 4, 11);
                break;

            case 'ssj3_long':
                // SSJ3 hair down past knees without eyebrows
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 4, hy - 8, 22, 10);
                ctx.fillRect(hx - 6, hy, 5, 28);
                ctx.fillRect(hx + 15, hy, 5, 28);
                ctx.fillRect(hx - 2, hy - 14, 8, 7);
                ctx.fillRect(hx + 7, hy - 13, 8, 6);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 2, hy - 10, 4, 4);
                break;

            case 'a17_hair':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 7, 20, 9);
                ctx.fillRect(hx - 4, hy - 2, 4, 10);
                ctx.fillRect(hx + 14, hy - 2, 4, 10);
                // Orange scarf around neck
                ctx.fillStyle = '#ff7700';
                ctx.fillRect(hx + 2, hy + 12, 10, 4);
                break;

            case 'a16_mohawk':
                ctx.fillStyle = hair;
                ctx.fillRect(hx + 4, hy - 14, 6, 15);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 5, hy - 12, 4, 5);
                break;

            case 'roshi_buff':
                // White bushy beard & sunglasses
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(hx + 1, hy + 8, 12, 7);
                ctx.fillRect(hx + 3, hy + 14, 8, 4);
                // Sunglasses
                ctx.fillStyle = '#111111';
                ctx.fillRect(hx + 3, hy + 4, 4, 3);
                ctx.fillRect(hx + 8, hy + 4, 4, 3);
                ctx.fillStyle = '#c91e1e'; // Red frames
                ctx.fillRect(hx + 2, hy + 3, 11, 1);
                break;

            case 'vegito_spikes':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 13, 20, 14);
                ctx.fillRect(hx + 1, hy - 19, 10, 7);
                ctx.fillRect(hx + 2, hy - 1, 3, 5);
                ctx.fillRect(hx + 8, hy - 1, 3, 5);
                ctx.fillStyle = '#ffee00';
                ctx.fillRect(hx - 2, hy + 9, 2, 3);
                ctx.fillRect(hx + 14, hy + 9, 2, 3);
                break;

            case 'gogeta_spikes':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 14, 20, 15);
                ctx.fillRect(hx + 2, hy - 20, 10, 7);
                ctx.fillRect(hx + 5, hy - 1, 4, 6);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 3, hy - 16, 4, 4);
                break;

            case 'bardock_spikes':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 4, hy - 8, 22, 9);
                ctx.fillRect(hx - 8, hy - 4, 5, 7);
                ctx.fillRect(hx - 1, hy - 13, 6, 6);
                ctx.fillRect(hx + 7, hy - 12, 7, 5);
                ctx.fillStyle = '#b81424';
                ctx.fillRect(hx - 1, hy + 1, 16, 3);
                ctx.fillRect(hx + 2, hy + 8, 3, 1);
                break;

            case 'a18_bob':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 2, hy - 7, 18, 9);
                ctx.fillRect(hx - 4, hy - 2, 4, 11);
                ctx.fillRect(hx + 14, hy - 2, 4, 11);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 1, hy - 5, 10, 2);
                break;

            case 'tao_braid':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 2, hy - 6, 18, 7);
                ctx.fillRect(hx - 6, hy + 1, 4, 18);
                ctx.fillRect(hx - 4, hy + 19, 3, 4);
                break;

            case 'demon_king_head':
                ctx.fillStyle = '#2c6d22';
                ctx.fillRect(hx - 2, hy + 4, 3, 4);
                ctx.fillStyle = '#ffd15c';
                ctx.fillRect(hx + 3, hy - 4, 2, 5);
                ctx.fillRect(hx + 8, hy - 4, 2, 5);
                ctx.fillStyle = '#1b4d14';
                ctx.fillRect(hx + 2, hy + 1, 9, 1);
                ctx.fillRect(hx + 3, hy + 3, 7, 1);
                break;

            case 'recoome_flat':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 1, hy - 14, 16, 14);
                ctx.fillRect(hx - 3, hy - 8, 3, 8);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 1, hy - 13, 12, 3);
                break;

            case 'zarbon_braid':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 2, hy - 7, 18, 8);
                ctx.fillRect(hx - 6, hy + 1, 4, 20);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(hx + 1, hy - 1, 12, 2);
                ctx.fillRect(hx + 6, hy - 3, 2, 3);
                break;

            case 'dabura_horns':
                ctx.fillStyle = '#e8e8e8';
                ctx.fillRect(hx - 4, hy - 9, 4, 9);
                ctx.fillRect(hx + 14, hy - 9, 4, 9);
                ctx.fillRect(hx - 6, hy - 13, 3, 5);
                ctx.fillRect(hx + 17, hy - 13, 3, 5);
                ctx.fillStyle = '#111115';
                ctx.fillRect(hx + 5, hy + 14, 4, 3);
                break;

            case 'kid_buu_head':
                ctx.fillStyle = '#ff77aa';
                ctx.fillRect(hx + 5, hy - 6, 4, 6);
                ctx.fillRect(hx + 7, hy - 10, 5, 5);
                ctx.fillStyle = '#111115';
                ctx.fillRect(hx + 2, hy - 1, 2, 2);
                ctx.fillRect(hx + 10, hy - 1, 2, 2);
                break;

            case 'mystic_gohan':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 3, hy - 13, 20, 14);
                ctx.fillRect(hx + 1, hy - 19, 10, 7);
                ctx.fillRect(hx + 4, hy - 2, 3, 7);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 3, hy - 17, 5, 4);
                break;

            case 'bojack_orange':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 5, hy - 12, 24, 13);
                ctx.fillRect(hx - 7, hy - 2, 5, 18);
                ctx.fillRect(hx + 16, hy - 2, 5, 18);
                ctx.fillStyle = '#18181f';
                ctx.fillRect(hx - 1, hy + 1, 16, 3);
                break;

            case 'orange_piccolo_head':
                ctx.fillStyle = '#b84400';
                ctx.fillRect(hx - 3, hy + 4, 4, 5);
                ctx.fillRect(hx + 13, hy + 4, 4, 5);
                ctx.fillStyle = '#ffd15c';
                ctx.fillRect(hx + 3, hy - 3, 2, 4);
                ctx.fillRect(hx + 8, hy - 3, 2, 4);
                break;

            case 'ssj4_goku_hair':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 5, hy - 10, 24, 11);
                ctx.fillRect(hx - 2, hy - 16, 12, 7);
                ctx.fillRect(hx - 8, hy - 2, 5, 20);
                ctx.fillRect(hx + 17, hy - 2, 5, 20);
                ctx.fillRect(hx + 4, hy - 1, 3, 5);
                ctx.fillStyle = hi;
                ctx.fillRect(hx, hy - 14, 6, 3);
                break;

            case 'ssj4_vegeta_hair':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 4, hy - 14, 22, 15);
                ctx.fillRect(hx - 1, hy - 20, 14, 7);
                ctx.fillRect(hx - 7, hy - 2, 4, 18);
                ctx.fillRect(hx + 17, hy - 2, 4, 18);
                ctx.fillStyle = hi;
                ctx.fillRect(hx + 3, hy - 17, 6, 4);
                break;

            case 'ssj4_gogeta_hair':
                ctx.fillStyle = hair;
                ctx.fillRect(hx - 5, hy - 15, 24, 16);
                ctx.fillRect(hx - 2, hy - 22, 14, 8);
                ctx.fillRect(hx - 8, hy - 3, 5, 22);
                ctx.fillRect(hx + 17, hy - 3, 5, 22);
                ctx.fillRect(hx + 4, hy - 1, 4, 6);
                ctx.fillStyle = hi;
                ctx.fillRect(hx, hy - 19, 8, 5);
                break;
        }
    }

    drawKnockedDown(ctx, char, p) {
        ctx.save();
        ctx.translate(0, 16);
        ctx.rotate(Math.PI * 0.45);

        ctx.fillStyle = char.giColor;
        ctx.fillRect(-10, -5, 20, 10);
        ctx.fillStyle = char.bootsColor || '#333';
        ctx.fillRect(-14, -4, 5, 8);

        ctx.fillStyle = char.skinColor;
        ctx.fillRect(8, -5, 10, 9);

        if (char.hairColor) {
            ctx.fillStyle = char.hairColor;
            ctx.fillRect(15, -7, 9, 12);
        }
        ctx.restore();
    }
}

window.fighterRenderer = new FighterRenderer();
