class End extends Phaser.Scene {
    constructor() {
        super("end");
        
    }

    create() {
        this.add.text(300, 250, "GAME OVER", {
            fontSize: "40px",
            fill: "#00ffee"
        });

        let button = this.add.text(320, 320, "Restart", {
            fontSize: "30px",
            fill: "#fff829"
        })
        .setInteractive();

        button.on("pointerdown", () => {
            //this.scene.stop("move");
            //this.scene.start("move");
            this.scene.start("move"); 
        });
    }
}