// Particle & Visual Effects Engine for Retro Ki Clash
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.shockwaves = [];
        this.afterimages = [];
        this.screenShake = 0;
    }

    addScreenShake(amount) {
        this.screenShake = Math.max(this.screenShake, amount);
    }

    // Hit spark on physical impact
    createHitSparks(x, y, color = '#fff', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.3 ? color : '#ffea00',
                alpha: 1,
                decay: 0.04 + Math.random() * 0.04,
                type: 'spark'
            });
        }
        // Small flash shockwave
        this.shockwaves.push({
            x, y,
            radius: 4,
            maxRadius: 28,
            speed: 3,
            color: '#fff',
            alpha: 0.9,
            decay: 0.08
        });
    }

    // Ki Charge Aura particles
    createAura(x, y, color = '#00f0ff', count = 3) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 36;
            this.particles.push({
                x: x + offsetX,
                y: y + 15 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 1.5 - offsetX * 0.05,
                vy: -(3 + Math.random() * 4),
                size: 3 + Math.random() * 5,
                color: color,
                alpha: 0.85,
                decay: 0.045,
                type: 'aura'
            });
        }
    }

    // Ground aura dust / energy ring
    createChargeGroundPulse(x, y, color = '#00f0ff') {
        this.shockwaves.push({
            x, y: y + 20,
            radius: 8,
            maxRadius: 45,
            speed: 2.5,
            color: color,
            alpha: 0.7,
            decay: 0.05
        });
    }

    // Explosion puff
    createExplosion(x, y, color = '#ffbb00', count = 25) {
        this.addScreenShake(8);
        this.shockwaves.push({
            x, y,
            radius: 6,
            maxRadius: 60,
            speed: 4.5,
            color: '#ffffff',
            alpha: 1,
            decay: 0.06
        });
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 6;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 6,
                color: Math.random() > 0.4 ? color : (Math.random() > 0.5 ? '#ff3300' : '#ffffff'),
                alpha: 1,
                decay: 0.03 + Math.random() * 0.03,
                type: 'smoke'
            });
        }
    }

    // Vanish / Teleport afterimage
    addAfterimage(fighter) {
        this.afterimages.push({
            fighter: fighter,
            x: fighter.x,
            y: fighter.y,
            facing: fighter.facing,
            state: fighter.state,
            frame: fighter.animFrame,
            alpha: 0.65,
            decay: 0.12
        });
    }

    // Guard barrier ripple
    createGuardFlash(x, y, color = '#00d0ff') {
        this.shockwaves.push({
            x, y,
            radius: 12,
            maxRadius: 36,
            speed: 3,
            color: color,
            alpha: 0.8,
            decay: 0.1
        });
    }

    update() {
        // Screen shake decay
        if (this.screenShake > 0) {
            this.screenShake *= 0.88;
            if (this.screenShake < 0.2) this.screenShake = 0;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.type === 'aura') {
                p.size = Math.max(1, p.size * 0.94);
            }
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const s = this.shockwaves[i];
            s.radius += s.speed;
            s.alpha -= s.decay;
            if (s.alpha <= 0 || s.radius >= s.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Update afterimages
        for (let i = this.afterimages.length - 1; i >= 0; i--) {
            const a = this.afterimages[i];
            a.alpha -= a.decay;
            if (a.alpha <= 0) {
                this.afterimages.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.save();

        // Draw afterimages
        for (const a of this.afterimages) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, a.alpha);
            // Render monochrome ghost
            ctx.filter = 'brightness(200%) drop-shadow(0 0 6px cyan)';
            a.fighter.drawSprite(ctx, a.x, a.y, a.facing, a.state, a.frame);
            ctx.restore();
        }

        // Draw shockwaves
        for (const s of this.shockwaves) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, s.alpha);
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.65, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Draw particles
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            if (p.type === 'spark') {
                ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.restore();
    }
}

window.particleSystem = new ParticleSystem();
