"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  
    },
    width: 800,
    height: 600,
    backgroundColor: '#00CC22',
    scene: [Move, End]
}

const game = new Phaser.Game(config);