// Pixel-Art Retro Character Renderer for Ki Clash
// Generates authentic Super-Deformed (SD) retro fighter sprites procedural pixel matrices

class FighterRenderer {
    constructor() {
        this.cache = new Map();
    }

    // Palette configurations for iconic retro anime archetype styles
    static CHARACTERS = {
        goku: {
            name: 'GOKU',
            title: 'Earth Hero',
            hairColor: '#111115',
            hairHighlight: '#2c2d38',
            hairType: 'wild_spikes',
            skinColor: '#ffcc99',
            skinShade: '#e0a070',
            giColor: '#ff5500',       // Orange gi
            giUndershirt: '#0033aa',   // Blue undershirt
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
            giColor: '#0c2266',       // Blue bodysuit
            armorChest: '#f0f0e8',    // White battle armor
            armorStrap: '#c59420',    // Gold shoulder straps
            beltColor: '#c59420',
            wristColor: '#ffffff',    // White gloves
            bootsColor: '#ffffff',    // White boots
            auraColor: '#a800ff',     // Purple aura
            specialName: 'GALICK GUN',
            beamColor: '#b400ff',
            beamCore: '#ffffff'
        },
        piccolo: {
            name: 'PICCOLO',
            title: 'Namekian Master',
            hairColor: null,          // Bald with antenna & ears
            hairType: 'namek_turban',
            skinColor: '#54b848',     // Green skin
            skinShade: '#388a2e',
            giColor: '#4d1e70',       // Purple gi
            beltColor: '#45b8eb',     // Cyan obi sash
            wristColor: '#d62432',    // Red wristbands
            bootsColor: '#966028',    // Brown shoes
            auraColor: '#ffe600',     // Golden-yellow aura
            specialName: 'SPECIAL BEAM',
            beamColor: '#ffe600',
            beamCore: '#ff2255'
        },
        frieza: {
            name: 'FRIEZA',
            title: 'Galactic Emperor',
            hairColor: null,
            hairType: 'frieza_head',
            skinColor: '#e8e8f8',     // White Bio-armor
            skinShade: '#b8b8d0',
            giColor: '#6f199e',       // Purple plates
            beltColor: '#6f199e',
            wristColor: '#6f199e',
            bootsColor: '#6f199e',
            auraColor: '#ff0055',     // Pink-red aura
            specialName: 'DEATH BEAM',
            beamColor: '#ff0066',
            beamCore: '#ffffff'
        }
    };

    drawPixel(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }

    // Main rendering entry point for a fighter
    draw(ctx, fighter, x, y, facing, state, animFrame) {
        const char = FighterRenderer.CHARACTERS[fighter.charKey] || FighterRenderer.CHARACTERS.goku;
        const scale = 2.4; // Pixel scale
        const pSize = scale;

        ctx.save();
        ctx.translate(Math.floor(x), Math.floor(y));
        if (facing < 0) {
            ctx.scale(-1, 1);
        }

        // Drop shadow on ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 24, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Aura rendering when charging
        if (state === 'charge') {
            this.drawChargingAura(ctx, char.auraColor, animFrame);
        }

        // Draw character body depending on state
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
        // Jagged energy aura shape
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
        let kickAngle = 0;
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
                kickAngle = 1;
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

        // 1. LEGS & BOOTS
        this.drawLegs(ctx, char, p, originY, legOffset, state);

        // 2. TORSO & GI/ARMOR
        this.drawTorso(ctx, char, p, originY, state);

        // 3. ARMS / HANDS (Back and Front)
        this.drawArms(ctx, char, p, originY, armPose, punchExtend);

        // 4. HEAD, FACE & HAIR
        this.drawHead(ctx, char, p, originY + headTilt, state);

        // Guard barrier effect if blocking
        if (state === 'guard') {
            ctx.save();
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(8, originY + 8, 18, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawLegs(ctx, char, p, originY, legOffset, state) {
        const pantColor = char.giColor;
        const bootColor = char.bootsColor;
        const leftLegX = -7 - legOffset * 0.5;
        const rightLegX = 2 + legOffset;
        const legY = originY + 14;

        if (state === 'kick') {
            // High kick leg
            ctx.fillStyle = pantColor;
            ctx.fillRect(leftLegX, legY, 6, 9);
            // Extended right leg
            ctx.fillRect(rightLegX, legY - 6, 12, 6);
            ctx.fillStyle = bootColor;
            ctx.fillRect(leftLegX, legY + 9, 6, 4);
            ctx.fillRect(rightLegX + 12, legY - 6, 5, 6);
            return;
        }

        // Left leg
        ctx.fillStyle = pantColor;
        ctx.fillRect(leftLegX, legY, 6, 8);
        ctx.fillStyle = bootColor;
        ctx.fillRect(leftLegX - 1, legY + 8, 7, 4);

        // Right leg
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

        if (char.armorChest) {
            // Vegeta Armor style
            ctx.fillStyle = char.giColor; // Blue bodysuit
            ctx.fillRect(chestX, chestY, width, height);

            ctx.fillStyle = char.armorChest; // White armor vest
            ctx.fillRect(chestX + 1, chestY, width - 2, height - 2);

            ctx.fillStyle = char.armorStrap; // Gold straps / stomach lines
            ctx.fillRect(chestX + 3, chestY + 1, 3, 4);
            ctx.fillRect(chestX + 8, chestY + 1, 3, 4);
            ctx.fillRect(chestX + 2, chestY + 6, width - 4, 3);
        } else {
            // Goku / Piccolo Gi style
            ctx.fillStyle = char.giUndershirt || char.giColor;
            ctx.fillRect(chestX, chestY, width, height);

            ctx.fillStyle = char.giColor;
            ctx.fillRect(chestX + 1, chestY, width - 2, height - 1);

            // V-neck cut
            ctx.fillStyle = char.skinColor;
            ctx.fillRect(chestX + 5, chestY, 4, 3);

            // Obi / Belt
            ctx.fillStyle = char.beltColor;
            ctx.fillRect(chestX, chestY + height - 3, width, 3);
        }
    }

    drawArms(ctx, char, p, originY, pose, punchExtend) {
        const skin = char.skinColor;
        const wrist = char.wristColor;
        const gi = char.giColor;
        const armY = originY + 5;

        switch (pose) {
            case 'punch_jab':
            case 'punch_cross':
            case 'heavy_smash':
                // Back arm tucked
                ctx.fillStyle = gi;
                ctx.fillRect(-9, armY, 4, 6);
                ctx.fillStyle = wrist;
                ctx.fillRect(-9, armY + 6, 4, 3);

                // Extended punch arm
                ctx.fillStyle = gi;
                ctx.fillRect(3, armY - 1, 6 + punchExtend * 0.5, 5);
                ctx.fillStyle = skin;
                ctx.fillRect(8 + punchExtend * 0.5, armY - 1, 4 + punchExtend * 0.4, 5);
                ctx.fillStyle = wrist;
                ctx.fillRect(12 + punchExtend * 0.8, armY - 1, 5, 5);
                break;

            case 'charge_flex':
                // Clenched bent arms
                ctx.fillStyle = gi;
                ctx.fillRect(-11, armY, 4, 7);
                ctx.fillRect(7, armY, 4, 7);
                ctx.fillStyle = wrist;
                ctx.fillRect(-12, armY + 5, 5, 4);
                ctx.fillRect(7, armY + 5, 5, 4);
                break;

            case 'two_hand_beam':
            case 'palm_blast':
                // Both hands forward firing beam
                ctx.fillStyle = gi;
                ctx.fillRect(1, armY - 2, 7, 5);
                ctx.fillStyle = skin;
                ctx.fillRect(7, armY - 2, 5 + punchExtend, 5);
                ctx.fillStyle = wrist;
                ctx.fillRect(11 + punchExtend, armY - 3, 5, 7);
                break;

            case 'cross_guard':
                // Arms crossed in front of chest
                ctx.fillStyle = gi;
                ctx.fillRect(0, armY, 7, 7);
                ctx.fillStyle = wrist;
                ctx.fillRect(2, armY + 1, 6, 5);
                break;

            default: // Guard ready / Normal
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

        // Face shape
        ctx.fillStyle = skin;
        ctx.fillRect(headX, headY, 14, 13);
        ctx.fillRect(headX + 1, headY + 13, 12, 2);

        // Chin shade
        ctx.fillStyle = shade;
        ctx.fillRect(headX + 3, headY + 13, 8, 1);

        // Eyes
        ctx.fillStyle = '#111111';
        if (state === 'hurt') {
            // Closed/pain eyes > <
            ctx.fillRect(headX + 5, headY + 6, 3, 2);
            ctx.fillRect(headX + 10, headY + 6, 3, 2);
        } else {
            // Determined sharp anime eyes
            ctx.fillRect(headX + 5, headY + 5, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(headX + 6, headY + 6, 2, 2);
            ctx.fillStyle = '#111111';
            // Brow line
            ctx.fillRect(headX + 4, headY + 4, 6, 1);
        }

        // Hair Rendering based on hairstyle
        this.drawHair(ctx, char, headX, headY);
    }

    drawHair(ctx, char, hx, hy) {
        if (!char.hairColor && char.hairType === 'namek_turban') {
            // Piccolo antennae & ears
            ctx.fillStyle = '#388a2e';
            ctx.fillRect(hx - 2, hy + 5, 3, 4); // Ear
            ctx.fillStyle = '#ffd15c'; // Antennas
            ctx.fillRect(hx + 3, hy - 3, 2, 4);
            ctx.fillRect(hx + 8, hy - 3, 2, 4);
            return;
        }
        if (!char.hairColor && char.hairType === 'frieza_head') {
            // Frieza shiny dome & purple top
            ctx.fillStyle = '#6f199e';
            ctx.fillRect(hx + 2, hy - 2, 10, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(hx + 4, hy - 1, 3, 2);
            return;
        }

        const hair = char.hairColor;
        const hi = char.hairHighlight;
        ctx.fillStyle = hair;

        if (char.hairType === 'wild_spikes') {
            // Goku iconic wild spiky hair
            ctx.fillRect(hx - 4, hy - 8, 22, 9);
            // Left large spike
            ctx.fillRect(hx - 8, hy - 4, 5, 7);
            ctx.fillRect(hx - 11, hy - 8, 4, 6);
            // Top spikes
            ctx.fillRect(hx - 1, hy - 13, 6, 6);
            ctx.fillRect(hx + 7, hy - 12, 7, 5);
            // Right spike
            ctx.fillRect(hx + 14, hy - 5, 5, 8);
            // Forehead bangs
            ctx.fillRect(hx + 1, hy, 4, 3);
            ctx.fillRect(hx + 8, hy + 1, 3, 3);

            // Highlight glint
            ctx.fillStyle = hi;
            ctx.fillRect(hx - 1, hy - 11, 4, 2);
            ctx.fillRect(hx + 7, hy - 10, 4, 2);
        } else if (char.hairType === 'flame_tall') {
            // Vegeta tall flame hair
            ctx.fillRect(hx - 2, hy - 16, 18, 17);
            ctx.fillRect(hx, hy - 21, 14, 6);
            ctx.fillRect(hx + 3, hy - 25, 8, 5);
            // Side spikes
            ctx.fillRect(hx - 5, hy - 10, 4, 8);
            ctx.fillRect(hx + 15, hy - 9, 4, 7);
            // Widow's peak forehead
            ctx.fillStyle = char.skinColor;
            ctx.fillRect(hx + 2, hy, 4, 3);
            ctx.fillRect(hx + 8, hy, 4, 3);

            // Highlight glint
            ctx.fillStyle = hi;
            ctx.fillRect(hx + 4, hy - 18, 5, 8);
        }
    }

    drawKnockedDown(ctx, char, p) {
        // Horizontal collapsed sprite on ground
        ctx.save();
        ctx.translate(0, 16);
        ctx.rotate(Math.PI * 0.45);

        ctx.fillStyle = char.giColor;
        ctx.fillRect(-10, -5, 20, 10);
        ctx.fillStyle = char.bootsColor;
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
