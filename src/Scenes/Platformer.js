class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.lastWalkingSoundTime = 0;
    }

    init() {
        // variables and settings
        this.ACCELERATION = 300;
        this.DRAG = 10000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    preload() {
        this.load.audio("walkingSound", "impactSoft_medium_003.ogg");
        this.load.audio("jumpSound", "impactSoft_heavy_002.ogg");
        this.load.image('raindrop','assets/pngtree-pixel-art-game-supplies-water-drop-pattern-png-image_3430225.jpg');
        this.load.audio("coincollect","assets/collect-points-190037.mp3");
        this.load.audio("mushroomget", "assets/power-up-sparkle-1-177983.mp3")
        
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 50, 100);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.Mushroom = this.map.createFromObjects("Objects", {
            name: "Mushroom",
            key: "tilemap_sheet",
            frame: 128
        });

        this.Flag = this.map.createFromObjects("Objects", {
            name: "Flag",
            key: "tilemap_sheet",
            frame: 112
        });

        this.raindrops = [];

    // Create raindrop sprites
    for (let i = 0; i < 100; i++) { // Adjust the number of raindrops as needed
        const x = Phaser.Math.Between(0, this.cameras.main.width); // Random X position
        const y = Phaser.Math.Between(-100, -10); // Random Y position above the screen
        const raindrop = this.add.image(x, y, 'raindrop')
        raindrop.setScale(0.01);
        this.raindrops.push(raindrop);
    }

        // Since we scaled the groundLayer, we also need to adjust the x, y, and coin size
        // by the same scale

        this.coins.map((coin) => {
            //coin.x *= this.SCALE;
            //coin.y *= this.SCALE;
            //coin.setScale(this.SCALE);
        });

        this.Mushroom.map((Mushroom) => {
            //coin.x *= this.SCALE;
            //coin.y *= this.SCALE;
            //coin.setScale(this.SCALE);
        });

        this.Flag.map((Flag) => {
            //coin.x *= this.SCALE;
            //coin.y *= this.SCALE;
            //coin.setScale(this.SCALE);
        });
        

        // TODO: Add turn into Arcade Physics here

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.Mushroom, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.Flag, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        this.FlagGroup = this.add.group(this.Flags);
        

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 1700, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.scale = .7
        this.physics.world.TILE_BIAS = 24;
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // TODO: Add coin collision handler 

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.sound.play("coincollect", { volume: .5 });
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.world.enable(this.Mushroom, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.MushroomGroup = this.add.group(this.Mushroom);
        

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // TODO: Add coin collision handler 

        // Handle collision detection with coins

        this.physics.add.overlap(my.sprite.player, this.Mushroom, (obj1, obj2) => {
            this.sound.play("mushroomget", { volume: .5 });
            obj2.destroy(); // remove mushroom on overlap
            this.physics.world.gravity.y = 1000;
    
            // Set a timer to revert gravity back to its original state after ten seconds
            this.time.delayedCall(10000, () => {
                this.physics.world.gravity.y = 2000; // Original gravity value
            });
        });

        this.physics.add.overlap(my.sprite.player, this.Flag, (obj1, obj2) => {
            this.scene.start("WinScreen");
        });
        

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_05.png', 'star_06.png'],
            // TODO: Try: add random: true
            scale: {start: 0.02, end: 0.1},
            maxAliveParticles: 9,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_05.png', 'star_06.png'],
            // TODO: Try: add random: true
            scale: {start: 1, end: 0.5},
            maxAliveParticles: 1,
            lifespan: 250,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.08, 0.08); // Set the deadzone to 8% of the screen width and height
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.setLerp(.1); // Adjust the lerp value for smoother or faster follow


    }

    update() {

        const currentTime = this.time.now; // Get the current time

        this.raindrops.forEach((raindrop) => {
            raindrop.y += 5; // Adjust the speed of raindrops falling
            if (raindrop.y > this.cameras.main.height) { // Reset raindrop position if it goes below the screen
                raindrop.y = Phaser.Math.Between(-100, -10);
                raindrop.x = Phaser.Math.Between(0, this.cameras.main.width);
            }
        });


        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
 

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();
                if (currentTime - this.lastWalkingSoundTime > 400) { // 500 ms delay
                    this.sound.play("walkingSound", { volume: .5 });
                    this.lastWalkingSoundTime = currentTime; // Update the last sound play time
                    //console.log('Playing walking sound at:', currentTime); // Debug log
                }

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
        
            // TODO: add particle following code here

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, true);
            

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();
                if (currentTime - this.lastWalkingSoundTime > 400) { // 500 ms delay
                    this.sound.play("walkingSound", { volume: .5 });
                    this.lastWalkingSoundTime = currentTime; // Update the last sound play time
                    //console.log('Playing walking sound at:', currentTime); // Debug log
                }

            }
            

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // Player jump
    if (my.sprite.player.body.blocked.down || my.sprite.player.body.touching.down) {
        // Reset the number of jumps if the player is on the ground
        my.sprite.player.jumps = 0;
        // Smoothly move the camera to the middle of the screen where the player is
        this.cameras.main.pan(my.sprite.player.x, this.cameras.main.midPoint.y, 500, 'Linear');

    }

    // Double jump logic
    if (Phaser.Input.Keyboard.JustDown(cursors.up) && my.sprite.player.jumps < 2) {
        if (my.sprite.player.jumps === 0 || (my.sprite.player.jumps === 1 && !my.sprite.player.body.blocked.down)) {
            my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
            my.sprite.player.jumps++;
        }
        this.cameras.main.pan(my.sprite.player.x, this.cameras.main.midPoint.y, 500, 'Linear');
    }

    // Cap the player's horizontal speed
    const MAX_SPEED_X = 300; // Adjust this value as needed

    if (my.sprite.player.body.velocity.x > MAX_SPEED_X) {
        my.sprite.player.setVelocityX(MAX_SPEED_X);
    } else if (my.sprite.player.body.velocity.x < -MAX_SPEED_X) {
        my.sprite.player.setVelocityX(-MAX_SPEED_X);
    }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}