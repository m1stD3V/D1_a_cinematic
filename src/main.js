class Main extends Phaser.Scene
{

const config = {  
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scenes: [preload],
    };
const game = new Phaser.Game(config);


};