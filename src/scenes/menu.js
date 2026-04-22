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

        // Fade in from black on entry
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 1 — Background zoomed in so curtains + window arch fill
        // the frame. setScale(1.38) zooms without distorting aspect ratio.
        // Shifted up slightly to keep the moon & window prominent.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (this.textures.exists('nightSky')) {
            this.add.image(W / 2, H / 2 - 30, 'nightSky').setScale(1.5).setDepth(0);
        } else {
            const bg = this.add.graphics();
            bg.fillGradientStyle(0x050510, 0x050510, 0x0f0f2a, 0x0f0f2a, 1);
            bg.fillRect(0, 0, W, H);
            bg.setDepth(0);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 2 — Typewriter: small, centered low, anchored bottom so
        // it sits on the implied desk. Keys bleed off the bottom edge.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (this.textures.exists('typwrtr')) {
            this.add.image(W / 2, H + 80, 'typwrtr')
                .setScale(0.28)
                .setOrigin(0.5, 1)
                .setDepth(10);
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
        paper.setDepth(1);
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
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        let cricketSound = null;

        if (this.cache.audio.exists('crickets')) {
            cricketSound = this.sound.add('crickets', { loop: true, volume: 0.3 });
        }

        const startAmbient = () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
            if (cricketSound && !cricketSound.isPlaying) {
                cricketSound.play();
            }
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
        ).setOrigin(0, 0).setDepth(2);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // LAYER 5 — Title + menu (hidden until intro fades out)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const titleText = this.add.text(paperX, paperY - paperH / 2 + 28, 'LAST WORDS', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '22px',
            color: '#1a120a',
            letterSpacing: 5,
        }).setOrigin(0.5).setAlpha(0).setDepth(2);

        const menuDefs = [
            { label: 'START',   action: () => this.goToLoading('play')    },
            { label: 'CREDITS', action: () => this.goToLoading('credits') },
            { label: 'QUIT',    action: () => window.close()              },
        ];

        const menuCenterY = paperY + 20;
        this._menuCenterY = menuCenterY;
        this._paperX      = paperX;
        this.menuButtons  = [];

        menuDefs.forEach((item, i) => {
            const btn = this.add.text(paperX, menuCenterY, item.label, {
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '24px',
                color: '#5a4a30',
                letterSpacing: 4,
                fontStyle: 'bold'
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(2)
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

        const hintText = this.add.text(paperX, paperY + paperH / 2 - 20,
            '[ NAVIGATION KEY ]\n↑ ↓ Move   ↵ Enter Select', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '9px',
            color: '#8a7a60',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(2);

        this.cursor = this.add.text(0, 0, '›', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '18px',
            color: '#1a120a',
        }).setOrigin(0.5).setAlpha(0).setDepth(2);

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
        const charDelay = 75;
        let typeLoop = null;

        this.time.delayedCall(500, () => {
            // Start the looping sound when typing begins
            if (this.cache.audio.exists('type')) {
                typeLoop = this.sound.add('type', { loop: true, volume: 0.6 });
                if (this.sound.context.state === 'suspended') {
                    this.sound.context.resume();
                }
                typeLoop.play();
            }

            this.time.addEvent({
                delay: charDelay,
                repeat: introString.length - 1,
                callback: () => {
                    introText.setText(introString.substring(0, ++charIdx));
                    
                    // Stop the loop exactly when typing finishes
                    if (charIdx === introString.length && typeLoop) {
                        typeLoop.stop();
                    }
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
        const spacing = 45;
        this.menuButtons.forEach((btn, i) => {
            let diff = i - this.selectedIndex;
            const count = this.menuButtons.length;

            // Carousel wrapping logic: find the shortest path in the loop
            if (diff > count / 2) diff -= count;
            if (diff < -count / 2) diff += count;

            const targetY = this._menuCenterY + diff * spacing;
            const isSelected = i === this.selectedIndex;
            const targetAlpha = isSelected ? 1 : 0.4;
            const targetScale = isSelected ? 1.1 : 0.7;

            this.tweens.add({
                targets: btn,
                y: targetY,
                alpha: targetAlpha,
                scaleX: targetScale,
                scaleY: targetScale,
                duration: 250,
                ease: 'Cubic.easeOut',
                onUpdate: () => {
                    if (isSelected) {
                        btn.setColor('#1a120a');
                    } else {
                        btn.setColor('#5a4a30');
                    }
                }
            });

            if (isSelected) {
                this.cursor.setPosition(
                    this._paperX - 60,
                    this._menuCenterY
                );
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
