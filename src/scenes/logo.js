class LogoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LogoScene' });
    }
    preload() {
      this.load.audio('ghost', 'assets/sfx/ghost.mp3');
      this.load.image('logo', 'assets/icons/logo.png');
      this.load.image('mistworks', 'assets/icons/mistworks.png');
    }
    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Black background
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // Click to start prompt
        const startText = this.add.text(W / 2, H / 2, 'CLICK TO START', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '20px',
            color: '#444444',
        }).setOrigin(0.5);

        // Ghost logo — hidden initially
        const logo = this.add.image(W / 2, H / 2 - 40, 'logo')
            .setScale(0.35)
            .setAlpha(0);

        // MISTWORKS logo image — hidden initially
        const studioLogo = this.add.image(W / 2, H / 2 + 160, 'mistworks')
            .setScale(0.3)
            .setAlpha(0);

        // Sounds
        let ghostSound = null;
        if (this.cache.audio.exists('ghost')) {
            ghostSound = this.sound.add('ghost', { volume: 0.6 });
        }

        const runLogoSequence = () => {
            // Remove prompt and resume audio context if needed
            startText.destroy();
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }

            const transitionOut = () => {
                this.tweens.add({
                    targets: [logo, studioLogo],
                    alpha: 0,
                    duration: 1000,
                    ease: 'Sine.easeOut',
                    delay: 500,
                    onComplete: () => this.scene.start('PreloadScene'),
                });
            };

            // 1. Fade in both logos
            this.tweens.add({
                targets: [logo, studioLogo],
                alpha: 1,
                duration: 2000,
                ease: 'Sine.easeIn',
                delay: 400,
                onStart: () => {
                    if (ghostSound) ghostSound.play();
                },
                onComplete: () => {
                    // Wait for ghost sound to end before transitioning
                    if (ghostSound && ghostSound.isPlaying) {
                        ghostSound.once('complete', transitionOut);
                    } else {
                        this.time.delayedCall(1500, transitionOut);
                    }
                },
            });
        };

        // Listen for first interaction
        this.input.once('pointerdown', runLogoSequence);
        this.input.keyboard.once('keydown', runLogoSequence);
    }
}
