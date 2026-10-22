class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0
  }) {
    this.position = position || { x: 0, y: 0 };
    this.velocity = velocity;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.width = 48;
    this.height = 48;

    if (image && image.src) {
      this.image.onload = () => {
        this.width = this.image.width / this.frames.max;
        this.height = this.image.height;
      };
      this.image.src = image.src;
    }

    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
    this.rotation = rotation;
    this.scale = 1;
  }

  draw() {
    if (!this.image || !this.image.complete || !this.image.src) return;

    c.save();
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    if (this.scale !== 1) {
      c.scale(this.scale, this.scale);
    }
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );
    c.globalAlpha = this.opacity;

    c.drawImage(
      this.image,
      this.frames.val * (this.image.width / this.frames.max),
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    c.restore();

    if (!this.animate) return;

    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
  }
}

class Monster extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = true,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
    pokemonInstance
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    });

    this.isEnemy = isEnemy;
    this.name = name || 'Emby';
    this.attacks = attacks || [];
    this.pokemonInstance = pokemonInstance || null;
    this.width = 120;
    this.height = 120;

    if (this.pokemonInstance) {
      this.health = Math.round((this.pokemonInstance.currentHp / this.pokemonInstance.maxHp) * 100);
      this.name = this.pokemonInstance.name;
    } else {
      this.health = 100;
    }

    // Idle breathing offset
    this.bobElapsed = Math.random() * 100;
  }

  draw() {
    this.bobElapsed += 0.05;
    const bobOffset = Math.sin(this.bobElapsed) * 3;

    // Check if we have an image sheet loaded (e.g. Emby or Draggle)
    const hasImageSheet = (this.image && this.image.complete && this.image.naturalWidth > 0);

    if (hasImageSheet) {
      super.draw();
    } else if (typeof SpriteRenderer !== 'undefined' && this.pokemonInstance) {
      // Use procedural sprite renderer
      c.save();
      c.globalAlpha = this.opacity;
      if (this.scale !== 1) {
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.scale(this.scale, this.scale);
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
      }
      SpriteRenderer.drawProceduralPokemon(
        c,
        this.pokemonInstance,
        this.position.x,
        this.position.y,
        this.width,
        this.height,
        !this.isEnemy,
        bobOffset
      );
      c.restore();
    } else {
      super.draw();
    }
  }

  faint() {
    const dialogue = document.querySelector('#dialogueBox');
    if (dialogue) {
      dialogue.style.display = 'block';
      dialogue.innerHTML = `${this.name} fainted!`;
    }

    gsap.to(this.position, {
      y: this.position.y + 25,
      duration: 0.4
    });
    gsap.to(this, {
      opacity: 0,
      duration: 0.4
    });

    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSfx('faint');
    }
  }

  attack({ attack, recipient, renderedSprites, onComplete }) {
    const dialogue = document.querySelector('#dialogueBox');
    if (dialogue) {
      dialogue.style.display = 'block';
      dialogue.innerHTML = `${this.name} used ${attack.name}!`;
    }

    const healthBar = this.isEnemy ? '#playerHealthBar' : '#enemyHealthBar';
    const hpText = this.isEnemy ? '#playerHpText' : '#enemyHpText';

    const finishAttack = () => {
      // Recipient flinch and flash
      gsap.to(recipient.position, {
        x: recipient.position.x + (this.isEnemy ? -8 : 8),
        yoyo: true,
        repeat: 5,
        duration: 0.06
      });

      gsap.to(recipient, {
        opacity: 0,
        repeat: 5,
        yoyo: true,
        duration: 0.06,
        onComplete: () => {
          recipient.opacity = 1;
          if (typeof onComplete === 'function') onComplete();
        }
      });

      // Update target health bar smoothly
      if (recipient.pokemonInstance) {
        const hpPct = Math.max(0, Math.round((recipient.pokemonInstance.currentHp / recipient.pokemonInstance.maxHp) * 100));
        gsap.to(healthBar, {
          width: hpPct + '%',
          duration: 0.4
        });
        const hpEl = document.querySelector(hpText);
        if (hpEl) hpEl.textContent = `${recipient.pokemonInstance.currentHp} / ${recipient.pokemonInstance.maxHp} HP`;
      } else {
        recipient.health = Math.max(0, recipient.health - (attack.damage || 20));
        gsap.to(healthBar, {
          width: recipient.health + '%',
          duration: 0.4
        });
      }
    };

    // Determine attack animation
    const anim = attack.animation || 'tackle';

    if (anim === 'fireball') {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('initFireball');

      const fireballImg = new Image();
      fireballImg.src = './img/fireball.png';
      const fireball = new Sprite({
        position: { x: this.position.x + 20, y: this.position.y + 20 },
        image: fireballImg,
        frames: { max: 4, hold: 10 },
        animate: true,
        rotation: this.isEnemy ? -2.2 : 1
      });
      renderedSprites.splice(1, 0, fireball);

      gsap.to(fireball.position, {
        x: recipient.position.x + 20,
        y: recipient.position.y + 20,
        duration: 0.45,
        onComplete: () => {
          if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('fireballHit');
          if ((typeof window !== 'undefined' && window.particleSystem)) {
            (typeof window !== 'undefined' && window.particleSystem).spawnBurst(recipient.position.x + 40, recipient.position.y + 40, '#F97316', 25);
          }
          renderedSprites.splice(1, 1);
          finishAttack();
        }
      });
    } else if (anim === 'water' || anim === 'beam') {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('superEffective');
      if ((typeof window !== 'undefined' && window.particleSystem)) {
        (typeof window !== 'undefined' && window.particleSystem).spawnBurst(recipient.position.x + 40, recipient.position.y + 40, anim === 'water' ? '#38BDF8' : '#FACC15', 30);
      }
      setTimeout(finishAttack, 250);
    } else if (anim === 'lightning') {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('superEffective');
      if ((typeof window !== 'undefined' && window.particleSystem)) {
        (typeof window !== 'undefined' && window.particleSystem).spawnBurst(recipient.position.x + 40, recipient.position.y + 40, '#FDE047', 35);
      }
      setTimeout(finishAttack, 250);
    } else if (anim === 'leaf') {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('tackleHit');
      if ((typeof window !== 'undefined' && window.particleSystem)) {
        (typeof window !== 'undefined' && window.particleSystem).spawnBurst(recipient.position.x + 40, recipient.position.y + 40, '#4ADE80', 25);
      }
      setTimeout(finishAttack, 250);
    } else if (anim === 'shadow' || anim === 'psychic') {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('hit');
      if ((typeof window !== 'undefined' && window.particleSystem)) {
        (typeof window !== 'undefined' && window.particleSystem).spawnBurst(recipient.position.x + 40, recipient.position.y + 40, anim === 'shadow' ? '#9333EA' : '#EC4899', 30);
      }
      setTimeout(finishAttack, 250);
    } else {
      // Default Tackle rush
      const tl = gsap.timeline();
      const distance = this.isEnemy ? -25 : 25;

      tl.to(this.position, {
        x: this.position.x - distance,
        duration: 0.15
      })
      .to(this.position, {
        x: this.position.x + distance * 2,
        duration: 0.1,
        onComplete: () => {
          if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('tackleHit');
          if ((typeof window !== 'undefined' && window.particleSystem)) {
            (typeof window !== 'undefined' && window.particleSystem).spawnBurst(recipient.position.x + 40, recipient.position.y + 40, '#CBD5E1', 15);
          }
          finishAttack();
        }
      })
      .to(this.position, {
        x: this.position.x,
        duration: 0.2
      });
    }
  }
}

class PokeballActor {
  constructor({ startPosition, targetPosition, shakes = 4, success = true, onComplete }) {
    this.x = startPosition.x;
    this.y = startPosition.y;
    this.targetX = targetPosition.x;
    this.targetY = targetPosition.y;
    this.shakes = shakes;
    this.success = success;
    this.onComplete = onComplete;
    this.rotation = 0;
    this.scale = 1;
    this.visible = true;
    this.radius = 12;
  }

  start(renderedSprites, recipient) {
    if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('ballThrow');

    renderedSprites.push(this);

    // Arc trajectory using GSAP
    gsap.to(this, {
      x: this.targetX,
      rotation: Math.PI * 4,
      duration: 0.6,
      ease: 'power1.out'
    });

    gsap.to(this, {
      y: this.targetY - 60,
      duration: 0.3,
      ease: 'power1.out',
      onComplete: () => {
        gsap.to(this, {
          y: this.targetY + 20,
          duration: 0.3,
          ease: 'power1.in',
          onComplete: () => {
            // Ball hits ground & captures target
            if ((typeof window !== 'undefined' && window.particleSystem)) {
              (typeof window !== 'undefined' && window.particleSystem).spawnCaptureBeam(
                recipient.position.x + 50,
                recipient.position.y + 50,
                this.x,
                this.y
              );
            }

            // Shrink recipient into ball
            gsap.to(recipient, {
              scale: 0.1,
              opacity: 0,
              duration: 0.35,
              onComplete: () => {
                this.executeShakes(renderedSprites, recipient);
              }
            });
          }
        });
      }
    });
  }

  executeShakes(renderedSprites, recipient) {
    let shakeCount = 0;

    const doShake = () => {
      if (shakeCount >= this.shakes) {
        if (this.success) {
          // Success!
          if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('ballCatch');
          if ((typeof window !== 'undefined' && window.particleSystem)) {
            (typeof window !== 'undefined' && window.particleSystem).spawnBurst(this.x, this.y, '#FFD700', 35);
          }
          setTimeout(() => {
            if (typeof this.onComplete === 'function') this.onComplete(true);
          }, 800);
        } else {
          // Broke free!
          if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('faint');
          if ((typeof window !== 'undefined' && window.particleSystem)) {
            (typeof window !== 'undefined' && window.particleSystem).spawnBurst(this.x, this.y, '#94A3B8', 20);
          }
          // Remove ball from render
          const idx = renderedSprites.indexOf(this);
          if (idx !== -1) renderedSprites.splice(idx, 1);

          // Restore recipient
          gsap.to(recipient, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            onComplete: () => {
              if (typeof this.onComplete === 'function') this.onComplete(false);
            }
          });
        }
        return;
      }

      shakeCount++;
      if (typeof AudioEngine !== 'undefined') AudioEngine.playSfx('ballShake');

      // Wobble animation
      gsap.to(this, {
        rotation: 0.35,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.to(this, {
            rotation: -0.35,
            duration: 0.12,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              this.rotation = 0;
              setTimeout(doShake, 350);
            }
          });
        }
      });
    };

    setTimeout(doShake, 300);
  }

  draw() {
    if (!this.visible) return;

    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rotation);

    // Pokéball Top Half (Red)
    c.fillStyle = '#E53935';
    c.beginPath();
    c.arc(0, 0, this.radius, Math.PI, 0, false);
    c.closePath();
    c.fill();
    c.strokeStyle = '#000';
    c.lineWidth = 2;
    c.stroke();

    // Pokéball Bottom Half (White)
    c.fillStyle = '#FFFFFF';
    c.beginPath();
    c.arc(0, 0, this.radius, 0, Math.PI, false);
    c.closePath();
    c.fill();
    c.stroke();

    // Center band
    c.fillStyle = '#000';
    c.fillRect(-this.radius, -1.5, this.radius * 2, 3);

    // Center button
    c.fillStyle = '#FFFFFF';
    c.beginPath();
    c.arc(0, 0, 4, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    c.restore();
  }
}

class Boundary {
  static width = 48;
  static height = 48;
  constructor({ position }) {
    this.position = position;
    this.width = 48;
    this.height = 48;
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)';
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
