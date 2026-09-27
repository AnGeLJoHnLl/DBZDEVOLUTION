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
        this.speed = 4.2;
        this.hitboxRadius = 16;

        // Vitals
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxKi = 100;
        this.ki = 40;

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
        this.isDefeated = false;

        // Cooldowns & Timers
        this.dashCooldown = 0;
        this.attackCooldown = 0;
        this.stunTimer = 0;
        this.knockbackVx = 0;

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
        this.ki = 40;
        this.state = 'idle';
        this.stateTimer = 0;
        this.comboStep = 0;
        this.isDefeated = false;
        this.stunTimer = 0;
        this.canTransform = !!Fighter.TRANSFORMATIONS[this.charKey];
        this.nextFormKey = Fighter.TRANSFORMATIONS[this.charKey] || null;
        this.transformProgress = 0;
        this.damageMultiplier = 1.0;
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

        // Animation frame increment
        this.animFrame += 0.2;

        // Cooldown decrements
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Stun & Knockback update
        if (this.stunTimer > 0) {
            this.stunTimer--;
            this.x += this.knockbackVx;
            this.knockbackVx *= 0.88;
            this.clampPosition(arenaWidth, arenaHeight);
            if (this.stunTimer <= 0) {
                this.state = 'idle';
                this.comboStep = 0;
            }
            return;
        }

        // Automatically face opponent when in neutral states
        if (opponent && (this.state === 'idle' || this.state === 'walk' || this.state === 'guard')) {
            this.facing = opponent.x >= this.x ? 1 : -1;
        }

        // State Machine Handling
        switch (this.state) {
            case 'idle':
            case 'walk':
                this.handleMovementAndActions(opponent);
                break;

            case 'dash':
                this.stateTimer--;
                this.x += this.vx;
                this.y += this.vy;
                if (window.particleSystem) {
                    if (Math.random() > 0.3) {
                        window.particleSystem.addAfterimage(this);
                    }
                    if (Math.random() > 0.35) {
                        window.particleSystem.createSpeedStreak(this.x, this.y, this.facing, this.charConfig.auraColor);
                    }
                }
                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;

            case 'charge':
                if (this.input.charge) {
                    this.ki = Math.min(this.maxKi, this.ki + 0.65);
                    if (window.particleSystem) {
                        window.particleSystem.createAura(this.x, this.y, this.charConfig.auraColor, 2);
                        if (Math.random() > 0.8) {
                            window.particleSystem.createChargeGroundPulse(this.x, this.y, this.charConfig.auraColor);
                        }
                    }

                    // Check for transformation trigger when Ki is full
                    if (this.canTransform && this.ki >= this.maxKi) {
                        this.transformProgress += 1 / 45; // ~0.75 seconds of holding charge at MAX Ki
                        
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
                if (!this.input.guard) {
                    this.state = 'idle';
                }
                break;

            case 'punch1':
            case 'punch2':
            case 'kick':
            case 'smash':
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;

            case 'ki_blast':
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = 'idle';
                }
                break;

            case 'beam':
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

    handleMovementAndActions(opponent) {
        // 0. Quick Transform shortcut: Attack + Charge when Ki is 100%
        if (this.input.charge && this.input.attack && this.canTransform && this.ki >= this.maxKi) {
            this.triggerTransformation();
            return;
        }

        // 1. Guard check
        if (this.input.guard) {
            this.state = 'guard';
            this.vx = 0;
            this.vy = 0;
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
            this.stateTimer = 45;
            this.attackCooldown = 50;
            this.vx = 0;
            this.vy = 0;

            const dirX = this.facing;
            const dirY = (this.input.up ? -0.4 : (this.input.down ? 0.4 : 0));
            if (window.projectileManager) {
                window.projectileManager.spawnBeam(this, this.x, this.y, dirX, dirY, this.charConfig);
            }
            return;
        }

        // 4. Rapid Ki Blast check
        if (this.input.kiBlast && this.attackCooldown <= 0 && this.ki >= 6) {
            this.ki -= 6;
            this.state = 'ki_blast';
            this.stateTimer = 16;
            this.attackCooldown = 18;

            const spawnX = this.x + this.facing * 18;
            const spawnY = this.y - 2;
            const dirX = this.facing;
            const dirY = (this.input.up ? -0.35 : (this.input.down ? 0.35 : 0));

            if (window.projectileManager) {
                window.projectileManager.spawnKiBlast(this, spawnX, spawnY, dirX, dirY, this.charConfig.beamColor);
            }
            return;
        }

        // 5. Dash / Instant Teleport check
        if (this.input.dash && this.dashCooldown <= 0) {
            this.dashCooldown = 32;
            this.state = 'dash';
            this.stateTimer = 10;

            let dx = 0;
            let dy = 0;
            if (this.input.left) dx -= 1;
            if (this.input.right) dx += 1;
            if (this.input.up) dy -= 1;
            if (this.input.down) dy += 1;

            if (dx === 0 && dy === 0) dx = this.facing;
            const len = Math.hypot(dx, dy) || 1;
            const dashSpeed = 13.5;
            this.vx = (dx / len) * dashSpeed;
            this.vy = (dy / len) * dashSpeed;

            if (window.soundEngine) window.soundEngine.playVanish();
            if (window.particleSystem) {
                window.particleSystem.addAfterimage(this);
                window.particleSystem.createDashDust(this.x, this.y, this.facing);
            }
            return;
        }

        // 6. Melee Attack Combo check
        if (this.input.attack && this.attackCooldown <= 0) {
            this.performMeleeAttack(opponent);
            return;
        }

        // 7. Normal Walk Movement
        let mx = 0;
        let my = 0;
        if (this.input.left) mx -= 1;
        if (this.input.right) mx += 1;
        if (this.input.up) my -= 1;
        if (this.input.down) my += 1;

        if (mx !== 0 || my !== 0) {
            const len = Math.hypot(mx, my);
            this.vx = (mx / len) * this.speed;
            this.vy = (my / len) * this.speed;
            this.x += this.vx;
            this.y += this.vy;
            this.state = 'walk';
        } else {
            this.vx = 0;
            this.vy = 0;
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
        this.speed = Math.min(6.2, this.speed * 1.12);
        this.damageMultiplier = (this.damageMultiplier || 1.0) * 1.25;
        this.health = Math.min(this.maxHealth, this.health + 20); // +20 HP recovery adrenaline burst!
        this.ki = 50; // Set Ki to 50

        // Stun & push back nearby opponent with awakening shockwave
        if (window.gameInstance) {
            window.gameInstance.setTransformBanner(this, oldName, this.name);
            const opponent = this.id === 1 ? window.gameInstance.p2 : window.gameInstance.p1;
            if (opponent) {
                const dist = Math.hypot(opponent.x - this.x, opponent.y - this.y);
                if (dist < 85) {
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
        this.attackCooldown = 15;
    }

    performMeleeAttack(opponent) {
        // Combo sequence: punch1 -> punch2 -> kick -> smash
        const comboSequence = ['punch1', 'punch2', 'kick', 'smash'];
        const comboDurations = [14, 14, 16, 22];
        const currentType = comboSequence[this.comboStep % comboSequence.length];
        const duration = comboDurations[this.comboStep % comboDurations.length];

        this.state = currentType;
        this.stateTimer = duration;
        this.attackCooldown = duration + 2;

        // Check if melee attack hits opponent
        if (opponent && !opponent.isDefeated) {
            const rangeX = 36;
            const rangeY = 22;
            const inRangeX = (this.facing > 0 && opponent.x >= this.x && opponent.x <= this.x + rangeX) ||
                             (this.facing < 0 && opponent.x <= this.x && opponent.x >= this.x - rangeX);
            const inRangeY = Math.abs(opponent.y - this.y) <= rangeY;

            if (inRangeX && inRangeY) {
                const isSmash = (currentType === 'smash');
                const baseDmg = isSmash ? 16 : 6.5;
                const damage = baseDmg * (this.damageMultiplier || 1.0);

                opponent.takeDamage(damage, this.facing, isSmash ? 'smash' : 'punch');

                if (window.particleSystem) {
                    if (isSmash) {
                        window.particleSystem.createHitBurst(opponent.x, opponent.y - 6, '#ffffff');
                        window.particleSystem.createHitSparks(opponent.x, opponent.y - 6, this.charConfig.beamColor || '#ffea00', 22);
                    } else {
                        window.particleSystem.createHitSparks(opponent.x, opponent.y - 6, '#ffffff', 10);
                    }
                }
                if (window.soundEngine) {
                    window.soundEngine.playHit(isSmash);
                }

                // Advance combo
                this.comboStep++;
                return;
            }
        }

        // Missed hit reset combo
        this.comboStep = 0;
    }

    takeDamage(amount, pushDir = 1, type = 'punch') {
        if (this.isDefeated) return;

        // If guarding, reduce damage heavily and absorb knockback
        if (this.state === 'guard') {
            const reduced = amount * 0.25;
            this.health = Math.max(0, this.health - reduced);
            if (window.particleSystem) {
                window.particleSystem.createGuardFlash(this.x, this.y, '#00e1ff');
            }
            if (window.soundEngine) {
                window.soundEngine.playGuard();
            }
            this.checkDefeat();
            return;
        }

        this.health = Math.max(0, this.health - amount);

        // Apply hitstun & knockback
        if (type === 'smash' || type === 'beam') {
            this.state = 'knockdown';
            this.stateTimer = 35;
            this.stunTimer = 35;
            this.knockbackVx = pushDir * (type === 'smash' ? 12 : 7);
            if (window.particleSystem) {
                window.particleSystem.addScreenShake(type === 'smash' ? 10 : 8);
                window.particleSystem.createLandingDust(this.x, this.y);
            }
        } else {
            this.state = 'hurt';
            this.stateTimer = 16;
            this.stunTimer = 16;
            this.knockbackVx = pushDir * 3.5;
        }

        this.checkDefeat();
    }

    checkDefeat() {
        if (this.health <= 0) {
            this.health = 0;
            this.isDefeated = true;
            this.state = 'knockdown';
            if (window.soundEngine) {
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

        // If in clash, mash buttons!
        if (window.projectileManager && window.projectileManager.clash) {
            if (Math.random() > 0.2) {
                window.projectileManager.mashClash(this);
            }
            return;
        }

        if (this.aiActionTimer <= 0) {
            this.aiActionTimer = 8 + Math.floor(Math.random() * 12);
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

            // 1. Defend against incoming Super Beam
            const isEnemyFiringBeam = (opponent.state === 'beam');
            if (isEnemyFiringBeam && dist < 400) {
                if (Math.random() > 0.4) {
                    this.input.guard = true;
                    return;
                } else {
                    this.input.dash = true;
                    this.input.up = (Math.random() > 0.5);
                    this.input.down = !this.input.up;
                    return;
                }
            }

            // 2. Transform or Charge Ki
            if (this.canTransform && dist > 130) {
                if (this.ki >= this.maxKi) {
                    this.input.charge = true;
                    if (Math.random() > 0.4) this.input.attack = true; // Instant burst transform
                    return;
                } else if (this.ki < this.maxKi && dist > 160) {
                    this.input.charge = true;
                    return;
                }
            } else if (this.ki < 30 && dist > 180) {
                this.input.charge = true;
                return;
            }

            // 3. Melee range attack
            if (dist < 45) {
                if (opponent.state === 'attack' && Math.random() > 0.6) {
                    this.input.guard = true;
                } else {
                    this.input.attack = true;
                }
                return;
            }

            // 4. Mid/Long range: Fire Ki blast or Super Beam
            if (dist > 90 && dist < 320 && Math.abs(opponent.y - this.y) < 35) {
                if (this.ki >= 35 && Math.random() > 0.7) {
                    this.input.beam = true;
                    return;
                } else if (this.ki >= 6 && Math.random() > 0.5) {
                    this.input.kiBlast = true;
                    return;
                }
            }

            // 5. Approach or reposition towards opponent
            if (opponent.x < this.x - 20) this.input.left = true;
            if (opponent.x > this.x + 20) this.input.right = true;
            if (opponent.y < this.y - 10) this.input.up = true;
            if (opponent.y > this.y + 10) this.input.down = true;

            // Occasional tactical dash
            if (dist > 140 && Math.random() > 0.75) {
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
