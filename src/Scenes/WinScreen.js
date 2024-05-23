class WinScreen extends Phaser.Scene {
    constructor() {
        super("WinScreen");
        this.my = {sprite: {}};
        this.update = this.update.bind(this);
        
    }   
    
    
    create() {
        let my = this.my;
        this.nextScene = this.input.keyboard.addKey("S");


        this.add.text(370, 200, "Ice Ice Climb", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });

        this.add.text(350, 300, "You Won Congratulations! Press S to Play Again", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 120
            }
        });


    }

    update() {


        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("platformerScene");
        }

    }


 }    