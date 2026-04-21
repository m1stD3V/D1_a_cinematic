const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0a0a12',
    scene: [LogoScene, PreloadScene, MenuScene, LoadingScene],
};

const game = new Phaser.Game(config);
