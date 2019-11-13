var RummyApp = {
    selected: '',
    size: 0,
    index: 100,
    x: 30,
    y: 20, 
    DeckCount: 2, 
    HubConnection: null
}; 


$(document).ready(function () {

    SetupHub(); //To setup SignalR Hub and connections 
    AddEventHandlers(); 

    RummyApp.InitializeGameSetup(); //Initializes game setup, decks, players, all variables 
    RegisterHubEvents(); 
}); 

function SetupHub() {

    RummyApp.HubConnection = new signalR.HubConnectionBuilder().withUrl("/rummyHub").build();

    RummyApp.HubConnection.start().then(function () {
        console.log("HubConnection started");
    }).catch(function (err) {
        return console.error(err.toString());
    });

}
function AddEventHandlers() {
    $("#PlayerView").hide();
    $("#BtnAdminPlayerView").on("click", function () {
        $("#AdminView").toggle();
        $("#PlayerView").toggle();
    }); 

    $("#BtnAddPlayers").on("click", function () {
        RummyApp.AddPlayers(); 
    }); 
    $("#BtnStartNewGame").on("click", function () { RummyApp.StartNextGame(); });
    $("#BtnShowAllHands").on("click", function () { RummyApp.ShowAllHands(); });


}
function RegisterHubEvents() {
    RummyApp.HubConnection.on("PlayersJoined", function (players) {
        var names = ""; 
        players.forEach(function (player) {
            names += player.name + ", "; 
        }); 
        alert(names + " joined game and their names are coming through Signal R"); 
    });
}

RummyApp.InitializeGameSetup = function () {
    RummyApp.DeckCount = 1; //2;
    RummyApp.PlayerNamesString = "Baji, Basheer";  //"Baji, Basheer, Abid, Azim, Ameem";
    RummyApp.CutOffWeight = 250,
    RummyApp.DropWeight = 20;
    RummyApp.MiddleDropWeight = 40;
    const { DeckCount, PlayerNamesString, CutOffWeight, DropWeight, MiddleDropWeight } = RummyApp;

    RummyApp.Pool = new Pool(DeckCount, PlayerNamesString, CutOffWeight, DropWeight, MiddleDropWeight);

   // l(RummyApp);
}; 

function callHub() {
    RummyApp.HubConnection.invoke("SetupPlayers", "Ab").catch(function (err) {
        return console.error(err.toString());
    });
}

RummyApp.AddPlayers = function () {
    var playersVals = $("#inptPlayers").val();

    if (playersVals) {
        var playersArray = playersVals.split(","); 
        var playersToAdd = []; 

        playersArray.forEach(function (pa) {
            var player = pa.split(":"); 

            if (player.length == 2) {

                var p = {
                    "Name": player[0],
                    "Position": player[1]
                };

                playersToAdd.push(p); 
            }
        }); 

        RummyApp.HubConnection.invoke("AddPlayers", playersToAdd).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        alert("enter Players"); 
    }
    
}; 

RummyApp.StartNextGame = function () {
    $("#AllHands").empty(); 
    RummyApp.CurrentGame = RummyApp.Pool.startNextGame();

    RummyApp.CurrentGame.cutDeck(); // At this point of time Players have cards

    alert("Cards are Dealt press Show All Hands"); 
   // l(RummyApp);
}; 

RummyApp.ShowAllHands = function () {
   // l(RummyApp.CurrentGame.players); 
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
                  <input type=button class="cardFlippers" onclick=flip(this.parentNode) ontouchstart=flip(this.parentNode)>\
                  <small>'+ "🃏" + '</small>\
                  <h2 class="Joker">'+ "🃏" + '</h2>\
            <bottom>'+ "🃏" + '</bottom>';
                }
                else {
                    paper.innerHTML = '\
              <input type=button class="cardFlippers" onclick=flip(this.parentNode) ontouchstart=flip(this.parentNode)>\
              <small>'+ card.rank + ' ' + card.suitUnicode + '</small>\
              <h2>'+ card.rank + ' ' + card.suitUnicode + '</h2>\
        <bottom>'+ card.rank + ' ' + card.suitUnicode + '</bottom>';
                }

                paper.setAttribute('data-suit', card.suitUnicode);
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
                paper.setAttribute("data-flip", "flipped");

                $(paper).draggable({
                    cursor: 'move',
                    //revert: true,
                    start: function (event, ui) {
                       // ui.helper.data('dropped', false);
                    },
                    stop: function (event, ui) {
                       /* if (ui.helper.data('dropped') === false) {
                            ui.helper.removeClass("snappedCard");
                            console.log(ui.helper);
                        }*/
                    }
                });
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
