class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedIndex = 0;
        this.menuActive = false;
        this.menuButtons = [];
        this._menuStartY = 0;
        this._paperX = 0;
    }

    create() {
        const W = this.scale.width;   // 800
        const H = this.scale.height;  // 600

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 1 — Background zoomed in so curtains + window arch fill
        // the frame. setScale(1.38) zooms without distorting aspect ratio.
        // Shifted up slightly to keep the moon & window prominent.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (this.textures.exists('nightSky')) {
            this.add.image(W / 2, H / 2 - 30, 'nightSky').setScale(1.38);
        } else {
            const bg = this.add.graphics();
            bg.fillGradientStyle(0x050510, 0x050510, 0x0f0f2a, 0x0f0f2a, 1);
            bg.fillRect(0, 0, W, H);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 2 — Typewriter: small, centered low, anchored bottom so
        // it sits on the implied desk. Keys bleed off the bottom edge.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (this.textures.exists('typwrtr')) {
            this.add.image(W / 2, H + 30, 'typwrtr')
                .setScale(0.28)
                .setOrigin(0.5, 1);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 3 — Paper: sits in the carriage, above the typewriter
        // body but below all text. Its bottom edge meets the carriage.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const paperW = 180;
        const paperH = 230;
        const paperX = W / 2;
        const paperBottom = H - 82;          // where the carriage roller sits
        const paperY = paperBottom - paperH / 2;

        const paper = this.add.graphics();
        paper.fillStyle(0xf5f0e0, 1);
        paper.fillRect(paperX - paperW / 2, paperY - paperH / 2, paperW, paperH);
        paper.lineStyle(1, 0xcec6ae, 0.55);
        for (let ly = paperY - paperH / 2 + 24; ly < paperY + paperH / 2 - 8; ly += 15) {
            paper.lineBetween(paperX - paperW / 2 + 12, ly, paperX + paperW / 2 - 12, ly);
        }
        paper.fillStyle(0xd8d0b8, 1);
        paper.fillTriangle(
            paperX + paperW / 2 - 18, paperY - paperH / 2,
            paperX + paperW / 2,      paperY - paperH / 2,
            paperX + paperW / 2,      paperY - paperH / 2 + 18
        );

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // AUDIO — browsers block autoplay until a user gesture occurs.
        // We attempt to play immediately (works if LogoScene already got
        // a click/keypress), then fall back to the first interaction.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        let cricketSound = null;
        let typeSound    = null;
        let audioStarted = false;

        if (this.cache.audio.exists('crickets')) {
            cricketSound = this.sound.add('crickets', { loop: true, volume: 0.4 });
        }
        if (this.cache.audio.exists('type')) {
            typeSound = this.sound.add('type', { volume: 0.55 });
        }

        const startAmbient = () => {
            if (audioStarted) return;
            audioStarted = true;
            if (cricketSound) cricketSound.play();
        };

        // Try immediately — succeeds if user already interacted (logo scene)
        startAmbient();
        // Safety net for first-visit with no prior gesture
        this.input.once('pointerdown', startAmbient);
        this.input.keyboard.once('keydown', startAmbient);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 4 — Intro text typed on paper
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const introString =
            "If you are reading this, " +
            "then I am knee deep in " +
            "trouble and probably will " +
            "need some help. " +
            "These might be my....";

        const introText = this.add.text(
            paperX - paperW / 2 + 12,
            paperY - paperH / 2 + 12,
            '',
            {
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '11px',
                color: '#2a1f0e',
                wordWrap: { width: paperW - 24 },
                lineSpacing: 2,
            }
        ).setOrigin(0, 0);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 5 — Title + menu (hidden until intro fades out)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const titleText = this.add.text(paperX, paperY - paperH / 2 + 28, 'LAST WORDS', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '22px',
            color: '#1a120a',
            letterSpacing: 5,
        }).setOrigin(0.5).setAlpha(0);

        const menuDefs = [
            { label: 'START',   action: () => this.goToLoading('play')    },
            { label: 'CREDITS', action: () => this.goToLoading('credits') },
            { label: 'QUIT',    action: () => window.close()              },
        ];

        const menuStartY = paperY - paperH / 2 + 90;
        this._menuStartY = menuStartY;
        this._paperX     = paperX;
        this.menuButtons = [];

        menuDefs.forEach((item, i) => {
            const btn = this.add.text(paperX + 10, menuStartY + i * 28, item.label, {
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '13px',
                color: '#5a4a30',
                letterSpacing: 3,
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                if (!this.menuActive) return;
                this.selectedIndex = i;
                this.updateSelection();
            })
            .on('pointerdown', () => {
                if (!this.menuActive) return;
                item.action();
            });
            btn._action = item.action;
            this.menuButtons.push(btn);
        });

        const hintText = this.add.text(paperX, paperY + paperH / 2 - 14,
            '↑ ↓  move    ENTER  select', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '8px',
            color: '#8a7a60',
        }).setOrigin(0.5).setAlpha(0);

        this.cursor = this.add.text(0, 0, '›', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '13px',
            color: '#1a120a',
        }).setOrigin(0.5).setAlpha(0);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Keyboard navigation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const keys     = this.input.keyboard.createCursorKeys();
        const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        keys.up.on('down', () => {
            if (!this.menuActive) return;
            this.selectedIndex = (this.selectedIndex - 1 + menuDefs.length) % menuDefs.length;
            this.updateSelection();
        });
        keys.down.on('down', () => {
            if (!this.menuActive) return;
            this.selectedIndex = (this.selectedIndex + 1) % menuDefs.length;
            this.updateSelection();
        });
        enterKey.on('down', () => {
            if (!this.menuActive) return;
            menuDefs[this.selectedIndex].action();
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // TIMELINE — small pause, then type, then swap to menu
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        let charIdx = 0;
        const charDelay = 60;

        this.time.delayedCall(500, () => {
            startAmbient(); // second attempt after scene has settled
            this.time.addEvent({
                delay: charDelay,
                repeat: introString.length - 1,
                callback: () => {
                    introText.setText(introString.substring(0, ++charIdx));
                    if (typeSound) typeSound.play();
                },
            });
        });

        const totalTypeMs = 500 + introString.length * charDelay;

        this.time.delayedCall(totalTypeMs + 1800, () => {
            this.tweens.add({
                targets: introText,
                alpha: 0,
                duration: 800,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    this.tweens.add({ targets: titleText, alpha: 1, duration: 600 });

                    this.menuButtons.forEach((btn, i) => {
                        this.tweens.add({
                            targets: btn,
                            alpha: 1,
                            duration: 400,
                            delay: 200 + i * 140,
                        });
                    });

                    this.tweens.add({ targets: hintText, alpha: 1, duration: 400, delay: 700 });
                    this.tweens.add({
                        targets: this.cursor,
                        alpha: 1,
                        duration: 400,
                        delay: 700,
                        onComplete: () => {
                            this.menuActive = true;
                            this.updateSelection();
                        },
                    });
                },
            });
        });
    }

    updateSelection() {
        this.menuButtons.forEach((btn, i) => {
            if (i === this.selectedIndex) {
                btn.setColor('#000000');
                this.cursor.setPosition(
                    this._paperX - 52,
                    this._menuStartY + i * 28
                );
            } else {
                btn.setColor('#5a4a30');
            }
        });
    }

    goToLoading(context) {
        this.menuActive = false;
        this.sound.stopAll();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('LoadingScene', { context });
        });
    }
}
