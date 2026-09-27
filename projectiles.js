// Projectiles & Energy Beam Engine for Ki Clash
class ProjectileManager {
    constructor() {
        this.blasts = [];
        this.beams = [];
        this.clash = null; // Active beam clash state
    }

    // Spawn a rapid Ki blast
    spawnKiBlast(owner, x, y, dirX, dirY, color = '#ffeb3b') {
        const speed = 11;
        // Normalize direction
        const len = Math.hypot(dirX, dirY) || 1;
        const vx = (dirX / len) * speed;
        const vy = (dirY / len) * speed;

        this.blasts.push({
            owner,
            x, y,
            vx, vy,
            radius: 7 * (owner.damageMultiplier && owner.damageMultiplier > 1 ? 1.2 : 1),
            color,
            life: 80,
            damage: 8 * (owner.damageMultiplier || 1.0),
            hitbox: {
                width: 14 * (owner.damageMultiplier && owner.damageMultiplier > 1 ? 1.2 : 1),
                height: 14 * (owner.damageMultiplier && owner.damageMultiplier > 1 ? 1.2 : 1)
            }
        });

        if (window.soundEngine) {
            window.soundEngine.playKiBlast();
        }
    }

    // Spawn / Activate a continuous Super Energy Beam
    spawnBeam(owner, x, y, dirX, dirY, charConfig) {
        const angle = Math.atan2(dirY, dirX);
        const beam = {
            owner,
            startX: x,
            startY: y,
            dirX: Math.cos(angle),
            dirY: Math.sin(angle),
            angle: angle,
            length: 0,
            maxLength: 950,
            width: 24 * (owner.damageMultiplier && owner.damageMultiplier > 1 ? 1.25 : 1),
            speed: 28,
            active: true,
            duration: 90, // frames beam stays active
            damagePerFrame: 0.9 * (owner.damageMultiplier || 1.0),
            color: charConfig.beamColor || '#00e1ff',
            coreColor: charConfig.beamCore || '#ffffff',
            specialName: charConfig.specialName
        };

        this.beams.push(beam);

        if (window.soundEngine) {
            window.soundEngine.playBeamFire();
        }
        if (window.particleSystem) {
            window.particleSystem.addScreenShake(12);
        }
        return beam;
    }

    update(arenaWidth, arenaHeight, fighters) {
        // 1. Update Ki Blasts
        for (let i = this.blasts.length - 1; i >= 0; i--) {
            const b = this.blasts[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life--;

            // Particle trail
            if (window.particleSystem && Math.random() > 0.4) {
                window.particleSystem.particles.push({
                    x: b.x,
                    y: b.y,
                    vx: -b.vx * 0.2 + (Math.random() - 0.5) * 2,
                    vy: -b.vy * 0.2 + (Math.random() - 0.5) * 2,
                    size: 3,
                    color: b.color,
                    alpha: 0.8,
                    decay: 0.08,
                    type: 'spark'
                });
            }

            // Check arena bounds
            if (b.x < 10 || b.x > arenaWidth - 10 || b.y < 10 || b.y > arenaHeight - 10 || b.life <= 0) {
                if (window.particleSystem) {
                    window.particleSystem.createExplosion(b.x, b.y, b.color, 10);
                }
                this.blasts.splice(i, 1);
                continue;
            }

            // Check collision with fighters
            let hit = false;
            for (const f of fighters) {
                if (f === b.owner || f.isDefeated) continue;

                const dist = Math.hypot(b.x - f.x, b.y - f.y);
                if (dist < b.radius + f.hitboxRadius) {
                    f.takeDamage(b.damage, b.vx > 0 ? 1 : -1, 'blast');
                    if (window.particleSystem) {
                        window.particleSystem.createExplosion(b.x, b.y, b.color, 14);
                    }
                    if (window.soundEngine) {
                        window.soundEngine.playExplosion(false);
                    }
                    this.blasts.splice(i, 1);
                    hit = true;
                    break;
                }
            }
            if (hit) continue;

            // Check blast vs blast collision
            for (let j = i - 1; j >= 0; j--) {
                const b2 = this.blasts[j];
                if (b.owner !== b2.owner && Math.hypot(b.x - b2.x, b.y - b2.y) < b.radius + b2.radius + 4) {
                    const midX = (b.x + b2.x) / 2;
                    const midY = (b.y + b2.y) / 2;
                    if (window.particleSystem) {
                        window.particleSystem.createExplosion(midX, midY, '#ffffff', 16);
                    }
                    if (window.soundEngine) {
                        window.soundEngine.playExplosion(false);
                    }
                    this.blasts.splice(i, 1);
                    this.blasts.splice(j, 1);
                    break;
                }
            }
        }

        // 2. Update Beams & Beam Clash detection
        this.checkBeamClash();

        for (let i = this.beams.length - 1; i >= 0; i--) {
            const beam = this.beams[i];

            // Anchor start position to owner's hands
            if (beam.owner) {
                beam.startX = beam.owner.x + (beam.owner.facing > 0 ? 14 : -14);
                beam.startY = beam.owner.y - 4;
            }

            if (this.clash && (this.clash.beam1 === beam || this.clash.beam2 === beam)) {
                // If in clash, beam length terminates at the clash point
                const clashDist = Math.hypot(this.clash.x - beam.startX, this.clash.y - beam.startY);
                beam.length = clashDist;
            } else {
                if (beam.length < beam.maxLength) {
                    beam.length += beam.speed;
                }
            }

            beam.duration--;

            // Continuous damage along beam ray
            const beamEndX = beam.startX + beam.dirX * beam.length;
            const beamEndY = beam.startY + beam.dirY * beam.length;

            // Destroy intersecting ki blasts
            for (let k = this.blasts.length - 1; k >= 0; k--) {
                const blast = this.blasts[k];
                if (blast.owner !== beam.owner && this.isPointNearSegment(blast.x, blast.y, beam.startX, beam.startY, beamEndX, beamEndY, beam.width)) {
                    if (window.particleSystem) {
                        window.particleSystem.createExplosion(blast.x, blast.y, blast.color, 8);
                    }
                    this.blasts.splice(k, 1);
                }
            }

            // Damage enemy fighters caught in beam
            for (const f of fighters) {
                if (f === beam.owner || f.isDefeated) continue;
                if (this.isPointNearSegment(f.x, f.y, beam.startX, beam.startY, beamEndX, beamEndY, beam.width + f.hitboxRadius)) {
                    f.takeDamage(beam.damagePerFrame, beam.dirX > 0 ? 1 : -1, 'beam');
                    if (window.particleSystem && Math.random() > 0.4) {
                        window.particleSystem.createHitSparks(f.x, f.y, beam.color, 3);
                    }
                }
            }

            // Spawn beam energy particles along the shaft
            if (window.particleSystem && Math.random() > 0.25) {
                const t = Math.random();
                const px = beam.startX + beam.dirX * beam.length * t + (Math.random() - 0.5) * beam.width;
                const py = beam.startY + beam.dirY * beam.length * t + (Math.random() - 0.5) * beam.width;
                window.particleSystem.particles.push({
                    x: px, y: py,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    size: 3 + Math.random() * 4,
                    color: beam.color,
                    alpha: 0.9,
                    decay: 0.08,
                    type: 'aura'
                });
            }

            if (beam.duration <= 0) {
                this.beams.splice(i, 1);
                if (this.clash && (this.clash.beam1 === beam || this.clash.beam2 === beam)) {
                    this.resolveClash();
                }
            }
        }

        // 3. Update Active Beam Clash
        if (this.clash) {
            this.updateBeamClash();
        }
    }

    // Detect if two opposing beams collide Head-to-Head
    checkBeamClash() {
        if (this.clash || this.beams.length < 2) return;

        for (let i = 0; i < this.beams.length; i++) {
            for (let j = i + 1; j < this.beams.length; j++) {
                const b1 = this.beams[i];
                const b2 = this.beams[j];

                if (b1.owner !== b2.owner) {
                    // Check if beams are facing each other (dot product < -0.5)
                    const dot = b1.dirX * b2.dirX + b1.dirY * b2.dirY;
                    if (dot < -0.5) {
                        // Check distance between ray lines
                        const clashX = (b1.startX + b2.startX) / 2;
                        const clashY = (b1.startY + b2.startY) / 2;

                        this.clash = {
                            beam1: b1,
                            beam2: b2,
                            x: clashX,
                            y: clashY,
                            power1: 50, // Tug of war: 0 to 100
                            timer: 200,
                            sparkInterval: 0
                        };

                        if (window.particleSystem) {
                            window.particleSystem.addScreenShake(16);
                        }
                        return;
                    }
                }
            }
        }
    }

    // Mash button input for clash
    mashClash(owner) {
        if (!this.clash) return;
        if (owner === this.clash.beam1.owner) {
            this.clash.power1 += 3.5;
        } else if (owner === this.clash.beam2.owner) {
            this.clash.power1 -= 3.5;
        }
    }

    updateBeamClash() {
        const c = this.clash;
        c.timer--;

        // Calculate current clash point position based on power1 (0..100)
        const ratio = c.power1 / 100;
        c.x = c.beam1.startX + (c.beam2.startX - c.beam1.startX) * (1 - ratio);
        c.y = (c.beam1.startY + c.beam2.startY) / 2;

        if (window.particleSystem) {
            window.particleSystem.addScreenShake(4);
            // Clash friction sparks
            window.particleSystem.createHitSparks(c.x, c.y, '#ffffff', 4);
            window.particleSystem.shockwaves.push({
                x: c.x, y: c.y,
                radius: 6, maxRadius: 32, speed: 3,
                color: (Math.random() > 0.5 ? c.beam1.color : c.beam2.color),
                alpha: 0.8, decay: 0.1
            });
        }

        // Win conditions
        if (c.power1 >= 95 || c.power1 <= 5 || c.timer <= 0) {
            this.resolveClash();
        }
    }

    resolveClash() {
        if (!this.clash) return;
        const c = this.clash;
        const winner = c.power1 >= 50 ? c.beam1 : c.beam2;
        const loser = c.power1 >= 50 ? c.beam2 : c.beam1;

        if (window.particleSystem) {
            window.particleSystem.createExplosion(c.x, c.y, '#ffffff', 40);
            window.particleSystem.addScreenShake(20);
        }
        if (window.soundEngine) {
            window.soundEngine.playExplosion(true);
        }

        // Damage the loser significantly
        if (loser.owner) {
            loser.owner.takeDamage(35, winner.dirX > 0 ? 1 : -1, 'smash');
        }

        // Remove loser beam
        const loserIdx = this.beams.indexOf(loser);
        if (loserIdx !== -1) this.beams.splice(loserIdx, 1);

        this.clash = null;
    }

    isPointNearSegment(px, py, x1, y1, x2, y2, threshold) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - x1, py - y1) <= threshold;

        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));

        const nearestX = x1 + t * dx;
        const nearestY = y1 + t * dy;
        return Math.hypot(px - nearestX, py - nearestY) <= threshold;
    }

    render(ctx) {
        ctx.save();

        // 1. Draw Ki Blasts
        for (const b of this.blasts) {
            ctx.save();
            // Outer glow
            const grad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.radius + 4);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, b.color);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
            ctx.fill();

            // Inner core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 2. Draw Energy Beams
        for (const beam of this.beams) {
            ctx.save();
            ctx.translate(beam.startX, beam.startY);
            ctx.rotate(beam.angle);

            // Beam cylinder gradient
            const h = beam.width;
            const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.2, beam.color);
            grad.addColorStop(0.5, beam.coreColor);
            grad.addColorStop(0.8, beam.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.fillRect(0, -h / 2, beam.length, h);

            // Spherical head of the beam
            ctx.fillStyle = beam.color;
            ctx.beginPath();
            ctx.arc(beam.length, 0, h * 0.65, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = beam.coreColor;
            ctx.beginPath();
            ctx.arc(beam.length, 0, h * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // Charging orb at the hands
            ctx.fillStyle = beam.coreColor;
            ctx.beginPath();
            ctx.arc(0, 0, h * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // 3. Draw Clash Point FX
        if (this.clash) {
            ctx.save();
            const pulse = 18 + Math.sin(Date.now() * 0.05) * 6;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.clash.x, this.clash.y, pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffe600';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Clash text banner
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.fillStyle = '#ff0033';
            ctx.textAlign = 'center';
            ctx.fillText('MASH BUTTONS!', this.clash.x, this.clash.y - 32);
            ctx.restore();
        }

        ctx.restore();
    }
}

window.projectileManager = new ProjectileManager();
