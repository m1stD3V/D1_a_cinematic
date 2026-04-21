class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Visual assets
        this.load.image('logo',     'assets/icons/logo.png');
        this.load.image('typwrtr',  'assets/environment/typwrtr.png');
        this.load.image('nightSky', 'assets/environment/nightSky.png');
        // Paper is drawn procedurally so no image needed

        // SFX
        this.load.audio('crickets', 'assets/sfx/crickets.mp3');
        this.load.audio('type',     'assets/sfx/type.mp3');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
