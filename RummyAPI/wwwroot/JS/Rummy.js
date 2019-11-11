﻿var RummyApp = {
    selected: '',
    size: 0,
    index: 100,
    x: 30,
    y: 20
}; 

$(document).ready(function () {
    RummyApp.InitializeGameSetup(); //Initializes game setup, decks, players, all variables 
    RummyApp.StartNextGame();//WE are calling this for now 
    $("#BtnStartNewGame").on("click", function () { RummyApp.StartNextGame(); }); 
    $("#BtnShowAllHands").on("click", function () { RummyApp.ShowAllHands(); }); 
}); 

RummyApp.InitializeGameSetup = function () {
    RummyApp.DeckCount = 2;
    RummyApp.PlayerNamesString = "Baji, Basheer, Abid, Azim, Ameem";
    RummyApp.CutOffWeight = 250,
        RummyApp.DropWeight = 20;
    RummyApp.MiddleDropWeight = 40;
    const { DeckCount, PlayerNamesString, CutOffWeight, DropWeight, MiddleDropWeight } = RummyApp;

    var pool = new Pool(DeckCount, PlayerNamesString, CutOffWeight, DropWeight, MiddleDropWeight);

    RummyApp.Pool = pool;

   // l(RummyApp);
}; 

RummyApp.StartNextGame = function () {
    var currentGame = RummyApp.Pool.startNextGame();
    RummyApp.CurrentGame = currentGame;
    currentGame.cutDeck(); // At this point of time Players have cards

    l(RummyApp);
}; 

RummyApp.ShowAllHands = function () {
    l(RummyApp.CurrentGame.players); 
    RummyApp.CurrentGame.players.forEach(function (player, i) {
        l(player.name); 
        l($("#AllHands")); 
        $("#AllHands").append(`<div id="${player.position}Hand" class="Hand">`).append(`<div class="handLabel">${player.name}'s Hand</div>`); 

        player.cards.forEach(function (card,i) {
            l(i); 
            l(card); 

            if (card) {
                var paper = document.createElement('article');

                if (card.face === "X") {
                    paper.innerHTML = '\
                  <input type=button onclick=flip(this.parentNode) ontouchstart=flip(this.parentNode)>\
                  <small>'+ card.rank + '</small>\
                  <h2 class="Joker">'+ card.suitUnicode + '</h2>\
            <bottom>'+ card.rank + '</bottom>';
                }
                else {
                    paper.innerHTML = '\
              <input type=button onclick=flip(this.parentNode) ontouchstart=flip(this.parentNode)>\
              <small>'+ card.rank + ' ' + card.suitUnicode + '</small>\
              <h2>'+ card.rank + ' ' + card.suitUnicode + '</h2>\
        <bottom>'+ card.rank + ' ' + card.suitUnicode + '</bottom>';
                }

                paper.setAttribute('data-suit', card.unicode);
                paper.setAttribute('data-card', card.rank);

                paper.style.top = RummyApp.y + 'px';
                paper.style.left = RummyApp.x + 'px';
                $(paper).appendTo($(`#${player.position}Hand`));

                //  console.log($(paper));

                //document.body.appendChild(paper)
                paper.addEventListener('mousedown', click);
                paper.addEventListener('touchstart', click);
                // paper.addEventListener('mousemove', drag);
                // paper.addEventListener('touchmove', drag);
                paper.addEventListener('mouseup', release);
                paper.addEventListener('touchend', release);
                RummyApp.y = RummyApp.y;
                RummyApp.x = RummyApp.x + 2;
            }
            else {
                l("card not defined"); 
            }


        }); 
       // RummyApp.x = RummyApp.x + 180; //to Seperate players hands
        RummyApp.x = 30; 
    }); 


}; 

//easy to log 
function l(obj) {
    console.log(obj); 
}

function click(e) {
    e.preventDefault();
    if (e.target.nodeName === 'article') {
        RummyApp.selected = Date.now();
        e.target.setAttribute('data-drag', RummyApp.selected);
        e.target.style.zIndex = RummyApp.index++;
    } else if (e.target.nodeName === 'body') {
        RummyApp.selected = '';
    }
}
function drag(e) {
    e.preventDefault();
    if (RummyApp.selected !== '') {

        var cardParent = $(`article[data-drag=${RummyApp.selected}]`).parent().attr('id');

        if (cardParent === "MyHand") {
            var cursorY = (e.clientY || e.touches[0].clientY) - 87.5 - 330; // remove height of the div
        }
        else {
            var cursorY = (e.clientY || e.touches[0].clientY) - 87.5;
        }

        var cursorX = (e.clientX || e.touches[0].clientX) - 62.5,

            element = document.querySelectorAll('[data-drag="' + RummyAppRummyApp.selected + '"]')[0];
        element.style.top = cursorY + 'px';
        element.style.left = cursorX + 'px';

        l(element.style.top);
    }
}
function release(e) {
    element = document.querySelectorAll('[data-drag="' + RummyApp.selected + '"]')[0];
    RummyApp.selected = '';
}
function flip(paper) {
    if (paper.getAttribute('data-flip') == 'flipped') {
        paper.setAttribute('data-flip', '');
    } else {
        paper.setAttribute('data-flip', 'flipped');
    }
}
