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

        // ── Typewriter — large, bottom-left corner ─────────────────────
        if (this.textures.exists('typwrtr')) {
            this.add.image(-120, H + 120, 'typwrtr')
                .setScale(0.7)
                .setOrigin(0, 1)
                .setDepth(10);
        }

        // ── Paper behind the typewriter ────────────────────────────────
        const paperW = 400;
        const paperH = 500;
        const paperX = 250;
        const paperY = H - 250;

        const paper = this.add.graphics();
        paper.setDepth(1);
        paper.fillStyle(0xf5f0e0, 1);
        paper.fillRect(paperX - paperW / 2, paperY - paperH / 2, paperW, paperH);
        
        // Add some lines to the paper for detail
        paper.lineStyle(1, 0xcec6ae, 0.5);
        for (let ly = paperY - paperH / 2 + 30; ly < paperY + paperH / 2 - 20; ly += 25) {
            paper.lineBetween(paperX - paperW / 2 + 20, ly, paperX + paperW / 2 - 20, ly);
        }

        // ── "LOADING ..." typed on the paper ─────────────────────────
        const loadStr = 'LOADING ...';
        const loadText = this.add.text(
            paperX - paperW / 2 + 30,
            paperY - paperH / 2 + 40,
            '',
            {
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '28px',
                color: '#1a120a',
                letterSpacing: 8,
                fontStyle: 'bold'
            }
        ).setOrigin(0, 0).setDepth(2);

        let charIdx = 0;
        this.time.addEvent({
            delay: 110,
            repeat: loadStr.length - 1,
            callback: () => {
                loadText.setText(loadStr.substring(0, ++charIdx));
            },
        });

        // ── Blinking cursor after typing finishes ─────────────────────
        const totalTypeMs = loadStr.length * 110 + 150;

        this.time.delayedCall(totalTypeMs, () => {
            const cursorX = paperX - paperW / 2 + 30 + loadText.width + 10;
            const blinkCursor = this.add.text(cursorX, paperY - paperH / 2 + 40, '|', {
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '28px',
                color: '#1a120a',
                fontStyle: 'bold'
            }).setOrigin(0, 0).setDepth(2);

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
