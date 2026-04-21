class LogoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LogoScene' });
    }
    preload() {
      this.load.audio('type', 'assets/sfx/type.mp3');
      this.load.image('logo', 'assets/icons/logo.png');
    }
    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Black background
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // Ghost logo — fades in from black
        const logo = this.add.image(W / 2, H / 2 - 60, 'logo')
            .setScale(0.35)
            .setAlpha(0);

        // MISTWORKS text — starts empty, typed out after logo appears
        const studioText = this.add.text(W / 2, H / 2 + 120, '', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '28px',
            color: '#cccccc',
            letterSpacing: 8,
        }).setOrigin(0.5);

        const fullName = 'MISTWORKS';
        let charIndex = 0;

        // Typewriter sound
        let typeSound = null;
        if (this.cache.audio.exists('type')) {
            typeSound = this.sound.add('type', { volume: 0.5 });
        }

        // 1. Fade in logo
        this.tweens.add({
            targets: logo,
            alpha: 1,
            duration: 1500,
            ease: 'Sine.easeIn',
            delay: 400,
            onComplete: () => {
                // 2. Type out MISTWORKS one character at a time
                this.time.addEvent({
                    delay: 120,          // ms per character
                    repeat: fullName.length - 1,
                    callback: () => {
                        studioText.setText(fullName.substring(0, ++charIndex));
                        if (typeSound) typeSound.play();
                    },
                });

                // 3. Hold, then fade everything out and move to PreloadScene
                const totalTypeTime = fullName.length * 120;
                this.time.delayedCall(totalTypeTime + 1400, () => {
                    this.tweens.add({
                        targets: [logo, studioText],
                        alpha: 0,
                        duration: 800,
                        ease: 'Sine.easeOut',
                        onComplete: () => this.scene.start('PreloadScene'),
                    });
                });
            },
        });
    }
}
