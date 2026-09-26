// Main Game Loop, Input Manager, Stages & HUD for Ki Clash
class KiClashGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Virtual resolution (Retro 16:9 arcade format)
        this.width = 640;
        this.height = 360;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game State: 'MENU', 'SELECT', 'FIGHT', 'GAMEOVER'
        this.state = 'MENU';
        this.mode = '1P_CPU'; // '1P_CPU' or '1P_2P'
        this.currentStage = 'tournament'; // 'tournament', 'wasteland', 'namek', 'chamber'

        // Fighter Selections
        this.p1Char = 'goku';
        this.p2Char = 'vegeta';
        this.selectIndexP1 = 0;
        this.selectIndexP2 = 1;
        this.charList = ['goku', 'vegeta', 'piccolo', 'frieza'];

        // Entities
        this.p1 = null;
        this.p2 = null;
        this.fighters = [];

        // Match Info
        this.timer = 99;
        this.timerFrame = 0;
        this.winner = null;
        this.roundMessage = '';
        this.messageTimer = 0;

        // Keys tracking
        this.keys = {};
        this.setupInputs();

        // Gamepad tracking
        this.gamepadConnected = false;

        // Camera
        this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };

        // Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (window.soundEngine) window.soundEngine.resume();

            // Menu interactions
            if (this.state === 'MENU') {
                if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                    this.mode = '1P_CPU';
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                    this.mode = '1P_2P';
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyJ') {
                    this.state = 'SELECT';
                    if (window.soundEngine) window.soundEngine.playHit(true);
                }
            } else if (this.state === 'SELECT') {
                // P1 selection: A/D or W/S
                if (e.code === 'KeyA') {
                    this.selectIndexP1 = (this.selectIndexP1 - 1 + this.charList.length) % this.charList.length;
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === 'KeyD') {
                    this.selectIndexP1 = (this.selectIndexP1 + 1) % this.charList.length;
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                }

                // P2 selection: Left/Right arrows
                if (e.code === 'ArrowLeft') {
                    this.selectIndexP2 = (this.selectIndexP2 - 1 + this.charList.length) % this.charList.length;
                    this.p2Char = this.charList[this.selectIndexP2];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === 'ArrowRight') {
                    this.selectIndexP2 = (this.selectIndexP2 + 1) % this.charList.length;
                    this.p2Char = this.charList[this.selectIndexP2];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                }

                // Stage cycle: T
                if (e.code === 'KeyT') {
                    const stages = ['tournament', 'wasteland', 'namek', 'chamber'];
                    const idx = (stages.indexOf(this.currentStage) + 1) % stages.length;
                    this.currentStage = stages[idx];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                }

                // Start Fight
                if (e.code === 'Enter' || e.code === 'KeyJ') {
                    this.startFight();
                }
            } else if (this.state === 'GAMEOVER') {
                if (e.code === 'Enter' || e.code === 'KeyJ') {
                    this.state = 'SELECT';
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('gamepadconnected', () => {
            this.gamepadConnected = true;
        });
        window.addEventListener('gamepaddisconnected', () => {
            this.gamepadConnected = false;
        });
    }

    startFight() {
        this.p1 = new Fighter({
            id: 1,
            charKey: this.p1Char,
            x: 180,
            y: 220,
            facing: 1,
            isAI: false
        });

        this.p2 = new Fighter({
            id: 2,
            charKey: this.p2Char,
            x: 460,
            y: 220,
            facing: -1,
            isAI: (this.mode === '1P_CPU')
        });

        this.fighters = [this.p1, this.p2];
        if (window.projectileManager) {
            window.projectileManager.blasts = [];
            window.projectileManager.beams = [];
            window.projectileManager.clash = null;
        }

        this.timer = 99;
        this.timerFrame = 0;
        this.winner = null;
        this.state = 'FIGHT';
        this.roundMessage = 'FIGHT!';
        this.messageTimer = 70;

        if (window.soundEngine) {
            window.soundEngine.playJingle('start');
        }
    }

    updateInputs() {
        if (!this.p1 || !this.p2) return;

        // Player 1 Controls (WASD + J, K, L, Space, Shift, U)
        this.p1.input.up = !!(this.keys['KeyW']);
        this.p1.input.down = !!(this.keys['KeyS']);
        this.p1.input.left = !!(this.keys['KeyA']);
        this.p1.input.right = !!(this.keys['KeyD']);
        this.p1.input.attack = !!(this.keys['KeyJ']);
        this.p1.input.kiBlast = !!(this.keys['KeyK']);
        this.p1.input.beam = !!(this.keys['KeyL']);
        this.p1.input.charge = !!(this.keys['Space']);
        this.p1.input.dash = !!(this.keys['ShiftLeft'] || this.keys['KeyI']);
        this.p1.input.guard = !!(this.keys['KeyU']);

        // Check Gamepad for Player 1
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        if (gamepads && gamepads[0]) {
            const pad = gamepads[0];
            const threshold = 0.35;
            if (pad.axes[0] < -threshold || pad.buttons[14]?.pressed) this.p1.input.left = true;
            if (pad.axes[0] > threshold || pad.buttons[15]?.pressed) this.p1.input.right = true;
            if (pad.axes[1] < -threshold || pad.buttons[12]?.pressed) this.p1.input.up = true;
            if (pad.axes[1] > threshold || pad.buttons[13]?.pressed) this.p1.input.down = true;

            // X / Square = Melee, A / Cross = Ki Blast, B / Circle = Super Beam, Y / Triangle = Guard
            if (pad.buttons[2]?.pressed) this.p1.input.attack = true;
            if (pad.buttons[0]?.pressed) this.p1.input.kiBlast = true;
            if (pad.buttons[1]?.pressed) this.p1.input.beam = true;
            if (pad.buttons[3]?.pressed) this.p1.input.guard = true;
            if (pad.buttons[4]?.pressed || pad.buttons[6]?.pressed) this.p1.input.charge = true; // L1/L2
            if (pad.buttons[5]?.pressed || pad.buttons[7]?.pressed) this.p1.input.dash = true;   // R1/R2
        }

        // Player 2 Controls (Arrows + Numpad or UI keys, only if Human 2P)
        if (!this.p2.isAI) {
            this.p2.input.up = !!(this.keys['ArrowUp']);
            this.p2.input.down = !!(this.keys['ArrowDown']);
            this.p2.input.left = !!(this.keys['ArrowLeft']);
            this.p2.input.right = !!(this.keys['ArrowRight']);
            this.p2.input.attack = !!(this.keys['Numpad1'] || this.keys['Digit1']);
            this.p2.input.kiBlast = !!(this.keys['Numpad2'] || this.keys['Digit2']);
            this.p2.input.beam = !!(this.keys['Numpad3'] || this.keys['Digit3']);
            this.p2.input.charge = !!(this.keys['Numpad0'] || this.keys['Enter']);
            this.p2.input.dash = !!(this.keys['NumpadDecimal'] || this.keys['Digit4']);
            this.p2.input.guard = !!(this.keys['Numpad4'] || this.keys['Digit5']);

            // Gamepad 2 for Player 2
            if (gamepads && gamepads[1]) {
                const pad2 = gamepads[1];
                const threshold = 0.35;
                if (pad2.axes[0] < -threshold) this.p2.input.left = true;
                if (pad2.axes[0] > threshold) this.p2.input.right = true;
                if (pad2.axes[1] < -threshold) this.p2.input.up = true;
                if (pad2.axes[1] > threshold) this.p2.input.down = true;

                if (pad2.buttons[2]?.pressed) this.p2.input.attack = true;
                if (pad2.buttons[0]?.pressed) this.p2.input.kiBlast = true;
                if (pad2.buttons[1]?.pressed) this.p2.input.beam = true;
                if (pad2.buttons[3]?.pressed) this.p2.input.guard = true;
                if (pad2.buttons[4]?.pressed) this.p2.input.charge = true;
                if (pad2.buttons[5]?.pressed) this.p2.input.dash = true;
            }
        }
    }

    loop(currentTime) {
        requestAnimationFrame((t) => this.loop(t));

        // Update physics & game logic
        this.update();

        // Render everything
        this.render();
    }

    update() {
        if (this.state === 'FIGHT') {
            this.updateInputs();

            // Match countdown
            this.timerFrame++;
            if (this.timerFrame >= 60) {
                this.timerFrame = 0;
                if (this.timer > 0) this.timer--;
            }

            // Update fighters
            this.p1.update(this.width, this.height, this.p2);
            this.p2.update(this.width, this.height, this.p1);

            // Update projectiles & beams
            if (window.projectileManager) {
                window.projectileManager.update(this.width, this.height, this.fighters);
            }

            // Check KO or Time Over
            if (this.p1.isDefeated || this.p2.isDefeated || this.timer <= 0) {
                if (!this.winner) {
                    if (this.p1.isDefeated && !this.p2.isDefeated) {
                        this.winner = this.p2.name;
                    } else if (this.p2.isDefeated && !this.p1.isDefeated) {
                        this.winner = this.p1.name;
                    } else {
                        this.winner = this.p1.health > this.p2.health ? this.p1.name : (this.p2.health > this.p1.health ? this.p2.name : 'DRAW');
                    }
                    this.roundMessage = this.winner === 'DRAW' ? 'DRAW GAME!' : `${this.winner} WINS!`;
                    this.messageTimer = 180;
                }
            }

            if (this.messageTimer > 0) {
                this.messageTimer--;
                if (this.messageTimer <= 0 && this.winner) {
                    this.state = 'GAMEOVER';
                }
            }
        }

        // Update particle FX
        if (window.particleSystem) {
            window.particleSystem.update();
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.save();

        // Apply screen shake
        if (window.particleSystem && window.particleSystem.screenShake > 0) {
            const shake = window.particleSystem.screenShake;
            ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        }

        // Render current stage backdrop
        this.renderStage(ctx);

        if (this.state === 'MENU') {
            this.renderMenu(ctx);
        } else if (this.state === 'SELECT') {
            this.renderSelect(ctx);
        } else if (this.state === 'FIGHT' || this.state === 'GAMEOVER') {
            // Render Fighters
            if (this.p1) this.p1.draw(ctx);
            if (this.p2) this.p2.draw(ctx);

            // Render Projectiles & Beams
            if (window.projectileManager) {
                window.projectileManager.render(ctx);
            }

            // Render Particles & Auras
            if (window.particleSystem) {
                window.particleSystem.render(ctx);
            }

            // Render Fighter HUD & Meters
            this.renderHUD(ctx);

            // Render Round messages (FIGHT, KO, WINS)
            if (this.messageTimer > 0) {
                ctx.save();
                ctx.font = 'bold 36px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.lineWidth = 6;
                ctx.strokeStyle = '#000000';
                ctx.strokeText(this.roundMessage, this.width / 2, this.height / 2 - 20);
                ctx.fillStyle = '#ffea00';
                ctx.fillText(this.roundMessage, this.width / 2, this.height / 2 - 20);
                ctx.restore();
            }

            if (this.state === 'GAMEOVER') {
                this.renderGameOver(ctx);
            }
        }

        ctx.restore();
    }

    renderStage(ctx) {
        switch (this.currentStage) {
            case 'tournament':
                // World Martial Arts Tournament Stage
                ctx.fillStyle = '#65a5d1'; // Sky
                ctx.fillRect(0, 0, this.width, 100);

                // Mountain peaks in distance
                ctx.fillStyle = '#3f729b';
                ctx.beginPath();
                ctx.moveTo(0, 100);
                ctx.lineTo(80, 50);
                ctx.lineTo(190, 100);
                ctx.lineTo(290, 40);
                ctx.lineTo(420, 100);
                ctx.lineTo(540, 55);
                ctx.lineTo(640, 100);
                ctx.fill();

                // Tournament Ring (Stone tiles with border)
                ctx.fillStyle = '#cfb997'; // Stone ring
                ctx.fillRect(0, 100, this.width, this.height - 100);

                // Tile grid lines
                ctx.strokeStyle = '#a89070';
                ctx.lineWidth = 1.5;
                for (let x = 0; x < this.width; x += 40) {
                    ctx.beginPath();
                    ctx.moveTo(x, 100);
                    ctx.lineTo(x, this.height);
                    ctx.stroke();
                }
                for (let y = 100; y < this.height; y += 30) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(this.width, y);
                    ctx.stroke();
                }

                // Ring edge red border
                ctx.fillStyle = '#b82b2b';
                ctx.fillRect(0, 96, this.width, 6);
                break;

            case 'wasteland':
                // Canyon Wasteland
                ctx.fillStyle = '#e89b4f'; // Sunset sky
                ctx.fillRect(0, 0, this.width, 110);

                ctx.fillStyle = '#8f4f20'; // Distant canyon rocks
                ctx.fillRect(0, 80, this.width, 30);
                ctx.fillRect(60, 45, 70, 50);
                ctx.fillRect(450, 40, 90, 60);

                ctx.fillStyle = '#c57835'; // Sandy dirt ground
                ctx.fillRect(0, 110, this.width, this.height - 110);

                // Ground craters & cracks
                ctx.fillStyle = '#9b5820';
                ctx.fillRect(120, 180, 50, 14);
                ctx.fillRect(400, 260, 70, 18);
                break;

            case 'namek':
                // Planet Namek
                ctx.fillStyle = '#56bf9b'; // Greenish sky
                ctx.fillRect(0, 0, this.width, 100);

                // Two Namekian suns
                ctx.fillStyle = '#fff4a3';
                ctx.beginPath();
                ctx.arc(140, 45, 22, 0, Math.PI * 2);
                ctx.arc(480, 35, 14, 0, Math.PI * 2);
                ctx.fill();

                // Namekian vibrant blue grass & islands
                ctx.fillStyle = '#2db87d';
                ctx.fillRect(0, 100, this.width, this.height - 100);

                // Blue lakes
                ctx.fillStyle = '#228ba8';
                ctx.beginPath();
                ctx.ellipse(320, 140, 90, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'chamber':
                // Hyperbolic Time Chamber
                ctx.fillStyle = '#ffffff'; // Endless white void
                ctx.fillRect(0, 0, this.width, this.height);

                // Floor horizon
                ctx.strokeStyle = '#d6d6e2';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 110);
                ctx.lineTo(this.width, 110);
                ctx.stroke();

                // Hourglass dome in distance
                ctx.fillStyle = '#d4af37';
                ctx.fillRect(290, 75, 60, 35);
                ctx.beginPath();
                ctx.arc(320, 75, 30, Math.PI, 0);
                ctx.fill();
                break;
        }
    }

    renderHUD(ctx) {
        if (!this.p1 || !this.p2) return;

        const barWidth = 210;
        const barHeight = 16;
        const topY = 16;

        // Player 1 HUD (Left)
        this.renderFighterBars(ctx, this.p1, 24, topY, barWidth, barHeight, false);

        // Player 2 HUD (Right)
        this.renderFighterBars(ctx, this.p2, this.width - 24 - barWidth, topY, barWidth, barHeight, true);

        // Center Timer
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.width / 2 - 24, 12, 48, 32);
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.width / 2 - 24, 12, 48, 32);

        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.fillStyle = this.timer <= 10 ? '#ff0033' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(Math.max(0, this.timer).toString().padStart(2, '0'), this.width / 2, 35);
        ctx.restore();
    }

    renderFighterBars(ctx, fighter, x, y, width, height, isRight) {
        ctx.save();

        // Portrait & Name
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = isRight ? 'right' : 'left';
        ctx.fillText(fighter.name + (fighter.isAI ? ' (CPU)' : ''), isRight ? x + width : x, y - 4);

        // Health Bar Background
        ctx.fillStyle = '#222222';
        ctx.fillRect(x, y, width, height);

        // Health fill
        const hpPercent = Math.max(0, fighter.health / fighter.maxHealth);
        const hpWidth = width * hpPercent;
        const hpColor = hpPercent > 0.5 ? '#00e676' : (hpPercent > 0.25 ? '#ffea00' : '#ff1744');
        ctx.fillStyle = hpColor;

        if (isRight) {
            ctx.fillRect(x + (width - hpWidth), y, hpWidth, height);
        } else {
            ctx.fillRect(x, y, hpWidth, height);
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, width, height);

        // Ki Bar (Below health bar)
        const kiY = y + height + 4;
        const kiHeight = 8;
        ctx.fillStyle = '#111111';
        ctx.fillRect(x, kiY, width, kiHeight);

        const kiPercent = Math.max(0, fighter.ki / fighter.maxKi);
        const kiWidth = width * kiPercent;
        ctx.fillStyle = kiPercent >= 0.35 ? '#00e1ff' : '#0077aa';

        if (isRight) {
            ctx.fillRect(x + (width - kiWidth), kiY, kiWidth, kiHeight);
        } else {
            ctx.fillRect(x, kiY, kiWidth, kiHeight);
        }

        ctx.strokeStyle = '#4488aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, kiY, width, kiHeight);

        // Combo Counter
        if (fighter.comboStep > 1) {
            ctx.font = 'italic bold 16px "Courier New", monospace';
            ctx.fillStyle = '#ffeb3b';
            ctx.textAlign = isRight ? 'right' : 'left';
            ctx.fillText(`${fighter.comboStep} HITS!`, isRight ? x + width : x, kiY + 22);
        }

        ctx.restore();
    }

    renderMenu(ctx) {
        ctx.save();

        // Dark overlay
        ctx.fillStyle = 'rgba(10, 10, 20, 0.78)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Title
        ctx.font = '900 46px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff9900';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeText('KI CLASH', this.width / 2, 90);
        ctx.fillText('KI CLASH', this.width / 2, 90);

        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('SUPER DEVOLUTION ARENA', this.width / 2, 115);

        // Menu Options
        const optY = 190;
        ctx.font = 'bold 19px "Courier New", monospace';

        // 1P vs CPU
        if (this.mode === '1P_CPU') {
            ctx.fillStyle = '#ffe600';
            ctx.fillText('> 1 PLAYER VS CPU <', this.width / 2, optY);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText('  1 PLAYER VS CPU  ', this.width / 2, optY);
        }

        // 1P vs 2P Local
        if (this.mode === '1P_2P') {
            ctx.fillStyle = '#ffe600';
            ctx.fillText('> 2 PLAYERS (LOCAL) <', this.width / 2, optY + 36);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText('  2 PLAYERS (LOCAL)  ', this.width / 2, optY + 36);
        }

        // Controls info
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Use W/S or UP/DOWN to choose - Press ENTER / J to START', this.width / 2, 305);
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('Gamepad / Controller Supported!', this.width / 2, 328);

        ctx.restore();
    }

    renderSelect(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 12, 26, 0.85)';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.font = '900 28px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe600';
        ctx.fillText('SELECT YOUR FIGHTER', this.width / 2, 50);

        // Character selection boxes
        const boxWidth = 90;
        const boxHeight = 120;
        const startX = (this.width - (this.charList.length * (boxWidth + 14))) / 2;

        this.charList.forEach((key, idx) => {
            const bx = startX + idx * (boxWidth + 14);
            const by = 85;
            const char = FighterRenderer.CHARACTERS[key];

            const isP1 = (this.selectIndexP1 === idx);
            const isP2 = (this.selectIndexP2 === idx);

            ctx.fillStyle = (isP1 || isP2) ? '#2a3560' : '#141828';
            ctx.fillRect(bx, by, boxWidth, boxHeight);

            ctx.strokeStyle = isP1 && isP2 ? '#ffea00' : (isP1 ? '#00e1ff' : (isP2 ? '#ff1744' : '#444455'));
            ctx.lineWidth = (isP1 || isP2) ? 3 : 1.5;
            ctx.strokeRect(bx, by, boxWidth, boxHeight);

            // Preview sprite
            ctx.save();
            const dummy = { charKey: key };
            window.fighterRenderer.draw(ctx, dummy, bx + boxWidth / 2, by + 70, 1, 'idle', Date.now() * 0.005);
            ctx.restore();

            // Name
            ctx.font = 'bold 12px "Courier New", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(char.name, bx + boxWidth / 2, by + 105);

            // Badges
            if (isP1) {
                ctx.fillStyle = '#00e1ff';
                ctx.fillText('P1', bx + 16, by + 20);
            }
            if (isP2) {
                ctx.fillStyle = '#ff1744';
                ctx.fillText(this.mode === '1P_CPU' ? 'CPU' : 'P2', bx + boxWidth - 18, by + 20);
            }
        });

        // Stage selector
        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`STAGE: [T] ${this.currentStage.toUpperCase()}`, this.width / 2, 235);

        // Control instructions
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('P1 Select: [A] / [D]   |   P2 Select: [LEFT] / [RIGHT]', this.width / 2, 275);
        ctx.fillStyle = '#ffea00';
        ctx.fillText('Press [ENTER] or [J] to START BATTLE', this.width / 2, 305);

        ctx.restore();
    }

    renderGameOver(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe600';
        ctx.fillText('K.O.!', this.width / 2, 130);

        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${this.winner} WINS!`, this.width / 2, 180);

        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('Press [ENTER] or [J] to Return to Character Select', this.width / 2, 250);
        ctx.restore();
    }
}

window.addEventListener('load', () => {
    window.game = new KiClashGame();
});
