const numOfPlayers = 5;

class Player {
    constructor() {
        this.score = 0;
        this.velocity = 0;
        this.position = 180;
        this.rotation = 0;
        this.isDead = false;
    }
}

let players = [];

const images = ['bird0.png', 'bird1.png', 'bird2.png', 'bird3.png', 'bird4.png'];

const gravity = 0.25;
const jump = -4.6;
const flyArea = $("#flyarea").height();

let generation = 1;


const pipeheight = 90;
const pipewidth = 52;
let pipes = [];

//loops
let loopGameloop;
let loopPipeloop;

$(document).ready(function () {
    startGame();
});

function startGame() {
    const updaterate = 1000.0 / 60.0; //60 times a second
    loopGameloop = setInterval(gameloop, updaterate);
    loopPipeloop = setInterval(updatePipes, 1400);
    $('#generation').text("Generation: " + generation);
    generatePlayers();
}

function generatePlayers() {
    players = [];
    const view = $('#player');
    for (let i = 0; i < numOfPlayers; i++) {
        const player = new Player();
        player.view = view.clone();
        player.view.css({"background-image": "url('assets/birds/" + images[i] + "')"});
        player.view.insertAfter($('#ceiling'));
        player.view.removeAttr('id');
        players.push(player);
        playerJump(player);
    }
}

function gameloop() {
    const alivePlayers = players.filter(player => !player.isDead);
    if (alivePlayers.length === 0) {
        restartGame();
        return;
    }
    $('#alive').text("Alive: " + alivePlayers.length + " / " + numOfPlayers);
    alivePlayers.forEach(function (player) {
        player.score++;
        $('#score').text("Score: " + player.score);
        updatePlayer(player);
        checkIfDead(player);
    });
}


function restartGame() {
    $('.pipe').remove();
    pipes = [];

    clearInterval(loopGameloop);
    clearInterval(loopPipeloop);
    loopGameloop = null;
    loopPipeloop = null;
    generation++;

    startGame();
}

function updatePlayer(player) {
    player.velocity += gravity;
    player.position += player.velocity;
    player.rotation = Math.min((player.velocity / 10) * 90, 90);
    player.view.css({rotate: player.rotation, top: player.position});
}

function checkIfDead(player) {
    var box = player.view[0].getBoundingClientRect();
    var origwidth = 34.0;
    var origheight = 24.0;

    var boxwidth = origwidth - (Math.sin(Math.abs(player.rotation) / 90) * 8);
    var boxheight = (origheight + box.height) / 2;
    var boxleft = ((box.width - boxwidth) / 2) + box.left;
    var boxtop = ((box.height - boxheight) / 2) + box.top;
    var boxright = boxleft + boxwidth;
    var boxbottom = boxtop + boxheight;

    //did we hit the ground?
    if (box.bottom >= $("#land").offset().top) {
        playerDead(player);
        return;
    }

    //have they tried to escape through the ceiling? :o
    var ceiling = $("#ceiling");
    if (boxtop <= (ceiling.offset().top + ceiling.height()))
        player.position = 0;


    //we can't go any further without a pipe
    if (pipes[0] == null)
        return;

    //determine the bounding box of the next pipes inner area
    var nextpipe = pipes[0];
    var nextpipeupper = nextpipe.children(".pipe_upper");

    var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
    var pipeleft = nextpipeupper.offset().left - 2; // for some reason it starts at the inner pipes offset, not the outer pipes.
    var piperight = pipeleft + pipewidth;
    var pipebottom = pipetop + pipeheight;

    var distanceToPipe = pipetop + pipeheight / 2 - boxbottom - boxheight / 2;
    var distanceToCenter = piperight - boxleft;

//    console.log("" + distanceToPipe + ", " + distanceToCenter);

    //have we gotten inside the pipe yet?
    if (boxright > pipeleft) {
        //we're within the pipe, have we passed between upper and lower pipes?
        if (boxtop > pipetop && boxbottom < pipebottom) {
            //yeah! we're within bounds

        }
        else {
            //no! we touched the pipe
            playerDead(player);
            return;
        }
    }


    //have we passed the imminent danger?
    if (boxleft > piperight) {
        //yes, remove it
        pipes.splice(0, 1);

        //and score a point
        //playerScore(player);
    }
}

$(document).keydown(function (e) {
    switch (e.keyCode) {
        case 81:
            playerJump(players[0]);
            break;
        case 87:
            playerJump(players[1]);
            break;
        case 69:
            playerJump(players[2]);
            break;
        case 82:
            playerJump(players[3]);
            break;
        case 84:
            playerJump(players[4]);
            break;
    }
});

function playerJump(player) {
    player.velocity = jump;
}

function playerDead(player) {
    player.isDead = true;
    player.view.remove();
}

function playerScore(player) {
    player.score += 1;
}

function updatePipes() {
    //Do any pipes need removal?
    $(".pipe").filter(function () {
        return $(this).position().left <= -100;
    }).remove();

    //add a new pipe (top height + bottom height  + pipeheight == flyArea) and put it in our tracker
    var padding = 80;
    var constraint = flyArea - pipeheight - (padding * 2); //double padding (for top and bottom)
    var topheight = Math.floor((Math.random() * constraint) + padding); //add lower padding
    var bottomheight = (flyArea - pipeheight) - topheight;
    var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px;"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div></div>');
    $("#flyarea").append(newpipe);
    pipes.push(newpipe);
}
