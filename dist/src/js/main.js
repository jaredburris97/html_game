// =============================================================================
// Sprites
// =============================================================================
//
// Hero
//
function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');

    // anchor
    this.anchor.set(0.5, 0.5);
    // physics properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    // animations
    this.animations.add('stop', [0, 1], 1, true);
    this.animations.add('run', [1, 2], 8, true); // 8fps looped
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
    this.animations.add('die', [5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6], 8); // 12fps no loop
    // starting animation
    this.animations.play('stop');

    //console.log("Hero function position: " + this.position);
};

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    // guard
    if (this.isFrozen) { return; }

    const SPEED = 250;
    this.body.velocity.x = direction * SPEED;

    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 500;
    let canJump = this.body.touching.down && this.alive && !this.isFrozen;

    if (canJump || this.isBoosting) {
        this.body.velocity.y = -JUMP_SPEED;
        this.isBoosting = true;
    }

    return canJump;
};

Hero.prototype.stopJumpBoost = function () {
    this.isBoosting = false;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 300;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};

Hero.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// returns the animation name that should be playing depending on
// current circumstances
Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // dying
    if (!this.alive) {
        name = 'die';
    }
    // frozen & not dying
    else if (this.isFrozen) {
        name = 'stop';
    }
    // jumping
    else if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }
    //console.log(name);
    return name;
};

//
// Spider (enemy)
//

function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');
    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0,4,1,3,2,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,0,4,3,4,0,3,4,3,0,4,3,4], 12);
    this.animations.play('crawl');
    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
};
Spider.SPEED = 300;
// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }

    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};
Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};
//
// Projectile
//
function Projectile(game, x, y) {
    console.log(game);
    //console.log(this);
    //Move spawned object off the stage
    y = y + 500;
    //console.log("projectile x is ",x);
    //console.log("projectile y is ",y);
    Phaser.Sprite.call(this, game, x, y, 'projectile');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    //Fly out of world
    this.body.collideWorldBounds = false;
    this.body.allowGravity = false;
    //We don't want the projectile in the world until gun is fired
    this.enableBody = false;
    this.visible = false;
    console.log("Projectile constructor completed...");
};
Projectile.prototype = Object.create(Phaser.Sprite.prototype);
Projectile.prototype.constructor = Projectile;

Projectile.prototype.move = function (direction) {
    if (this.isFrozen) { return; }

    const BULLET_SPEED = 1000;
    this.body.velocity.x = direction * BULLET_SPEED;

    //flips direction based on travel direction
     if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

//
// Big Boss MR. CLEAN
//
const BOSS_SPEED = 325;
function Boss(game, x, y) {
    console.log(this);
    console.log("boss x is ",x);
    console.log("boss y is ",y);

    Phaser.Sprite.call(this, game, x, y, 'boss');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.allowGravity = false;
    //We don't want the boss in the world until the LAST LEVEL
    this.enableBody = true;
    this.visible = true;
    this.body.velocity.x = Boss.BOSS_SPEED;
    console.log("Boss constructor created...");
};
Boss.prototype = Object.create(Phaser.Sprite.prototype);
Boss.prototype.constructor = Boss;

Boss.prototype.move = function (direction) {
    if (this.isFrozen) { return; }

    this.body.velocity.x = direction * BOSS_SPEED;

    //These if statements flip the image base on current velocity direction
     if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Boss.prototype.update = function () {

    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Boss.BOSS_SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Boss.BOSS_SPEED; // turn right
    }
    this.body.velocity.x = this.body.velocity.x+100;

    // These if statements can be used to move the boss in the same direction as the hero :o
    // if (this.hero.scale.x===1) {
        //this.Boss.move(1);
    // }
    // else if (this.hero.scale.x===-1) {
        //this.Boss.move(-1);
    // }
};

// =============================================================================
// Loading state
// =============================================================================
LoadingState = {};  // Loading state object
LoadingState.init = function () {
    // keep crispy-looking pixels
    this.game.renderer.renderSession.roundPixels = true;
};
LoadingState.preload = function () {    // Preload assets
    this.game.load.json('level:0', './src/data/level00.json');
    this.game.load.json('level:1', './src/data/level01.json');
    this.game.load.json('level:2', './src/data/level02.json');
    this.game.load.json('level:3', './src/data/level02.json');
    this.game.load.json('level:4', './src/data/level02.json');
    this.game.load.json('level:5', './src/data/level02.json');
    this.game.load.json('level:6', './src/data/level02.json');
    this.game.load.json('level:7', './src/data/level02.json');
    this.game.load.json('level:8', './src/data/level02.json');
    this.game.load.json('level:9', './src/data/level02.json');
    this.game.load.json('level:10', './src/data/level02.json');
    this.game.load.json('level:11', './src/data/level02.json');

    this.game.load.image('font:numbers', './src/images/numbers.png');
    this.game.load.image('icon:coin', './src/images/coin_icon.png');
    this.game.load.image('background', './src/images/background.png');
    this.game.load.image('invisible-wall', './src/images/invisible_wall.png');

    this.game.load.image('lavag', './src/images/lavag.png', 966, 84);
    this.game.load.image('ground', './src/images/ground.png', 966, 84);

    this.game.load.image('grass:8x1', './src/images/grass_8x1.png');
    this.game.load.image('grass:6x1', './src/images/grass_6x1.png');
    this.game.load.image('grass:4x1', './src/images/grass_4x1.png');
    this.game.load.image('grass:2x1', './src/images/grass_2x1.png');
    this.game.load.image('grass:1x1', './src/images/grass_1x1.png');
    this.game.load.image('key', './src/images/key.png');

    this.game.load.image('boss', './src/images/mrclean.png', 300, 300);

    this.game.load.image('projectile', './src/images/projectile.png', 16, 3);

    this.game.load.spritesheet('decoration', './src/images/decor.png', 42, 42);
    this.game.load.spritesheet('hero', './src/images/hero.png', 36, 42);          //determines size of frames width, height
    this.game.load.spritesheet('coin', './src/images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('spider', './src/images/spider.png', 42, 32);
    this.game.load.spritesheet('door', './src/images/door.png', 42, 66);
    this.game.load.spritesheet('icon:key', './src/images/key_icon.png', 34, 30);

    this.game.load.audio('sfx:jump', './src/audio/jump.wav');
    this.game.load.audio('sfx:coin', './src/audio/coin.wav');
    this.game.load.audio('sfx:key', './src/audio/key.wav');
    this.game.load.audio('sfx:stomp', './src/audio/stomp.wav');
    this.game.load.audio('sfx:door', './src/audio/door.wav');
    this.game.load.audio('bgm', ['./src/audio/bgm.mp3', './src/audio/bgm.ogg']);
};
LoadingState.create = function () {
    this.game.state.start('play', true, false, {level: 0});
};

// =============================================================================
// Play state
// =============================================================================
PlayState = {};

const LEVEL_COUNT = 11;

PlayState.init = function (data) {
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        downArrow: Phaser.KeyCode.DOWN
    });

    this.coinPickupCount = 0;
    this.hasKey = false;
    this.level = (data.level || 0) % LEVEL_COUNT;
};

PlayState.create = function () {
    // fade in (from black)
    this.camera.flash('#000000');

    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        key: this.game.add.audio('sfx:key'),
        stomp: this.game.add.audio('sfx:stomp'),
        door: this.game.add.audio('sfx:door')
    };
    this.bgm = this.game.add.audio('bgm');
    this.bgm.loopFull();

    // create level entities and decoration
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));

    //this.game.add.image(70, 522, 'projectile');

    // create UI score boards
    this._createHud();
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();

    // update scoreboards
    this.coinFont.text = `x${this.coinPickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;

    // detect if the ground is lava, if so, kill the player
    //console.log(this.level);
    // if (this.level > 10) {
    //     if (this.hero.y = 524) {
    //         this.hero.body.enable = false;
    //         this.hero.die();
    //     }
    // }
};

PlayState.shutdown = function () {
    this.bgm.stop();
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    //console.log(this.projectile);
 
    //PROJECTILE HITS WALLS
    //this.game.physics.arcade.collide(this.projectile, this.platforms);
    this.game.physics.arcade.overlap(this.projectile, this.platforms, this._onProjectileVsWalls, null, this);

    //PROJECTILE KILLS ENEMIES
    this.game.physics.arcade.overlap(this.projectile, this.spiders, this._onEnemyVsProjectile, null, this);

    //PROJECTILE HITS BOSS
    this.game.physics.arcade.overlap(this.projectile, this.boss, this._onBossVsProjectile, null, this);

    // enemies bounce off each other and change direction
    this.game.physics.arcade.collide(this.spiders, this.spiders);
    this.game.physics.arcade.collide(this.spiders, this.spiders, this._onEnemyVsEnemy, null, this);

    // hero vs coins (pick up)
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
        null, this);
    // hero vs key (pick up)
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
        null, this);
    // hero vs door (end level)
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
    // collision: hero vs enemies (kill or die)
    this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        //this.hero.move(-1);
        //this.boss.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        //this.hero.move(1);
        //this.boss.move(1);
    }
    else if (this.keys.downArrow.isDown) {
        this.sfx.stomp.play();
        this.projectile.body.enable = true;
        this.projectile.visible = true;
        fireGun(this.hero);
        //console.log(this);

        if (this.hero.scale.x===1) {
            //console.log("bullet should move to right of screen");
            this.projectile.x = this.hero.x+12;
            this.projectile.y = this.hero.y-1;
            this.projectile.move(1);
        }
        else if (this.hero.scale.x===-1) {
            //console.log("bullet should move to left of screen");
            this.projectile.x = this.hero.x-12;
            this.projectile.y = this.hero.y-1;
            this.projectile.move(-1);
        }
    }
    else { // stop
        this.hero.move(0);
    }

    // handle jump
    const JUMP_HOLD = 200; // ms
    if (this.keys.up.downDuration(JUMP_HOLD)) {
        let didJump = this.hero.jump();
        if (didJump) { this.sfx.jump.play(); }
    }
    else {
        this.hero.stopJumpBoost();
    }
};

function fireGun(data) {
    if (this.isFrozen) { return; }
    console.log(data);
    console.log(this);
    //new Projectile(game, data.position.x, data.position.y);

    //console.log(this);
    console.log("SHOTS FIRED!");
    //Create new instance of bullet ?
    //this.projectile = new Projectile(this.game, data.hero.x, data.hero.y);
    //this.game.add.existing(this.projectile);
};

PlayState._onEnemyVsProjectile = function (projectile, enemy) {
    this.sfx.stomp.play();  //we want to hear the sound as soon as possible, it's satisfying
    enemy.die();            //kill the enemy as soon as possible
    this.projectile.body.enable = false;    //disable bullet
    this.projectile.visible = false;        //hide bullet
    enemy.body.touching = enemy.body.wasTouching;
    console.log("Direct hit. Target neutralized.");
};

PlayState._onProjectileVsWalls = function (projectile, wall) {
    this.sfx.stomp.play();  //we want that OH SO SATISFYING SOUND
    this.projectile.body.enable = false;    //disable bullet
    this.projectile.visible = false;        //hide bullet
    console.log("Projectile hit a wall.");
};

PlayState._onBossVsProjectile = function (projectile, boss) {
    this.sfx.stomp.play();
    this.projectile.body.enable = false;
    this.projectile.visible = false;
    boss.body.touching = boss.body.wasTouching;

    let boss_health = 100;
    boss_health = boss_health - 1;
    console.log(boss_health);
    console.log("Direct hit! Boss lost health.");
};

PlayState._onEnemyVsEnemy = function (enemy, enemy) {
    this.sfx.stomp.play();
    enemy.velocity.x = enemy.velocity.x*-1; //enemies change direction when they collide
    enemy.body.touching = enemy.body.wasTouching;
    console.log("Two enemies collided, lol.");
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
    console.log("You have secured the package. EVAC ASAP.");
};

PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount++;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    // the hero can kill enemies when is falling (after a jump, or a fall)
    if (hero.body.velocity.y > 0) {
        enemy.die();
        hero.bounce();
        this.sfx.stomp.play();
    }
    else { // game over -> play dying animation and restart the game
        hero.die();
        this.sfx.stomp.play();
        hero.events.onKilled.addOnce(function () {
            this.game.state.restart(true, false, {level: this.level});
        }, this);

        // NOTE: bug in phaser in which it modifies 'touching' when
        // checking for overlaps. This undoes that change so spiders don't
        // 'bounce' agains the hero
        enemy.body.touching = enemy.body.wasTouching;
    }
};

PlayState._onHeroVsDoor = function (hero, door) {
    // 'open' the door by changing its graphic and playing a sfx
    door.frame = 1;
    this.sfx.door.play();
    console.log("The package has been delivered have a nice day.");
    // play 'enter door' animation and change to the next level when it ends
    hero.freeze();
    this.game.add.tween(hero)
        .to({x: this.door.x, alpha: 0}, 500, null, true)
        .onComplete.addOnce(this._goToNextLevel, this);
};

PlayState._goToNextLevel = function () {
    this.camera.fade('#000000');
    this.camera.onFadeComplete.addOnce(function () {
        // change to next level
        this.game.state.restart(true, false, {
            level: this.level + 1
        });
    }, this);
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    //this.boss = this.game.add.group();
    //this.projectile = this.game.add.group();

    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders, projectile: data.projectile, boss: data.boss});

    //console.log(this.hero.position);

    // spawn level decoration
    data.decoration.forEach(function (deco) {
        this.bgDecoration.add(
            this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
    }, this);

    // spawn platforms
    data.platforms.forEach(this._spawnPlatform, this);

    // spawn important objects
    data.coins.forEach(this._spawnCoin, this);
    this._spawnKey(data.key.x, data.key.y);
    this._spawnDoor(data.door.x, data.door.y);

    // enable gravity
    const GRAVITY = 2000;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);

    //console.log(data);
    //console.log(data.hero);
    //console.log(this.hero.position.x);
    //console.log(this.hero.position.y);
    let heroX = this.hero.position.x;
    let heroY = this.hero.position.y;

    //Creates a new object where the hero is
    this.projectile = new Projectile(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.projectile);

    // Creates a "fake" boss in order to initiate boss functions (prevent errors)
    this.boss = new Boss(this.game, 2000, 2000);
    // Logic to determine when to spawn the REAL BOSS
    if (this.level > 1) {
        this.boss = new Boss(this.game, 150, 150);
        this.game.add.existing(this.boss);
    }

    // PlayState._spawnProjectile = function (x, y) {
    //     this.projectile = this.projectiles.create(heroX, heroY, 'projectile');
    //     this.projectile.anchor.setTo(0.5, 0.5);
    //     this.game.physics.enable(this.projectile);
    //     this.projectile.body.allowGravity = false;
    //     this.projectile.body.enable = true;
    //     console.log(this.projectile);
    // }
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    // physics for platform sprites
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    // spawn invisible walls at each side, only detectable by enemies
    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    // physics (so we can detect overlap with the hero)
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    // animations
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
};

PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;

    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};

PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR, 6);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);

    let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.add(coinScoreImg);
    this.hud.add(this.keyIcon);
    this.hud.position.set(10, 10);
};

// =============================================================================
// entry point
// =============================================================================

//if(location.pathname=="/game"){
    window.onload = function () {
        let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
        game.state.add('play', PlayState);
        game.state.add('loading', LoadingState);
        game.state.start('loading');
    }
//}