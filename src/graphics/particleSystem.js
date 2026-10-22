(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ParticleSystem = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class ParticleSystem {
    constructor() {
      this.ambientParticles = [];
      this.combatParticles = [];
      this.currentWeather = 'none';
      this.canvasWidth = 1024;
      this.canvasHeight = 576;
    }

    setWeather(weatherType) {
      if (this.currentWeather === weatherType) return;
      this.currentWeather = weatherType || 'none';
      this.ambientParticles = [];

      const count = (weatherType === 'none') ? 0 : 45;
      for (let i = 0; i < count; i++) {
        this.ambientParticles.push(this.createAmbientParticle(weatherType, true));
      }
    }

    createAmbientParticle(type, randomY = false) {
      const x = Math.random() * this.canvasWidth;
      const y = randomY ? Math.random() * this.canvasHeight : -20;

      if (type === 'leaves') {
        return {
          x,
          y,
          vx: Math.random() * 1.5 - 0.5,
          vy: Math.random() * 1.2 + 0.8,
          size: Math.random() * 6 + 4,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.05,
          color: Math.random() < 0.6 ? '#78C850' : '#8BC34A',
          opacity: Math.random() * 0.5 + 0.4,
          type
        };
      } else if (type === 'embers') {
        return {
          x,
          y: randomY ? y : this.canvasHeight + 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 1.5 + 0.8),
          size: Math.random() * 4 + 2,
          rotation: 0,
          vRot: 0,
          color: Math.random() < 0.5 ? '#FF5722' : '#FFC107',
          opacity: Math.random() * 0.6 + 0.4,
          type
        };
      } else if (type === 'mist') {
        return {
          x,
          y,
          vx: Math.random() * 1.8 + 0.5,
          vy: Math.random() * 0.8 + 0.2,
          size: Math.random() * 25 + 15,
          rotation: 0,
          vRot: 0,
          color: '#81D4FA',
          opacity: Math.random() * 0.15 + 0.05,
          type
        };
      } else if (type === 'fog') {
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 0.3 - 0.15,
          size: Math.random() * 35 + 20,
          rotation: 0,
          vRot: 0,
          color: '#BA68C8',
          opacity: Math.random() * 0.12 + 0.05,
          type
        };
      } else if (type === 'sparkles') {
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 4 + 2,
          rotation: Math.random() * Math.PI,
          vRot: 0.05,
          color: Math.random() < 0.5 ? '#FFD700' : '#FFF9C4',
          opacity: Math.random() * 0.7 + 0.3,
          type
        };
      }

      return { x, y, vx: 0, vy: 1, size: 2, color: '#FFF', opacity: 0.5, type: 'none' };
    }

    updateAmbient() {
      if (this.currentWeather === 'none') return;

      for (let i = 0; i < this.ambientParticles.length; i++) {
        const p = this.ambientParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Reset if out of bounds
        if (p.type === 'embers') {
          if (p.y < -20 || p.x < -20 || p.x > this.canvasWidth + 20) {
            this.ambientParticles[i] = this.createAmbientParticle(p.type, false);
          }
        } else {
          if (p.y > this.canvasHeight + 20 || p.x < -40 || p.x > this.canvasWidth + 40) {
            this.ambientParticles[i] = this.createAmbientParticle(p.type, false);
          }
        }
      }
    }

    drawAmbient(ctx) {
      if (this.currentWeather === 'none' || !this.ambientParticles.length) return;

      ctx.save();
      for (const p of this.ambientParticles) {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.type === 'leaves') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === 'mist' || p.type === 'fog') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'sparkles') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // --- Battle Combat Burst Particles ---
    spawnBurst(x, y, color = '#FFD700', count = 20, speed = 4) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = (Math.random() * 0.7 + 0.3) * speed;
        this.combatParticles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 6 + 3,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    spawnCaptureBeam(targetX, targetY, ballX, ballY, onComplete) {
      // Beam of red capture energy connecting target to Pokéball
      const particles = [];
      const steps = 18;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        particles.push({
          x: targetX + (ballX - targetX) * t,
          y: targetY + (ballY - targetY) * t,
          size: Math.random() * 8 + 4,
          color: '#FF1744',
          alpha: 1,
          decay: 0.04
        });
      }
      this.combatParticles.push(...particles);
      if (typeof onComplete === 'function') setTimeout(onComplete, 400);
    }

    updateCombat() {
      for (let i = this.combatParticles.length - 1; i >= 0; i--) {
        const p = this.combatParticles[i];
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        p.alpha -= p.decay || 0.03;
        if (p.alpha <= 0) {
          this.combatParticles.splice(i, 1);
        }
      }
    }

    drawCombat(ctx) {
      if (!this.combatParticles.length) return;
      ctx.save();
      for (const p of this.combatParticles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  return ParticleSystem;
});
