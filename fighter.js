// Fighter Entity & AI State Machine for Ki Clash
class Fighter {
    static TRANSFORMATIONS = {
        // Goku Lineage: Base -> SSJ -> Ultra Instinct
        'goku': 'goku_ssj',
        'goku_ssj': 'goku_ui',

        // Vegeta Lineage: Base -> SSJ -> Majin Vegeta -> Ultra Ego
        'vegeta': 'vegeta_ssj',
        'vegeta_ssj': 'majin_vegeta',
        'majin_vegeta': 'vegeta_ue',

        // Gohan Lineage: SSJ2 -> Ultimate -> Beast
        'gohan': 'ultimate_gohan',
        'ultimate_gohan': 'gohan_beast',

        // Trunks Lineage: Future Base -> SSJ Trunks
        'trunks': 'trunks_ssj',

        // Piccolo Lineage: Namekian -> Orange Piccolo Titan
        'piccolo': 'orange_piccolo',

        // Frieza Lineage: Final Form -> Golden Frieza
        'frieza': 'golden_frieza',

        // Fusions Lineage: Base/SSJ -> Godly Blue
        'vegito': 'ssb_vegito',
        'gogeta': 'ssb_gogeta',

        // GT Saiyans: SSJ4 Goku/Vegeta -> SSJ4 Gogeta
        'ssj4_goku': 'ssj4_gogeta',
        'ssj4_vegeta': 'ssj4_gogeta',

        // Majin Buu -> Kid Buu
        'buu': 'kid_buu',

        // Broly Z -> Broly DBS Full Power
        'broly': 'dbs_broly',

        // Goku Black -> Fused Zamasu
        'black': 'zamasu_fused',

        // Cooler -> Golden Frieza power
        'cooler': 'golden_frieza',

        // Future Gohan -> Ultimate Beast
        'future_gohan': 'gohan_beast'
    };

    constructor(config) {
        this.id = config.id || 1;
        this.charKey = config.charKey || 'goku';
        this.charConfig = FighterRenderer.CHARACTERS[this.charKey];
        this.name = this.charConfig.name;

        // Position & Physics
        this.x = config.x || 200;
        this.y = config.y || 250;
        this.vx = 0;
        this.vy = 0;
        this.facing = config.facing || 1; // 1 = right, -1 = left
        this.speed = 5.0;
        this.hitboxRadius = 16;

        // Vitals
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxKi = 100;
        this.ki = 45;

        // Transformation State
        this.canTransform = !!Fighter.TRANSFORMATIONS[this.charKey];
        this.nextFormKey = Fighter.TRANSFORMATIONS[this.charKey] || null;
        this.transformProgress = 0;
        this.damageMultiplier = 1.0;

        // State Machine
        this.state = 'idle';
        this.stateTimer = 0;
        this.animFrame = 0;
        this.comboStep = 0;
        this.comboResetTimer = 0;
        this.isDefeated = false;

        // Cooldowns & Timers
        this.dashCooldown = 0;
        this.attackCooldown = 0;
        this.stunTimer = 0;
        this.knockbackVx = 0;
        this.guardSoundTimer = 0;
        this.lastDashTap = 0;
        this.prevDashInput = false;
        this.prevAttackInput = false;

        // Control type
        this.isAI = !!config.isAI;
        this.aiDifficulty = config.aiDifficulty || 'normal';
        this.aiActionTimer = 0;
        this.aiDecision = null;

        // Input state (set by keyboard/gamepad/AI)
        this.input = {
            up: false, down: false, left: false, right: false,
            attack: false,
            kiBlast: false,
            beam: false,
            charge: false,
            dash: false,
            guard: false
        };
    }

    reset(x, y, facing) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;
        this.health = this.maxHealth;
        this.ki = 45;
        this.state = 'idle';
        this.stateTimer = 0;
        this.comboStep = 0;
        this.comboResetTimer = 0;
        this.isDefeated = false;
        this.stunTimer = 0;
        this.knockbackVx = 0;
        this.guardSoundTimer = 0;
        this.canTransform = !!Fighter.TRANSFORMATIONS[this.charKey];
        this.nextFormKey = Fighter.TRANSFORMATIONS[this.charKey] || null;
        this.transformProgress = 0;
        this.damageMultiplier = 1.0;
        if (window.soundEngine) window.soundEngine.stopCharge();
    }

    update(arenaWidth, arenaHeight, opponent) {
        if (this.isDefeated) {
            this.state = 'knockdown';
            return;
        }

        // Run AI decision tree if controlled by CPU
        if (this.isAI && opponent) {
            this.updateAI(opponent);
        }

        // Detect fresh button taps for responsive combos and Z-Vanish
        const dashJustPressed = this.input.dash && !this.prevDashInput;
        this.prevDashInput = this.input.dash;
        this.prevAttackInput = this.input.attack;

        // Animation frame increment
        this.animFrame += (this.state === 'dash' || this.state === 'walk') ? 0.28 : 0.2;

        // Cooldown decrements
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.guardSoundTimer > 0) this.guardSoundTimer--;
        if (this.lastDashTap > 0) this.lastDashTap--;
        if (this.comboResetTimer > 0) {
            this.comboResetTimer--;
            if (this.comboResetTimer <= 0) this.comboStep = 0;
        }

        // Stun & Knockback update
        if (this.stunTimer > 0) {
            // Active Guard Recovery: pressing/holding guard allows breaking out of hitstun into a solid block!
            if (this.input.guard) {
                this.state = 'guard';
                this.stunTimer = 0;
                this.knockbackVx = 0;
                this.vx = 0;
                this.vy = 0;
                if (window.particleSystem) {
                    window.particleSystem.createGuardFlash(this.x, this.y, '#00e1ff');
                    window.particleSystem.createHitSparks(this.x, this.y, '#00e1ff', 6);
                }
                if (window.soundEngine && this.guardSoundTimer <= 0) {
                    window.soundEngine.playGuard();
                    this.guardSoundTimer = 8;
                }
                return;
            }

            // Tech Evasion / Z-Recovery out of hitstun when pressing Dash with 10+ Ki
            if (dashJustPressed && this.dashCooldown <= 0 && this.ki >= 10) {
                this.ki -= 10;
                this.stunTimer = 0;
                this.knockbackVx = 0;
                this.startDash(opponent, true);
                return;
            }

            this.stunTimer--;
            this.x += this.knockbackVx;
            this.knockbackVx *= 0.88;

            // Wall Bounce check on heavy knockback
            const pad = 26;
            if ((this.x <= pad || this.x >= arenaWidth - pad) && Math.abs(this.knockbackVx) > 4.2) {
                this.knockbackVx = -this.knockbackVx * 0.6;
                if (window.particleSystem) {
                    window.particleSystem.addScreenShake(10);
                    window.particleSystem.createLandingDust(this.x, this.y);
                    window.particleSystem.createHitSparks(this.x, this.y, '#ffea00', 12);
                }
                if (window.soundEngine) {
                    window.soundEngine.playHit(true);
                }
            }

            this.clampPosition(arenaWidth, arenaHeight);
            if (this.stunTimer <= 0) {
                this.state = 'idle';
                this.comboStep = 0;
            }
            return;
        }

        // Automatically face opponent when in neutral or movement states
        if (opponent && (this.state === 'idle' || this.state === 'walk' || this.state === 'guard' || this.state === 'charge')) {
            this.facing = opponent.x >= this.x ? 1 : -1;
        }

        // State Machine Handling
        switch (this.state) {
            case 'idle':
            case 'walk':
                this.handleMovementAndActions(opponent, dashJustPressed);
                break;

            case 'dash':
                this.stateTimer--;
                this.x += this.vx;
                this.y += this.vy;
                if (window.particleSystem) {
                    if (Math.random() > 0.25) {
                        window.particleSystem.addAfterimage(this);
                    }
                    if (Math.random() > 0.3) {
                        window.particleSystem.createSpeedStreak(this.x, this.y, this.facing, this.charConfig.auraColor);
                    }
                }
                // Dash-Attack (Sonic Rush Strike): press Attack during dash to execute a flying lunge strike!
                if (this.input.attack && this.attackCooldown <= 0) {
                    if (opponent) this.facing = opponent.x >= this.x ? 1 : -1;
                    this.performMeleeAttack(opponent, true);
                    break;
                }
                // Guard cancel out of dash
                if (this.input.guard && this.stateTimer < 7) {
                    this.state = 'guard';
                    this.vx *= 0.25;
                    this.vy *= 0.25;
                    break;
                }
                if (this.stateTimer <= 0) {
                    // Preserve smooth momentum instead of stopping abruptly
                    this.vx *= 0.55;
                    this.vy *= 0.55;
                    this.state = (this.input.left || this.input.right || this.input.up || this.input.down) ? 'walk' : 'idle';
                }
                break;

            case 'charge':
                // Allow instant Dash or Guard cancel out of Charge!
                if (this.input.guard) {
                    this.state = 'guard';
                    this.transformProgress = 0;
                    if (window.soundEngine) window.soundEngine.stopCharge();
                    break;
                }
                if (this.input.dash && this.dashCooldown <= 0) {
                    this.transformProgress = 0;
                    if (window.soundEngine) window.soundEngine.stopCharge();
                    this.startDash(opponent, false);
                    break;
                }
                if (this.input.charge) {
                    this.ki = Math.min(this.maxKi, this.ki + 0.72);
                    if (window.particleSystem) {
                        window.particleSystem.createAura(this.x, this.y, this.charConfig.auraColor, 2);
                        if (Math.random() > 0.75) {
                            window.particleSystem.createChargeGroundPulse(this.x, this.y, this.charConfig.auraColor);
                        }
                    }

                    // Quick Transform shortcut while charging: press Attack at 100% Ki
                    if (this.canTransform && this.ki >= this.maxKi && this.input.attack) {
                        this.triggerTransformation();
                        break;
                    }

                    // Check for transformation trigger when Ki is full
                    if (this.canTransform && this.ki >= this.maxKi) {
                        this.transformProgress += 1 / 42; // ~0.7 seconds of holding charge at MAX Ki

                        // Violent pre-transformation energy surge
                        if (window.particleSystem) {
                            window.particleSystem.addScreenShake(1.5 + this.transformProgress * 3.5);
                            if (Math.random() > 0.35) {
                                window.particleSystem.createHitSparks(this.x + (Math.random() - 0.5) * 24, this.y + (Math.random() - 0.5) * 24, '#ffffff', 4);
                            }
                        }

                        if (this.transformProgress >= 1) {
                            this.triggerTransformation();
                        }
                    }
                } else {
                    this.state = 'idle';
                    this.transformProgress = 0;
                    if (window.soundEngine) window.soundEngine.stopCharge();
                }
                break;

            case 'guard':
                // Apply smooth friction slide if pushed while guarding
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.75;
                this.vy *= 0.75;

                // Z-Vanish Counter from Guard: press Dash while holding Guard!
                if (dashJustPressed && this.dashCooldown <= 0) {
                    if (opponent && this.ki >= 12) {
                        this.performZVanish(opponent);
                    } else {
                        this.startDash(opponent, false);
                    }
                    break;
                }

                if (!this.input.guard) {
                    this.state = 'idle';
                }
                break;

            case 'punch1':
            case 'punch2':
            case 'kick':
            case 'smash':
                this.stateTimer--;
                // Apply lunge forward velocity during melee strikes
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.78;
                this.vy *= 0.78;

                // Dash-Cancel out of melee attacks for high-mobility DBZ combos!
                if (dashJustPressed && this.dashCooldown <= 0) {
                    this.startDash(opponent, false);
                    break;
                }

                // Rapid combo chaining when pressing attack near end of current strike
                if (this.input.attack && this.stateTimer <= 4 && this.state !== 'smash') {
                    this.performMeleeAttack(opponent, false);
                    break;
                }

                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;

            case 'ki_blast':
                this.stateTimer--;
                // Allow mobile drifting while firing Ki Blasts!
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.85;
                this.vy *= 0.85;

                // Dash-Cancel out of Ki Blast
                if (dashJustPressed && this.dashCooldown <= 0) {
                    this.startDash(opponent, false);
                    break;
                }

                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;

            case 'beam':
                // Keep fighter in beam state if currently locked in a Beam Clash
                if (window.projectileManager && window.projectileManager.clash) {
                    const c = window.projectileManager.clash;
                    if (c.beam1.owner === this || c.beam2.owner === this) {
                        this.stateTimer = Math.max(this.stateTimer, 10);
                    }
                }
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;

            case 'hurt':
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;

            case 'knockdown':
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;
        }

        // Constrain fighter within arena bounds
        this.clampPosition(arenaWidth, arenaHeight);
    }

    // Perform High-Speed Directional Dash or Homing Burst Dash
    startDash(opponent, isDoubleTap = false) {
        if (this.lastDashTap > 0 && opponent && this.ki >= 12 && !this.isAI) {
            // Double-tapping Dash triggers Z-Vanish behind the opponent!
            this.performZVanish(opponent);
            return;
        }

        this.lastDashTap = 18;
        this.dashCooldown = 18;
        this.state = 'dash';
        this.stateTimer = 11;

        let dx = 0;
        let dy = 0;
        if (this.input.left) dx -= 1;
        if (this.input.right) dx += 1;
        if (this.input.up) dy -= 1;
        if (this.input.down) dy += 1;

        const dashSpeed = 14.5 * (this.speed / 5.0);

        if (dx === 0 && dy === 0 && opponent) {
            // Homing Dragon Dash directly towards opponent's position!
            const toX = opponent.x - this.x;
            const toY = opponent.y - this.y;
            const dist = Math.hypot(toX, toY) || 1;
            this.vx = (toX / dist) * dashSpeed;
            this.vy = (toY / dist) * dashSpeed;
            this.facing = toX >= 0 ? 1 : -1;
        } else {
            if (dx === 0 && dy === 0) dx = this.facing;
            const len = Math.hypot(dx, dy) || 1;
            this.vx = (dx / len) * dashSpeed;
            this.vy = (dy / len) * dashSpeed;
            if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
        }

        if (window.soundEngine) window.soundEngine.playVanish();
        if (window.particleSystem) {
            window.particleSystem.addAfterimage(this);
            window.particleSystem.createDashDust(this.x, this.y, this.facing);
            window.particleSystem.createSpeedStreak(this.x, this.y, this.facing, this.charConfig.auraColor);
        }
    }

    // Iconic DBZ Instant Teleport (Z-Vanish) behind the opponent
    performZVanish(opponent) {
        if (!opponent) return;
        this.ki = Math.max(0, this.ki - 12);
        this.dashCooldown = 22;
        this.lastDashTap = 0;

        if (window.particleSystem) {
            window.particleSystem.addAfterimage(this);
            window.particleSystem.createGuardFlash(this.x, this.y, this.charConfig.auraColor || '#00e1ff');
        }
        if (window.soundEngine) {
            window.soundEngine.playVanish();
        }

        // Teleport right behind opponent
        const behindDir = opponent.facing || (opponent.x >= this.x ? 1 : -1);
        this.x = opponent.x - behindDir * 34;
        this.y = opponent.y;
        this.facing = opponent.x >= this.x ? 1 : -1;
        this.vx = this.facing * 3;
        this.vy = 0;
        this.state = 'idle';
        this.stateTimer = 0;
        this.attackCooldown = 0;

        if (window.particleSystem) {
            window.particleSystem.addAfterimage(this);
            window.particleSystem.createHitSparks(this.x, this.y, '#ffffff', 10);
        }
    }

    handleMovementAndActions(opponent, dashJustPressed = false) {
        // 0. Quick Transform shortcut: Attack + Charge when Ki is 100%
        if (this.input.charge && this.input.attack && this.canTransform && this.ki >= this.maxKi) {
            this.triggerTransformation();
            return;
        }

        // 0b. Z-Vanish shortcut: Guard + Dash (or Charge + Dash) with >= 12 Ki
        if (dashJustPressed && (this.input.guard || this.input.charge) && opponent && this.ki >= 12 && this.dashCooldown <= 0) {
            this.performZVanish(opponent);
            return;
        }

        // 1. Guard check
        if (this.input.guard) {
            this.state = 'guard';
            this.vx *= 0.5;
            this.vy *= 0.5;
            return;
        }

        // 2. Ki Charging check
        if (this.input.charge) {
            this.state = 'charge';
            this.vx = 0;
            this.vy = 0;
            if (window.soundEngine) window.soundEngine.startCharge();
            return;
        }

        // 3. Super Energy Beam check
        if (this.input.beam && this.attackCooldown <= 0 && this.ki >= 35) {
            this.ki -= 35;
            this.state = 'beam';
            this.stateTimer = 65;
            this.attackCooldown = 68;
            this.vx = 0;
            this.vy = 0;
            if (opponent) this.facing = opponent.x >= this.x ? 1 : -1;

            const dirX = this.facing;
            const dirY = (this.input.up ? -0.38 : (this.input.down ? 0.38 : 0));
            if (window.projectileManager) {
                window.projectileManager.spawnBeam(this, this.x, this.y, dirX, dirY, this.charConfig);
            }
            return;
        }

        // 4. Rapid Ki Blast check (supports moving while firing!)
        if (this.input.kiBlast && this.attackCooldown <= 0 && this.ki >= 5) {
            this.ki -= 5;
            this.state = 'ki_blast';
            this.stateTimer = 10;
            this.attackCooldown = 12;
            if (opponent) this.facing = opponent.x >= this.x ? 1 : -1;

            // Allow drift movement while shooting Ki Blasts
            let mx = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
            let my = (this.input.down ? 1 : 0) - (this.input.up ? 1 : 0);
            this.vx = mx * this.speed * 0.65;
            this.vy = my * this.speed * 0.65;

            const spawnX = this.x + this.facing * 18;
            const spawnY = this.y - 2;
            const dirX = this.facing;
            let dirY = (this.input.up ? -0.32 : (this.input.down ? 0.32 : 0));
            // Subtle auto-aim assist if opponent is slightly above/below and no vertical key is pressed
            if (dirY === 0 && opponent) {
                const dyOpp = opponent.y - this.y;
                const dxOpp = Math.abs(opponent.x - this.x) || 1;
                if (Math.abs(dyOpp) > 12 && Math.abs(dyOpp) < 95) {
                    dirY = Math.max(-0.28, Math.min(0.28, dyOpp / dxOpp));
                }
            }

            if (window.projectileManager) {
                window.projectileManager.spawnKiBlast(this, spawnX, spawnY, dirX, dirY, this.charConfig.beamColor);
            }
            return;
        }

        // 5. Dash / Instant Teleport check
        if (this.input.dash && this.dashCooldown <= 0) {
            this.startDash(opponent, dashJustPressed);
            return;
        }

        // 6. Melee Attack Combo check
        if (this.input.attack && this.attackCooldown <= 0) {
            this.performMeleeAttack(opponent, false);
            return;
        }

        // 7. Smooth 8-Way Flight / Walk Movement with Momentum
        let mx = 0;
        let my = 0;
        if (this.input.left) mx -= 1;
        if (this.input.right) mx += 1;
        if (this.input.up) my -= 1;
        if (this.input.down) my += 1;

        if (mx !== 0 || my !== 0) {
            const len = Math.hypot(mx, my);
            const targetVx = (mx / len) * this.speed;
            const targetVy = (my / len) * this.speed;
            // Responsive acceleration
            this.vx += (targetVx - this.vx) * 0.48;
            this.vy += (targetVy - this.vy) * 0.48;
            this.x += this.vx;
            this.y += this.vy;
            this.state = 'walk';
            if (Math.random() > 0.85 && window.particleSystem) {
                window.particleSystem.createDashDust(this.x, this.y, mx !== 0 ? (mx > 0 ? 1 : -1) : this.facing);
            }
        } else {
            // Smooth glide deceleration
            this.vx *= 0.72;
            this.vy *= 0.72;
            if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                this.x += this.vx;
                this.y += this.vy;
            } else {
                this.vx = 0;
                this.vy = 0;
            }
            this.state = 'idle';
        }
    }

    // Trigger In-Battle Transformation
    triggerTransformation() {
        if (!this.canTransform || !this.nextFormKey) return;
        const oldName = this.name;
        const nextKey = this.nextFormKey;
        const nextConfig = FighterRenderer.CHARACTERS[nextKey];
        if (!nextConfig) return;

        // Apply new form
        this.charKey = nextKey;
        this.charConfig = nextConfig;
        this.name = nextConfig.name;
        this.canTransform = !!Fighter.TRANSFORMATIONS[this.charKey];
        this.nextFormKey = Fighter.TRANSFORMATIONS[this.charKey] || null;
        this.transformProgress = 0;

        // Buff stats!
        this.speed = Math.min(6.8, this.speed * 1.12);
        this.damageMultiplier = (this.damageMultiplier || 1.0) * 1.25;
        this.health = Math.min(this.maxHealth, this.health + 20); // +20 HP recovery adrenaline burst!
        this.ki = 55; // Set Ki to 55

        // Stun & push back nearby opponent with awakening shockwave
        if (window.gameInstance) {
            window.gameInstance.setTransformBanner(this, oldName, this.name);
            const opponent = this.id === 1 ? window.gameInstance.p2 : window.gameInstance.p1;
            if (opponent) {
                const dist = Math.hypot(opponent.x - this.x, opponent.y - this.y);
                if (dist < 90) {
                    opponent.stunTimer = 22;
                    opponent.knockbackVx = (opponent.x >= this.x ? 1 : -1) * 9;
                }
            }
        }

        // Epic audiovisual effects
        if (window.soundEngine) {
            window.soundEngine.stopCharge();
            window.soundEngine.playTransform();
        }
        if (window.particleSystem) {
            window.particleSystem.addScreenShake(20);
            window.particleSystem.createTransformShockwave(this.x, this.y, this.charConfig.auraColor || '#ffe600');
        }

        this.state = 'idle';
        this.stateTimer = 0;
        this.attackCooldown = 12;
    }

    performMeleeAttack(opponent, isDashAttack = false) {
        // Combo sequence: punch1 -> punch2 -> kick -> smash
        const comboSequence = ['punch1', 'punch2', 'kick', 'smash'];
        const comboDurations = [11, 11, 13, 18];
        const currentType = isDashAttack ? 'kick' : comboSequence[this.comboStep % comboSequence.length];
        const duration = isDashAttack ? 13 : comboDurations[this.comboStep % comboDurations.length];
        const isSmash = (currentType === 'smash');

        if (opponent) {
            this.facing = opponent.x >= this.x ? 1 : -1;
        }

        this.state = currentType;
        this.stateTimer = duration;
        this.attackCooldown = duration + 1;
        this.comboResetTimer = 38;

        // Forward lunge momentum & vertical homing assist so melee feels fluid and magnetic
        const lungeSpeed = isDashAttack ? 8.5 : (isSmash ? 6.2 : 4.2);
        this.vx = this.facing * lungeSpeed;
        if (opponent && Math.abs(opponent.y - this.y) <= 44 && Math.abs(opponent.x - this.x) <= 75) {
            this.vy = (opponent.y - this.y) * 0.22;
        } else {
            this.vy *= 0.4;
        }

        // Check if melee attack hits opponent
        if (opponent && !opponent.isDefeated) {
            const rangeX = isDashAttack ? 50 : 44;
            const rangeY = 28;
            const dx = (opponent.x - this.x) * this.facing;
            const inRangeX = (dx >= -12 && dx <= rangeX);
            const inRangeY = Math.abs(opponent.y - this.y) <= rangeY;

            if (inRangeX && inRangeY) {
                const baseDmg = isSmash ? 16 : (isDashAttack ? 9 : 6.5);
                const damage = baseDmg * (this.damageMultiplier || 1.0);

                const blocked = opponent.takeDamage(damage, this.facing, isSmash ? 'smash' : 'punch');

                if (blocked) {
                    // Attack was completely blocked! Stop combo progression and recoil slightly
                    this.comboStep = 0;
                    this.vx = -this.facing * 2.5;
                    this.stateTimer = 8;
                    this.attackCooldown = 11;
                    return;
                }

                // Reward aggressive melee hits with Ki energy
                this.ki = Math.min(this.maxKi, this.ki + 3.5);

                if (window.particleSystem) {
                    if (isSmash || isDashAttack) {
                        window.particleSystem.createHitBurst(opponent.x, opponent.y - 6, '#ffffff');
                        window.particleSystem.createHitSparks(opponent.x, opponent.y - 6, this.charConfig.beamColor || '#ffea00', 22);
                    } else {
                        window.particleSystem.createHitSparks(opponent.x, opponent.y - 6, '#ffffff', 10);
                    }
                }
                if (window.soundEngine) {
                    window.soundEngine.playHit(isSmash || isDashAttack);
                }

                // Advance combo
                this.comboStep++;
                return;
            }
        }

        // Missed hit reset combo if not dash attack
        if (!isDashAttack) {
            this.comboStep = 0;
        }
    }

    takeDamage(amount, pushDir = 1, type = 'punch') {
        if (this.isDefeated) return false;

        if (this.state === 'charge' && window.soundEngine) {
            window.soundEngine.stopCharge();
            this.transformProgress = 0;
        }

        // If guarding or holding guard input, absorb ALL damage (0 damage) and absorb knockback
        const isGuarding = (this.state === 'guard' || this.input.guard);

        if (isGuarding) {
            this.state = 'guard';
            this.stunTimer = 0;
            this.knockbackVx = pushDir * 0.8;
            this.vx = pushDir * 1.2;
            if (window.particleSystem) {
                window.particleSystem.createGuardFlash(this.x, this.y, '#00e1ff');
                window.particleSystem.createHitSparks(this.x + pushDir * -8, this.y, '#00e1ff', 6);
            }
            if (window.soundEngine && this.guardSoundTimer <= 0) {
                window.soundEngine.playGuard();
                this.guardSoundTimer = 8;
            }
            return true; // Completely blocked! 0 damage
        }

        this.health = Math.max(0, this.health - amount);

        // Apply hitstun & knockback
        if (type === 'smash' || type === 'beam') {
            this.state = 'knockdown';
            this.stateTimer = 32;
            this.stunTimer = 32;
            this.knockbackVx = pushDir * (type === 'smash' ? 12.5 : 7.5);
            if (window.particleSystem) {
                window.particleSystem.addScreenShake(type === 'smash' ? 10 : 8);
                window.particleSystem.createLandingDust(this.x, this.y);
            }
        } else {
            this.state = 'hurt';
            this.stateTimer = 14;
            this.stunTimer = 14;
            this.knockbackVx = pushDir * 3.5;
        }

        this.checkDefeat();
        return false; // Direct hit
    }

    checkDefeat() {
        if (this.health <= 0) {
            this.health = 0;
            this.isDefeated = true;
            this.state = 'knockdown';
            if (window.soundEngine) {
                window.soundEngine.stopCharge();
                window.soundEngine.playJingle('ko');
            }
            if (window.particleSystem) {
                window.particleSystem.createExplosion(this.x, this.y, '#ff0033', 30);
            }
        }
    }

    clampPosition(arenaWidth, arenaHeight) {
        const pad = 24;
        this.x = Math.max(pad, Math.min(arenaWidth - pad, this.x));
        this.y = Math.max(pad + 20, Math.min(arenaHeight - pad, this.y));
    }

    // AI decision making
    updateAI(opponent) {
        this.aiActionTimer--;
        const dist = Math.hypot(opponent.x - this.x, opponent.y - this.y);

        // If in clash, mash buttons at a fair competitive pace!
        if (window.projectileManager && window.projectileManager.clash) {
            if (Math.random() > 0.72) {
                window.projectileManager.mashClash(this);
            }
            return;
        }

        if (this.aiActionTimer <= 0) {
            this.aiActionTimer = 6 + Math.floor(Math.random() * 10);
            this.input.up = false;
            this.input.down = false;
            this.input.left = false;
            this.input.right = false;
            this.input.attack = false;
            this.input.kiBlast = false;
            this.input.beam = false;
            this.input.charge = false;
            this.input.dash = false;
            this.input.guard = false;

            // 1. Defend or Evade against incoming Super Beam
            const isEnemyFiringBeam = (opponent.state === 'beam');
            if (isEnemyFiringBeam && dist < 420) {
                if (Math.random() > 0.45) {
                    this.input.guard = true;
                    return;
                } else {
                    this.input.dash = true;
                    this.input.up = (this.y > 180);
                    this.input.down = !this.input.up;
                    return;
                }
            }

            // 2. Transform or Charge Ki
            if (this.canTransform && dist > 120) {
                if (this.ki >= this.maxKi) {
                    this.input.charge = true;
                    if (Math.random() > 0.35) this.input.attack = true; // Instant burst transform
                    return;
                } else if (this.ki < this.maxKi && dist > 155) {
                    this.input.charge = true;
                    return;
                }
            } else if (this.ki < 30 && dist > 175) {
                this.input.charge = true;
                return;
            }

            // 3. Melee range combat & Z-Vanish mixups
            if (dist < 52) {
                const isEnemyAttacking = opponent.state.startsWith('punch') || opponent.state === 'kick' || opponent.state === 'smash';
                if (isEnemyAttacking && Math.random() > 0.45) {
                    this.input.guard = true;
                    if (this.ki >= 25 && Math.random() > 0.65) {
                        this.input.dash = true; // Z-Vanish counter!
                    }
                } else {
                    this.input.attack = true;
                }
                return;
            }

            // 4. Mid/Long range: Fire Ki blast, Super Beam, or Homing Dash
            if (dist > 85 && dist < 340 && Math.abs(opponent.y - this.y) < 38) {
                if (this.ki >= 35 && Math.random() > 0.72) {
                    this.input.beam = true;
                    return;
                } else if (this.ki >= 5 && Math.random() > 0.48) {
                    this.input.kiBlast = true;
                    return;
                }
            }

            // 5. Approach or reposition towards opponent with high mobility
            if (opponent.x < this.x - 24) this.input.left = true;
            if (opponent.x > this.x + 24) this.input.right = true;
            if (opponent.y < this.y - 10) this.input.up = true;
            if (opponent.y > this.y + 10) this.input.down = true;

            // High-speed Dragon Dash gap closer
            if (dist > 110 && Math.random() > 0.62) {
                this.input.dash = true;
            }
        }
    }

    draw(ctx) {
        if (window.fighterRenderer) {
            window.fighterRenderer.draw(ctx, this, this.x, this.y, this.facing, this.state, this.animFrame);
        }
    }

    drawSprite(ctx, x, y, facing, state, frame) {
        if (window.fighterRenderer) {
            window.fighterRenderer.draw(ctx, this, x, y, facing, state, frame);
        }
    }
}

window.Fighter = Fighter;
