class preload extends Phaser.Scene
{
    preload() {
        // Preloading all visual assets i.e. environment assets, sprite assets, etc.
        this.load.image('logo', 'assets/icons/logo.png');
        this.load.image('typwrtr', 'assets/environment/typwrtr.png');
        this.load.sprite('paper', 'assets/sprites/paper.png');
        this.load.image('nightSky', 'assets/environment/nightSky.png');

        // Preloading all SFX assets
        this.load.sound('crickets', 'assets/sfx/crickets.mp3');
        this.load.sound('type', 'assets/sfx/type.mp3');

    }
}