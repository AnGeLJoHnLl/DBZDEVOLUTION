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
        this.mode = '1P_CPU';
        this.currentStage = 'tournament';
        this.isPaused = false;

        // Roster of 64 Legendary Fighters (4 Rows x 16 Columns)
        this.charList = [
            // Row 1: Earth Defenders & Classic Era (16)
            'goku', 'vegeta', 'gohan', 'future_gohan', 'trunks', 'piccolo', 'krillin', 'yamcha', 'tien', 'chaoz', 'roshi', 'kid_goku', 'tao', 'king_piccolo', 'tapion', 'pikkon',
            // Row 2: Saiyans, Frieza Force, Androids & GT Bosses (16)
            'raditz', 'nappa', 'bardock', 'ginyu', 'recoome', 'zarbon', 'frieza', 'cooler', 'a16', 'a17', 'a18', 'cell', 'super_17', 'baby_vegeta', 'omega_shenron', 'dbs_broly',
            // Row 3: Majin, Fusions, Movie Villains & Multiverse (16)
            'dabura', 'buu', 'kid_buu', 'majin_vegeta', 'ultimate_gohan', 'gotenks', 'vegito', 'ssb_vegito', 'gogeta', 'ssb_gogeta', 'kefla', 'broly', 'janemba', 'turles', 'bojack', 'zamasu_fused',
            // Row 4: Super, Gods, Manga & GT (16)
            'beerus', 'whis', 'golden_frieza', 'black', 'hit', 'jiren', 'toppo', 'moro', 'granolah', 'goku_ui', 'vegeta_ue', 'gohan_beast', 'orange_piccolo', 'ssj4_goku', 'ssj4_vegeta', 'ssj4_gogeta'
        ];

        this.selectIndexP1 = 0; // Goku
        this.selectIndexP2 = 1; // Vegeta
        this.p1Char = this.charList[this.selectIndexP1];
        this.p2Char = this.charList[this.selectIndexP2];

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
        this.transformBanner = null;

        // Global reference for fighter interactions
        window.gameInstance = this;

        // Keys tracking & Configurable Keybindings
        this.keys = {};
        this.initKeybindings();
        this.setupInputs();

        // Gamepad tracking
        this.gamepadConnected = false;

        // Camera
        this.camera = { x: 0, y: 0 };

        // Start Loop
        requestAnimationFrame(() => this.loop());
    }

    setTransformBanner(fighter, oldName, newName) {
        this.transformBanner = {
            fighterId: fighter.id,
            oldName: oldName,
            newName: newName,
            timer: 90,
            auraColor: fighter.charConfig.auraColor || '#ffe600'
        };
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
            if (window.activeRemap) {
                e.preventDefault();
                window.finishRemap(e.code);
                return;
            }

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
                // 4x16 Grid Navigation for P1 (W, A, S, D)
                const COLS = 16;
                const ROWS = 4;
                const TOTAL = COLS * ROWS;

                if (e.code === this.keyBindings.p1.left || e.code === 'KeyA') {
                    const row = Math.floor(this.selectIndexP1 / COLS);
                    const col = this.selectIndexP1 % COLS;
                    this.selectIndexP1 = row * COLS + ((col - 1 + COLS) % COLS);
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p1.right || e.code === 'KeyD') {
                    const row = Math.floor(this.selectIndexP1 / COLS);
                    const col = this.selectIndexP1 % COLS;
                    this.selectIndexP1 = row * COLS + ((col + 1) % COLS);
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p1.up || e.code === 'KeyW') {
                    this.selectIndexP1 = (this.selectIndexP1 - COLS + TOTAL) % TOTAL;
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p1.down || e.code === 'KeyS') {
                    this.selectIndexP1 = (this.selectIndexP1 + COLS) % TOTAL;
                    this.p1Char = this.charList[this.selectIndexP1];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                }

                // 4x16 Grid Navigation for P2 (Arrow Keys)
                if (e.code === this.keyBindings.p2.left || e.code === 'ArrowLeft') {
                    const row = Math.floor(this.selectIndexP2 / COLS);
                    const col = this.selectIndexP2 % COLS;
                    this.selectIndexP2 = row * COLS + ((col - 1 + COLS) % COLS);
                    this.p2Char = this.charList[this.selectIndexP2];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p2.right || e.code === 'ArrowRight') {
                    const row = Math.floor(this.selectIndexP2 / COLS);
                    const col = this.selectIndexP2 % COLS;
                    this.selectIndexP2 = row * COLS + ((col + 1) % COLS);
                    this.p2Char = this.charList[this.selectIndexP2];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p2.up || e.code === 'ArrowUp') {
                    this.selectIndexP2 = (this.selectIndexP2 - COLS + TOTAL) % TOTAL;
                    this.p2Char = this.charList[this.selectIndexP2];
                    if (window.soundEngine) window.soundEngine.playHit(false);
                } else if (e.code === this.keyBindings.p2.down || e.code === 'ArrowDown') {
                    this.selectIndexP2 = (this.selectIndexP2 + COLS) % TOTAL;
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

        // Mouse click and touchscreen selection support
        this.canvas.addEventListener('click', (e) => {
            if (this.isPaused) return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            if (this.state === 'TITLE') {
                if (my >= 220 && my <= 270) {
                    this.mode = my < 245 ? '1P_CPU' : '2P_LOCAL';
                }
                this.state = 'SELECT';
                if (window.soundEngine) window.soundEngine.playHit(true);
            } else if (this.state === 'SELECT') {
                const COLS = 16;
                const ROWS = 4;
                const boxW = 36;
                const boxH = 42;
                const gapX = 3;
                const gapY = 3;
                const totalW = COLS * boxW + (COLS - 1) * gapX;
                const startX = Math.floor((this.width - totalW) / 2);
                const startY = 24;

                if (mx >= startX && mx <= startX + totalW && my >= startY && my <= startY + ROWS * (boxH + gapY)) {
                    const c = Math.floor((mx - startX) / (boxW + gapX));
                    const r = Math.floor((my - startY) / (boxH + gapY));
                    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
                        const idx = r * COLS + c;
                        if (idx < this.charList.length) {
                            if (e.shiftKey) {
                                this.selectIndexP2 = idx;
                                this.p2Char = this.charList[this.selectIndexP2];
                            } else {
                                this.selectIndexP1 = idx;
                                this.p1Char = this.charList[this.selectIndexP1];
                            }
                            if (window.soundEngine) window.soundEngine.playHit(false);
                        }
                    }
                } else if (my >= 208 && my <= 354) {
                    if (mx >= 206 && mx <= 434) {
                        if (my >= 295) {
                            this.startFight();
                        } else {
                            const stages = ['tournament', 'wasteland', 'namek', 'chamber'];
                            const sIdx = (stages.indexOf(this.currentStage) + 1) % stages.length;
                            this.currentStage = stages[sIdx];
                            if (window.soundEngine) window.soundEngine.playHit(false);
                        }
                    }
                }
            } else if (this.state === 'GAMEOVER') {
                this.state = 'SELECT';
                if (window.soundEngine) window.soundEngine.playHit(false);
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

        // Player 1 Controls
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

        // Gamepad 1 for Player 1
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        if (gamepads && gamepads[0]) {
            const pad = gamepads[0];
            const threshold = 0.35;
            if (pad.axes[0] < -threshold || pad.buttons[14]?.pressed) this.p1.input.left = true;
            if (pad.axes[0] > threshold || pad.buttons[15]?.pressed) this.p1.input.right = true;
            if (pad.axes[1] < -threshold || pad.buttons[12]?.pressed) this.p1.input.up = true;
            if (pad.axes[1] > threshold || pad.buttons[13]?.pressed) this.p1.input.down = true;

            if (pad.buttons[2]?.pressed) this.p1.input.attack = true;
            if (pad.buttons[0]?.pressed) this.p1.input.kiBlast = true;
            if (pad.buttons[1]?.pressed) this.p1.input.beam = true;
            if (pad.buttons[3]?.pressed) this.p1.input.guard = true;
            if (pad.buttons[4]?.pressed || pad.buttons[6]?.pressed) this.p1.input.charge = true;
            if (pad.buttons[5]?.pressed || pad.buttons[7]?.pressed) this.p1.input.dash = true;
        }

        // Player 2 Controls
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

        if (!this.isPaused) {
            this.update();
        }

        this.render();
    }

    update() {
        if (this.state === 'FIGHT') {
            this.updateInputs();

            this.timerFrame++;
            if (this.timerFrame >= 60) {
                this.timerFrame = 0;
                if (this.timer > 0) this.timer--;
            }

            this.p1.update(this.width, this.height, this.p2);
            this.p2.update(this.width, this.height, this.p1);

            if (window.projectileManager) {
                window.projectileManager.update(this.width, this.height, this.fighters);
            }

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

        if (window.particleSystem) {
            window.particleSystem.update();
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.save();

        if (window.particleSystem && window.particleSystem.screenShake > 0) {
            const shake = window.particleSystem.screenShake;
            ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        }

        this.renderStage(ctx);

        if (this.state === 'MENU') {
            this.renderMenu(ctx);
        } else if (this.state === 'SELECT') {
            this.renderSelect(ctx);
        } else if (this.state === 'FIGHT' || this.state === 'GAMEOVER') {
            if (this.p1) this.p1.draw(ctx);
            if (this.p2) this.p2.draw(ctx);

            if (window.projectileManager) {
                window.projectileManager.render(ctx);
            }

            if (window.particleSystem) {
                window.particleSystem.render(ctx);
            }

            this.renderHUD(ctx);

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

        // Active Transformation Banner Across Screen
        if (this.transformBanner && this.transformBanner.timer > 0) {
            this.transformBanner.timer--;
            const tb = this.transformBanner;
            const alpha = Math.min(1, tb.timer / 20);
            ctx.save();
            ctx.globalAlpha = alpha;

            // Background banner stripe
            ctx.fillStyle = 'rgba(8, 12, 26, 0.88)';
            ctx.fillRect(0, 118, this.width, 42);
            ctx.strokeStyle = tb.auraColor || '#ffe600';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 118, this.width, 42);

            // Shimmer border accents
            ctx.fillStyle = tb.auraColor || '#ffe600';
            ctx.fillRect(0, 118, this.width, 2.5);
            ctx.fillRect(0, 158, this.width, 2.5);

            // Banner Title
            ctx.textAlign = 'center';
            ctx.font = '900 15px "Impact", "Arial Black", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`⚡ ¡${tb.newName} HA DESPERTADO! ⚡`, this.width / 2, 145);

            ctx.restore();
            if (this.transformBanner.timer <= 0) {
                this.transformBanner = null;
            }
        }
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

        // Transformation indicator or charging bar
        if (fighter.canTransform && !fighter.isDefeated) {
            const promptY = kiY + 16;
            if (fighter.transformProgress > 0) {
                // Charging transform progress bar
                const barP = Math.min(1, fighter.transformProgress);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(x, promptY - 7, width, 9);
                ctx.fillStyle = '#ffea00';
                ctx.fillRect(x + 1, promptY - 6, (width - 2) * barP, 7);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, promptY - 7, width, 9);

                ctx.font = 'bold 7.5px "Courier New", monospace';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText('⚡ ¡TRANSFORMANDO...! ⚡', x + width / 2, promptY);
            } else if (fighter.ki >= fighter.maxKi) {
                // Flashing transformation prompt
                const pulse = Math.floor(Date.now() / 240) % 2 === 0;
                ctx.font = 'bold 8px "Courier New", monospace';
                ctx.fillStyle = pulse ? '#ffea00' : '#ffffff';
                ctx.textAlign = isRight ? 'right' : 'left';
                ctx.fillText('⚡ MANTÉN CARGAR: TRANSFORMAR', isRight ? x + width : x, promptY);
            }
        }

        if (fighter.comboStep > 1) {
            ctx.font = 'italic bold 16px "Courier New", monospace';
            ctx.fillStyle = '#ffeb3b';
            ctx.textAlign = isRight ? 'right' : 'left';
            ctx.fillText(`${fighter.comboStep} HITS!`, isRight ? x + width : x, kiY + 28);
        }

        ctx.restore();
    }

    renderMenu(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 10, 20, 0.82)';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.font = '900 48px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff9900';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeText('KI CLASH', this.width / 2, 85);
        ctx.fillText('KI CLASH', this.width / 2, 85);

        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('SUPER DEVOLUTION ARENA (64 LUCHADORES)', this.width / 2, 110);

        const optY = 185;
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
        ctx.fillText('Usa W/S o ARRIBA/ABAJO - Pulsa ENTER o J para INICIAR', this.width / 2, 295);
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('Presiona [ESC] o ⚙️ para AJUSTES y CONFIGURAR TECLAS', this.width / 2, 320);

        ctx.restore();
    }

    renderSelect(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(6, 8, 18, 0.94)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Header Title
        ctx.font = '900 15px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe600';
        ctx.fillText('★ GRAN TORNEO MULTIVERSAL (64 LUCHADORES) ★', this.width / 2, 17);

        // 4x16 Character Selection Matrix
        const COLS = 16;
        const ROWS = 4;
        const boxW = 36;
        const boxH = 42;
        const gapX = 3;
        const gapY = 3;
        const totalW = COLS * boxW + (COLS - 1) * gapX;
        const startX = Math.floor((this.width - totalW) / 2);
        const startY = 24;

        this.charList.forEach((key, idx) => {
            const row = Math.floor(idx / COLS);
            const col = idx % COLS;
            const bx = startX + col * (boxW + gapX);
            const by = startY + row * (boxH + gapY);
            const char = FighterRenderer.CHARACTERS[key] || FighterRenderer.CHARACTERS.goku;

            const isP1 = (this.selectIndexP1 === idx);
            const isP2 = (this.selectIndexP2 === idx);

            // Card background
            ctx.fillStyle = (isP1 || isP2) ? '#283660' : '#111524';
            ctx.fillRect(bx, by, boxW, boxH);

            // Card border
            ctx.strokeStyle = isP1 && isP2 ? '#ffea00' : (isP1 ? '#00e1ff' : (isP2 ? '#ff1744' : '#262f44'));
            ctx.lineWidth = (isP1 || isP2) ? 2 : 1;
            ctx.strokeRect(bx, by, boxW, boxH);

            // Character miniature sprite
            ctx.save();
            const dummy = { charKey: key };
            window.fighterRenderer.draw(ctx, dummy, bx + boxW / 2, by + 26, 1, 'idle', Date.now() * 0.005);
            ctx.restore();

            // Name
            ctx.font = 'bold 6px "Courier New", monospace';
            ctx.fillStyle = (isP1 || isP2) ? '#ffe600' : '#d0d8e8';
            ctx.textAlign = 'center';
            let shortName = char.name
                .replace('(SSJ2)', 'SS2')
                .replace('(U.I.)', 'UI')
                .replace('(U.E.)', 'UE')
                .replace('(SSJ3)', 'SS3')
                .replace('(SSB)', 'SSB')
                .replace('(H.O.D.)', 'GOD')
                .replace('(DBS)', 'DBS')
                .replace('MASTER ', 'M.')
                .replace('MERCENARY ', '')
                .replace('ANDROID ', 'A-')
                .replace('ULTIMATE ', 'ULT.')
                .replace('GOLDEN ', 'G.')
                .replace('ORANGE ', 'O.')
                .replace('KING ', 'K.')
                .replace('FUTURE ', 'F.')
                .replace('FUSED ', 'F.')
                .replace('BABY ', 'B.')
                .replace('SUPER ', 'S.')
                .replace('SHENRON', 'SHEN');
            ctx.fillText(shortName.substring(0, 8), bx + boxW / 2, by + 39);

            // Badges
            if (isP1) {
                ctx.fillStyle = '#00e1ff';
                ctx.font = 'bold 7.5px monospace';
                ctx.fillText('P1', bx + 6, by + 8);
            }
            if (isP2) {
                ctx.fillStyle = '#ff1744';
                ctx.font = 'bold 7.5px monospace';
                ctx.fillText(this.mode === '1P_CPU' ? 'CPU' : 'P2', bx + boxW - 6, by + 8);
            }
        });

        // Large Preview Panels for P1, Stage and P2 below the 4x12 grid
        const panelY = 208;
        const panelH = 146;
        const p1Data = FighterRenderer.CHARACTERS[this.p1Char] || FighterRenderer.CHARACTERS.goku;
        const p2Data = FighterRenderer.CHARACTERS[this.p2Char] || FighterRenderer.CHARACTERS.vegeta;

        // P1 Panel (Left)
        ctx.fillStyle = '#0e1326';
        ctx.fillRect(16, panelY, 185, panelH);
        ctx.strokeStyle = '#00e1ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, panelY, 185, panelH);

        ctx.save();
        const dummyP1 = { charKey: this.p1Char };
        window.fighterRenderer.draw(ctx, dummyP1, 52, panelY + 68, 1, 'idle', Date.now() * 0.005);
        ctx.restore();

        ctx.textAlign = 'left';
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText(p1Data.name, 84, panelY + 28);
        ctx.font = '9px "Courier New", monospace';
        ctx.fillStyle = '#a0b5d8';
        ctx.fillText(p1Data.title, 84, panelY + 44);
        ctx.fillStyle = '#ffe600';
        ctx.fillText('★ ' + p1Data.specialName, 24, panelY + 128);

        // Beam preview indicator for P1
        ctx.fillStyle = p1Data.beamColor || '#00e1ff';
        ctx.fillRect(24, panelY + 133, 40, 3);
        ctx.fillStyle = p1Data.beamCore || '#ffffff';
        ctx.fillRect(24, panelY + 134, 40, 1);

        // P2 / CPU Panel (Right)
        ctx.fillStyle = '#0e1326';
        ctx.fillRect(this.width - 16 - 185, panelY, 185, panelH);
        ctx.strokeStyle = '#ff1744';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.width - 16 - 185, panelY, 185, panelH);

        ctx.save();
        const dummyP2 = { charKey: this.p2Char };
        window.fighterRenderer.draw(ctx, dummyP2, this.width - 52, panelY + 68, -1, 'idle', Date.now() * 0.005);
        ctx.restore();

        ctx.textAlign = 'right';
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.fillStyle = '#ff1744';
        ctx.fillText(p2Data.name + (this.mode === '1P_CPU' ? ' (CPU)' : ''), this.width - 84, panelY + 28);
        ctx.font = '9px "Courier New", monospace';
        ctx.fillStyle = '#a0b5d8';
        ctx.fillText(p2Data.title, this.width - 84, panelY + 44);
        ctx.fillStyle = '#ffe600';
        ctx.fillText('★ ' + p2Data.specialName, this.width - 24, panelY + 128);

        // Beam preview indicator for P2
        ctx.fillStyle = p2Data.beamColor || '#ff0055';
        ctx.fillRect(this.width - 64, panelY + 133, 40, 3);
        ctx.fillStyle = p2Data.beamCore || '#ffffff';
        ctx.fillRect(this.width - 64, panelY + 134, 40, 1);

        // Center Stage Box
        ctx.fillStyle = '#111629';
        ctx.fillRect(206, panelY, 228, panelH);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(206, panelY, 228, panelH);

        ctx.textAlign = 'center';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.fillStyle = '#ffe600';
        ctx.fillText(`ESCENARIO: [T] o CLICK`, 320, panelY + 26);
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.currentStage.toUpperCase(), 320, panelY + 46);

        ctx.font = '9px "Courier New", monospace';
        ctx.fillStyle = '#8fa0c0';
        ctx.fillText('Haz click en cualquier personaje', 320, panelY + 74);
        ctx.fillText('o usa W/A/S/D o Flechas (4x16)', 320, panelY + 88);

        // Fight Button
        ctx.fillStyle = '#1a3355';
        ctx.fillRect(226, panelY + 104, 188, 30);
        ctx.strokeStyle = '#00e1ff';
        ctx.strokeRect(226, panelY + 104, 188, 30);

        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.fillStyle = '#00e1ff';
        ctx.fillText('▶ PULSA ENTER / J: PELEAR ◀', 320, panelY + 123);

        ctx.restore();
    }

    renderGameOver(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
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
