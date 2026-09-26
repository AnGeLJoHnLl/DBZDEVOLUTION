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
        this.isPaused = false;

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

        // Keys tracking & Configurable Keybindings
        this.keys = {};
        this.initKeybindings();
        this.setupInputs();

        // Gamepad tracking
        this.gamepadConnected = false;

        // Camera
        this.camera = { x: 0, y: 0 };

        // Start Loop
        requestAnimationFrame((t) => this.loop(t));
    }

    initKeybindings() {
        this.defaultBindings = {
            p1: {
                up: 'KeyW',
                down: 'KeyS',
                left: 'KeyA',
                right: 'KeyD',
                attack: 'KeyJ',
                kiBlast: 'KeyK',
                beam: 'KeyL',
                charge: 'Space',
                dash: 'ShiftLeft',
                guard: 'KeyU'
            },
            p2: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                attack: 'Numpad1',
                kiBlast: 'Numpad2',
                beam: 'Numpad3',
                charge: 'Numpad0',
                dash: 'NumpadDecimal',
                guard: 'Numpad4'
            }
        };

        this.keyBindings = JSON.parse(JSON.stringify(this.defaultBindings));

        // Load saved custom bindings
        try {
            const saved = localStorage.getItem('ki_clash_keybindings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.p1 && parsed.p2) {
                    this.keyBindings = parsed;
                }
            }
        } catch (e) {}
    }

    saveKeybindings() {
        try {
            localStorage.setItem('ki_clash_keybindings', JSON.stringify(this.keyBindings));
        } catch (e) {}
    }

    resetDefaultKeybindings() {
        this.keyBindings = JSON.parse(JSON.stringify(this.defaultBindings));
        this.saveKeybindings();
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => {
            // Check if settings modal is open and waiting for a key remap
            if (window.activeRemap) {
                e.preventDefault();
                window.finishRemap(e.code);
                return;
            }

            // ESC opens/closes settings modal
            if (e.code === 'Escape') {
                e.preventDefault();
                window.toggleSettingsModal();
                return;
            }

            this.keys[e.code] = true;
            if (window.soundEngine) window.soundEngine.resume();

            // Menu interactions
            if (this.state === 'MENU' && !this.isPaused) {
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
            } else if (this.state === 'SELECT' && !this.isPaused) {
                // P1 selection: A/D
                if (e.code === this.keyBindings.p1.left || e.code === 'KeyA') {
                    this.selectIndexP1 = (this.selectIndexP1 - 1 + this.charList.length) % this.charList.length;
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p1.right || e.code === 'KeyD') {
                    this.selectIndexP1 = (this.selectIndexP1 + 1) % this.charList.length;
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                }

                // P2 selection: Left/Right arrows
                if (e.code === this.keyBindings.p2.left || e.code === 'ArrowLeft') {
                    this.selectIndexP2 = (this.selectIndexP2 - 1 + this.charList.length) % this.charList.length;
                    this.p2Char = this.charList[this.selectIndexP2];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p2.right || e.code === 'ArrowRight') {
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
                if (e.code === 'Enter' || e.code === this.keyBindings.p1.attack || e.code === 'KeyJ') {
                    this.startFight();
                }
            } else if (this.state === 'GAMEOVER' && !this.isPaused) {
                if (e.code === 'Enter' || e.code === this.keyBindings.p1.attack || e.code === 'KeyJ') {
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
        const b1 = this.keyBindings.p1;
        const b2 = this.keyBindings.p2;

        // Player 1 Controls (customizable bindings)
        this.p1.input.up = !!(this.keys[b1.up]);
        this.p1.input.down = !!(this.keys[b1.down]);
        this.p1.input.left = !!(this.keys[b1.left]);
        this.p1.input.right = !!(this.keys[b1.right]);
        this.p1.input.attack = !!(this.keys[b1.attack]);
        this.p1.input.kiBlast = !!(this.keys[b1.kiBlast]);
        this.p1.input.beam = !!(this.keys[b1.beam]);
        this.p1.input.charge = !!(this.keys[b1.charge]);
        this.p1.input.dash = !!(this.keys[b1.dash]);
        this.p1.input.guard = !!(this.keys[b1.guard]);

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

        // Player 2 Controls (customizable bindings, only if Human 2P)
        if (!this.p2.isAI) {
            this.p2.input.up = !!(this.keys[b2.up]);
            this.p2.input.down = !!(this.keys[b2.down]);
            this.p2.input.left = !!(this.keys[b2.left]);
            this.p2.input.right = !!(this.keys[b2.right]);
            this.p2.input.attack = !!(this.keys[b2.attack]);
            this.p2.input.kiBlast = !!(this.keys[b2.kiBlast]);
            this.p2.input.beam = !!(this.keys[b2.beam]);
            this.p2.input.charge = !!(this.keys[b2.charge]);
            this.p2.input.dash = !!(this.keys[b2.dash]);
            this.p2.input.guard = !!(this.keys[b2.guard]);

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

    loop() {
        requestAnimationFrame(() => this.loop());

        // Update physics & game logic if not paused
        if (!this.isPaused) {
            this.update();
        }

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

        // Render Pause overlay if settings modal is open
        if (this.isPaused) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffe600';
            ctx.fillText('PAUSA - AJUSTES ABIERTOS', this.width / 2, this.height / 2);
            ctx.restore();
        }

        ctx.restore();
    }

    renderStage(ctx) {
        switch (this.currentStage) {
            case 'tournament':
                ctx.fillStyle = '#65a5d1';
                ctx.fillRect(0, 0, this.width, 100);

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

                ctx.fillStyle = '#cfb997';
                ctx.fillRect(0, 100, this.width, this.height - 100);

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

                ctx.fillStyle = '#b82b2b';
                ctx.fillRect(0, 96, this.width, 6);
                break;

            case 'wasteland':
                ctx.fillStyle = '#e89b4f';
                ctx.fillRect(0, 0, this.width, 110);

                ctx.fillStyle = '#8f4f20';
                ctx.fillRect(0, 80, this.width, 30);
                ctx.fillRect(60, 45, 70, 50);
                ctx.fillRect(450, 40, 90, 60);

                ctx.fillStyle = '#c57835';
                ctx.fillRect(0, 110, this.width, this.height - 110);

                ctx.fillStyle = '#9b5820';
                ctx.fillRect(120, 180, 50, 14);
                ctx.fillRect(400, 260, 70, 18);
                break;

            case 'namek':
                ctx.fillStyle = '#56bf9b';
                ctx.fillRect(0, 0, this.width, 100);

                ctx.fillStyle = '#fff4a3';
                ctx.beginPath();
                ctx.arc(140, 45, 22, 0, Math.PI * 2);
                ctx.arc(480, 35, 14, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#2db87d';
                ctx.fillRect(0, 100, this.width, this.height - 100);

                ctx.fillStyle = '#228ba8';
                ctx.beginPath();
                ctx.ellipse(320, 140, 90, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'chamber':
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, this.width, this.height);

                ctx.strokeStyle = '#d6d6e2';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 110);
                ctx.lineTo(this.width, 110);
                ctx.stroke();

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

        this.renderFighterBars(ctx, this.p1, 24, topY, barWidth, barHeight, false);
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

        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = isRight ? 'right' : 'left';
        ctx.fillText(fighter.name + (fighter.isAI ? ' (CPU)' : ''), isRight ? x + width : x, y - 4);

        ctx.fillStyle = '#222222';
        ctx.fillRect(x, y, width, height);

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
        ctx.fillStyle = 'rgba(10, 10, 20, 0.78)';
        ctx.fillRect(0, 0, this.width, this.height);

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

        const optY = 190;
        ctx.font = 'bold 19px "Courier New", monospace';

        if (this.mode === '1P_CPU') {
            ctx.fillStyle = '#ffe600';
            ctx.fillText('> 1 JUGADOR VS CPU <', this.width / 2, optY);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText('  1 JUGADOR VS CPU  ', this.width / 2, optY);
        }

        if (this.mode === '1P_2P') {
            ctx.fillStyle = '#ffe600';
            ctx.fillText('> 2 JUGADORES (LOCAL) <', this.width / 2, optY + 36);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText('  2 JUGADORES (LOCAL)  ', this.width / 2, optY + 36);
        }

        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Usa W/S o ARRIBA/ABAJO - Pulsa ENTER o J para INICIAR', this.width / 2, 305);
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('Presiona [ESC] o el boton ⚙️ para AJUSTES y CONFIGURAR TECLAS', this.width / 2, 328);

        ctx.restore();
    }

    renderSelect(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 12, 26, 0.85)';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.font = '900 28px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe600';
        ctx.fillText('ELIGE TU LUCHADOR', this.width / 2, 50);

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

            ctx.save();
            const dummy = { charKey: key };
            window.fighterRenderer.draw(ctx, dummy, bx + boxWidth / 2, by + 70, 1, 'idle', Date.now() * 0.005);
            ctx.restore();

            ctx.font = 'bold 12px "Courier New", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(char.name, bx + boxWidth / 2, by + 105);

            if (isP1) {
                ctx.fillStyle = '#00e1ff';
                ctx.fillText('P1', bx + 16, by + 20);
            }
            if (isP2) {
                ctx.fillStyle = '#ff1744';
                ctx.fillText(this.mode === '1P_CPU' ? 'CPU' : 'P2', bx + boxWidth - 18, by + 20);
            }
        });

        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`ESCENARIO: [T] ${this.currentStage.toUpperCase()}`, this.width / 2, 235);

        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('P1: [A]/[D] o Izq/Der   |   P2: [FLECHAS] Izq/Der', this.width / 2, 275);
        ctx.fillStyle = '#ffea00';
        ctx.fillText('Pulsa [ENTER] o [J] para PELEAR', this.width / 2, 305);

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
        ctx.fillText(`${this.winner} GANA!`, this.width / 2, 180);

        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('Pulsa [ENTER] o [J] para volver al selector de personajes', this.width / 2, 250);
        ctx.restore();
    }
}

window.addEventListener('load', () => {
    window.game = new KiClashGame();
});
