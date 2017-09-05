//Initialize Phaser, create 400x490 px game

var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game');

//create the main state which contains the game

var mainState = {
    
    // executies at the beginning
    //load game assets
    preload: function() {
        
                //add instructional text
        this.controlText = game.add.text(125, 445, "Press Space", {font: "30px Arial", fill: '#000000'});
        
        //load images
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('bird', 'assets/bird.png'); 
        game.load.image('pipe', 'assets/pipe.png');
        game.load.audio('jump', 'assets/jump.wav');
    },
   
    // function is called after preload
    // set up the game, display sprites
    create: function() {
        
        
        
        //setup physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //display the bird
        this.bird = this.game.add.sprite(100, 245, 'bird');
        
        //attach the sound
        this.jumpSound = game.add.audio('jump');
        
        //add gravity to the bird
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;
        
        //call 'jump' when space is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);     
        
        //create a group of 20 pipes
        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');
        
        //create a row of pipes every 1.5 seconds
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        
        //create score mechanism
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", {font: "30px Arial", fill: '#ffffff'});
        

        
        //set bird center of rotation
        this.bird.anchor.setTo(-0.2, 0.5);
    },
    
    // function is called at 60 fps
    // contains game logic
    update: function() {
        //if the bird is out of the window call 'restartGame'
        if (this.bird.inWorld == false)
            this.restartGame();
        
        //restart on collision
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        
        //animate bird angle
        if (this.bird.angle < 20)
            this.bird.angle += 1;
        
    },
    
    
    jump: function() {
        //dont jump if dead
        if (this.bird.alive == false)
            return;
        
        //add vertical velocity
        this.bird.body.velocity.y = -350;
        //animate spin
        var animation = game.add.tween(this.bird);
        //change angle to -20 deg in 100 ms
        animation.to({angle: -20}, 100).start();
        
        //play jump sound
        this.jumpSound.play();
        
        //clear control text
        this.controlText.text = "";
    },
    
    //restart te game
    restartGame: function() {
        //restart
        game.state.start('main');
    },
    
    addOnePipe: function(x, y) {
        //get the first dead pipe of the group
        var pipe = this.pipes.getFirstDead();
        
        //set the pipes position
        pipe.reset(x, y);
        
        //add pipe velocity
        pipe.body.velocity.x = -200;
        
        //kill the pipe when it leaves the screen
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    
    addRowOfPipes: function() {
        //increment the score
        this.score += 1;
        this.labelScore.text = this.score;
        
        //pick where the hole will be
        var hole = Math.floor(Math.random() * 5) + 1;
        
        //add 6 pipes
        for (var i = 0; i < 8; i++)
            if (i !=hole && i != hole+1)
                this.addOnePipe(400, i*60 + 10);
        
    },
    
    hitPipe: function() {
      //if the bird has hit a pipe do nothing
        if (this.bird.alive == false)
            return;
        
        //kill the bird
        this.bird.alive = false;
        
        //stop new pipes from appearing
        game.time.events.remove(this.timer);
        
        //stop all pipes
        this.pipes.forEachAlive(function(p) { p.body.velocity.x = 0;}, this);
    },
    
};

game.state.add('main', mainState);
game.state.start('main');