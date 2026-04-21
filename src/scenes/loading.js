class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
        this.context = 'play';
    }

    init(data) {
        this.context = (data && data.context) ? data.context : 'play';
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // ── Pure black background ─────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // ── Typewriter — large, left side, bleeds off bottom-left ─────
        // Matches the mockup: machine fills bottom-left quadrant,
        // right side of canvas stays black with the paper visible.
        if (this.textures.exists('typwrtr')) {
            this.add.image(W * 0.24, H + 20, 'typwrtr')
                .setScale(0.62)
                .setOrigin(0.5, 1);
        }

        // ── Paper in the carriage slot ────────────────────────────────
        // At scale 0.62, the carriage sits roughly at H - 330
        const paperW = 240;
        const paperH = 72;
        const paperX = W * 0.24;
        const paperY = H - 332;

        const paper = this.add.graphics();
        paper.fillStyle(0xf5f0e0, 1);
        paper.fillRect(paperX - paperW / 2, paperY - paperH / 2, paperW, paperH);

        // ── "LOADING ..." typed on the paper ─────────────────────────
        const loadStr = 'LOADING ...';
        const loadText = this.add.text(
            paperX - paperW / 2 + 16,
            paperY - paperH / 2 + 18,
            '',
            {
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '20px',
                color: '#1a120a',
                letterSpacing: 5,
            }
        ).setOrigin(0, 0);

        // Typewriter sound
        let typeSound = null;
        if (this.cache.audio.exists('type')) {
            typeSound = this.sound.add('type', { volume: 0.5 });
            // Attempt to play immediately; browser may have unlocked audio
            // from the earlier logo/menu interaction
        }

        let charIdx = 0;
        this.time.addEvent({
            delay: 110,
            repeat: loadStr.length - 1,
            callback: () => {
                loadText.setText(loadStr.substring(0, ++charIdx));
                if (typeSound) typeSound.play();
            },
        });

        // ── Blinking cursor after typing finishes ─────────────────────
        const totalTypeMs = loadStr.length * 110 + 150;

        this.time.delayedCall(totalTypeMs, () => {
            const cursorX = paperX - paperW / 2 + 16 + loadText.width + 3;
            const blinkCursor = this.add.text(cursorX, paperY - paperH / 2 + 18, '|', {
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '20px',
                color: '#1a120a',
            }).setOrigin(0, 0);

            this.tweens.add({
                targets: blinkCursor,
                alpha: 0,
                duration: 450,
                yoyo: true,
                repeat: -1,
            });

            // Hold for a realistic beat, then transition
            this.time.delayedCall(1600, () => {
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    // Both play and credits return to menu for now.
                    // Replace 'MenuScene' with your gameplay scene key when ready.
                    this.scene.start('MenuScene');
                });
            });
        });

        // Fade in from black on entry
        this.cameras.main.fadeIn(300, 0, 0, 0);
    }
}
