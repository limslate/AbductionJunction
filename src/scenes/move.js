class Move extends Phaser.Scene {
    constructor() {
        super("move");

        this.my = { sprite: {} };

        this.bodyX = 300;
        this.bodyY = 550;

        this.spaceKey = null;
        this.aKey = null;
        this.dKey = null;

        this.bullets = [];
        this.enemyBullets = [];
        this.Enemies = [];

        this.bulletMax = 5;

        this.wave = 1;

        this.score = 0;
        this.health = 5;

        this.waitingForNextWave = false;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image('player', 'shipGreen_manned.png');
        this.load.image('blast', 'laserBlue1.png');
        this.load.image('ray', 'laserBlue2.png');
        this.load.image('cow', 'cow.png');
        this.load.image('chicken', 'chicken.png');
        this.load.image('dog', 'dog.png');
        this.load.image('horse', 'horse.png');
        this.load.image('tree', 'tree_oak.png');
        this.load.audio("bang", "jingles_HIT13.ogg")
        this.load.audio("music", "alec_koff-carnaval-484622.mp3")
    }

    create() {
        let my = this.my;

        this.wave = 1;
        

        this.score = 0;
        this.health = 5;

        this.bullets = [];
        this.enemyBullets = [];
        this.Enemies = [];

        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.mySound = this.sound.add("bang", 1);
        this.mySong = this.sound.add("music", 1);

        
        my.sprite.player = this.add.sprite(this.bodyX, this.bodyY, "player");
        my.sprite.player.setScale(0.5);
        my.sprite.player.flipY = true;

        my.sprite.ray = this.add.sprite(my.sprite.player.x, my.sprite.player.y - 80, "ray");
        my.sprite.ray.visible = false;
        my.sprite.ray.flipY = true;

        my.sprite.tree = this.add.sprite(200, 400, "tree")
        my.sprite.tree.setScale(0.5);
        
        this.scoreText = this.add.text(10, 10, "Score: 0", { fontSize: "20px", fill: "#fff" });
        this.healthText = this.add.text(10, 40, "Lives: 5", { fontSize: "20px", fill: "#fff" });

         this.spawnWave(this.wave); 
         this.mySong.play()
    }

    spawnWave(waveNum) {
    this.Enemies = [];

    let types = ["cow", "horse", "dog", "chicken"];

    for (let i = 0; i < 8; i++) {
        let type = types[i % types.length];

        let x = (i % 2 === 0) ? 0 : 800;
        let y = 50 + i * 30;

        let enemy = this.add.sprite(x, y, type);
        enemy.setScale(0.6);

        this.Enemies.push(enemy);

        let speedBoost = (waveNum === 2) ? 300 : 0;

        this.tweens.add({
            targets: enemy,
            x: x === 0 ? 800 : 0,
            duration: 1200 - speedBoost + i * 100,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });
    }
}

    update(time, delta) {
        let my = this.my;
        let dt = delta / 1000;
        let speed = 300;

        
        this.scoreText.setText("Score: " + this.score);
        this.healthText.setText("Lives: " + this.health);

        my.sprite.ray.x = my.sprite.player.x;
        my.sprite.ray.y = my.sprite.player.y - 80;

    
        my.sprite.player.x = Phaser.Math.Clamp(my.sprite.player.x, 0, 800);

        // Game over
        if (this.health <= 0) {
            this.scene.start("end");
        }

        // New wave
        if (this.Enemies.length === 0 && !this.waitingForNextWave) {
        this.waitingForNextWave = true;
       if (this.wave === 1) {
         this.wave = 2;

         this.time.delayedCall(1000, () => {
            this.spawnWave(2);
            this.waitingForNextWave = false; 
        });

        } else {
            this.time.delayedCall(1000, () => {
            this.scene.start("end");
        });
      }
    }

        // Movement
        if (this.aKey.isDown) {
            my.sprite.player.x -= speed * dt;
        }
        if (this.dKey.isDown) {
            my.sprite.player.x += speed * dt;
        }

        // Shooting
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            my.sprite.ray.visible = true;

            if (this.bullets.length < this.bulletMax) {
                let bullet = this.add.sprite(my.sprite.player.x, my.sprite.player.y, "blast");
                bullet.setScale(0.25);
                this.bullets.push(bullet);
            }
        }

        if (Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
            my.sprite.ray.visible = false;
        }


        // Move bullets
        this.bullets.forEach(b => b.y -= speed * dt);

        // Remove offscreen bullets
        this.bullets = this.bullets.filter(b => {
            if (b.y < 0) {
                b.destroy();
                return false;
            }
            return true;
        });


        for (let j = this.bullets.length - 1; j >= 0; j--) {
                let bullet = this.bullets[j];

                if (Phaser.Geom.Intersects.RectangleToRectangle(
                    my.sprite.tree.getBounds(),
                    bullet.getBounds()
                )) {
                    bullet.destroy();
                    this.bullets.splice(j, 1);
                    break;
                }
            }


        
        for (let i = this.Enemies.length - 1; i >= 0; i--) {
            let enemy = this.Enemies[i];

            for (let j = this.bullets.length - 1; j >= 0; j--) {
                let bullet = this.bullets[j];

                if (Phaser.Geom.Intersects.RectangleToRectangle(
                    enemy.getBounds(),
                    bullet.getBounds()
                )) {
                     this.mySound.play()

                    if (enemy.texture.key === "cow") this.score += 250;
                    else if (enemy.texture.key === "horse") this.score += 200;
                    else if (enemy.texture.key === "dog") this.score += 150;
                    else if (enemy.texture.key === "chicken") this.score += 100;

                    enemy.destroy();
                    bullet.destroy();

                    this.Enemies.splice(i, 1);
                    this.bullets.splice(j, 1);
                    break;
                }
            }
        }

        // Enemy shooting
        this.Enemies.forEach(enemy => {
            if (Math.random() < 0.01) {
                let b = this.add.sprite(enemy.x, enemy.y, "blast");
                b.setScale(0.25);
                this.enemyBullets.push(b);
            }
        });

        // Move enemy bullets
        this.enemyBullets.forEach(b => b.y += speed * dt);

        // Remove offscreen enemy bullets
        this.enemyBullets = this.enemyBullets.filter(b => {
            if (b.y > 600) {
                b.destroy();
                return false;
            }
            return true;
        });

        // Player hit
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            let b = this.enemyBullets[i];

            if (Phaser.Geom.Intersects.RectangleToRectangle(
                b.getBounds(),
                my.sprite.player.getBounds()
            )) {
                b.destroy();
                this.enemyBullets.splice(i, 1);

                this.health -= 1;
            }
        }

       for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            let b = this.enemyBullets[i];

            if (Phaser.Geom.Intersects.RectangleToRectangle(
                b.getBounds(),
                my.sprite.tree.getBounds()
            )) {
                b.destroy();
                this.enemyBullets.splice(i, 1);
            }
        }

    }
}