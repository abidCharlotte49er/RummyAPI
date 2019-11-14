var RummyApp = {
    selected: '',
    size: 0,
    index: 100,
    x: 30,
    y: 20, 
    DeckCount: 1 
}; 

var Hub = {
    Connection: null
}; 


$(document).ready(function () {
    RummyApp.RegisterDevice(); 
    Hub.Setup(); //To setup SignalR Hub and connections 
    AddEventHandlers(); 
    Hub.StartConnection();  //WE need to start connection to be ready 
    RummyApp.InitializeGameSetup(); //Initializes game setup, decks, players, all variables 
    Hub.RegisterEvents(); 
}); 

//Save Cookie for that device
RummyApp.RegisterDevice = function () {
    var cookieExists = getCookie("RummyCookieId");

    if (!cookieExists) {
        document.cookie = `RummyCookieId=${Math.floor(Math.random() * 10000000000000)}; expires=${new Date(2030, 1, 1).toGMTString()}`; //BIG number 1 trillion size 
    }
};
Hub.Setup = function() {
    Hub.Connection = new signalR.HubConnectionBuilder().withUrl("/rummyHub").build();
    Hub.Connection.keepAliveIntervalInMilliseconds = "18000000";//5 Hrs  
    Hub.Connection.serverTimeoutInMilliseconds = "18000000"; //5 Hrs
    Hub.Connection.onclose(function () {
        Hub.StartConnection();
    }); 
};

Hub.StartConnection = function () {
    l(Hub);
    
    if (Hub.Connection.state == 0) {
        Hub.Connection.start().then(function () {
            console.log("Hub Connection started");
        }).catch(function (err) {
            return console.error(err.toString());
        });
    } else {
        l("Hub Connection already live!!"); 
    }

};

Hub.RegisterEvents = function () {
    Hub.Connection.on("OnPlayerJoined", function (player) {
        l(player.name + " joined the game"); 
        $("#logger").append("<div>"+player.name +" joined the game</div>"); 
    });

    Hub.Connection.on("OnDealingCards", function (player) {
        l(player); 
        RummyApp.ShowPlayerCards(player); 
    }); 

    Hub.Connection.on("SpecificPlayerNotif", function (player) {
        l(player);
    });

    Hub.Connection.on("OnSendMessageToPlayer", function (player) {
        l(player);
        alert("Message to " + player.name); 
    });
}; 

function AddEventHandlers() {
    $("#PlayerView").hide();
    $("#BtnAdminPlayerView").on("click", function () {
        $("#AdminView").toggle();
        $("#PlayerView").toggle();
    }); 

    $("#BtnJoinGame").on("click", function () { RummyApp.JoinPlayer(); }); 
    $("#BtnSendMessage").on("click", function () { RummyApp.SendMessageToPlayer(); }); 

    $("#BtnAddPlayers").on("click", function () { RummyApp.AddPlayers(); }); 
    $("#BtnStartNewGame").on("click", function () { RummyApp.StartNextGame(); });
    $("#BtnShowAllHands").on("click", function () { RummyApp.ShowAllHands(); });


}

function C_OnConnected(p) {
    l(p); 
}

function getSuitSymbol(suit) {

    if (suit === "S") {
        return '♠';
    }
    else if (suit === "H") {
        return '♥';
    } else if (suit === "D") {
        return '♦';
    } else if (suit === "C") {
        return '♣';
    }
}

RummyApp.ShowPlayerCards = function (player) {

    l($("#MyHand"));
    $("#MyHand").append(`<div id="${player.name}Hand" class="Hand">`).append(`<div class="handLabel">${player.name}'s Hand</div>`); 

    player.cards.forEach(function (card, i) {
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
              <small>'+ card.rank + ' ' + getSuitSymbol(card.suit) + '</small>\
              <h2>'+ card.rank + ' ' + getSuitSymbol(card.suit) + '</h2>\
        <bottom>'+ card.rank + ' ' + getSuitSymbol(card.suit) + '</bottom>';
            }

            paper.setAttribute('data-suit', card.suitUnicode);
            paper.setAttribute('data-card', card.rank);

            paper.style.top = RummyApp.y + 'px';
            paper.style.left = RummyApp.x + 'px';
            $(paper).appendTo($(`#${player.name}Hand`));

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

    $("#AdminView").hide();
    $("#PlayerView").show();
}; 

RummyApp.InitializeGameSetup = function () {
    RummyApp.DeckCount = 1; //2;
    RummyApp.PlayerNamesString = "Abid, Basheer";  //"Baji, Basheer, Abid, Azim, Ameem";
    RummyApp.CutOffWeight = 250,
    RummyApp.DropWeight = 20;
    RummyApp.MiddleDropWeight = 40;
    const { DeckCount, PlayerNamesString, CutOffWeight, DropWeight, MiddleDropWeight } = RummyApp;

    RummyApp.Pool = new Pool(DeckCount, PlayerNamesString, CutOffWeight, DropWeight, MiddleDropWeight);

   // l(RummyApp);
}; 

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

RummyApp.JoinPlayer = function () {

    var player = $("#inptPlayerName").val();
    var position = $("#inptPlayerPosition").val();
    var RummyCookieId = getCookie("RummyCookieId"); 

    var playersToAdd = []; 
    if (player) {
        var p = {
            "Name": player.trim(),
            "Position": position ? position : 0, 
            "RummyCookieId": RummyCookieId ? RummyCookieId: ""
        };
        playersToAdd.push(p); 

        Hub.Connection.invoke("AddPlayers", playersToAdd).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        alert("Enter Name");
    }
}; 

RummyApp.SendMessageToPlayer = function () {
    var playerName = $("#inptPlayerName").val(); 
    if (playerName) {
        Hub.Connection.invoke("SendMessageToPlayer", playerName).catch(function (err) {
            return console.error(err.toString());
        });
    }
}; 
RummyApp.AddPlayers = function () {
    var playersVals = $("#inptPlayers").val();

    if (playersVals) {
        var playersArray = playersVals.split(","); 
        var playersToAdd = []; 

        playersArray.forEach(function (pa) {
            var player = pa.split("-"); 

            if (player.length == 2) {

                var p = {
                    "Name": player[0].trim(),
                    "Position": player[1].trim()
                };

                document.cookie = `RummyUsername=${player[0]}; expires=${new Date(2030, 1, 1).toGMTString()}`;

                playersToAdd.push(p); 
            }
        }); 

        Hub.Connection.invoke("AddPlayers", playersToAdd).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        alert("enter Players"); 
    }
    
}; 

RummyApp.StartNextGame = function () {
    $("#AllHands").empty(); 
    $("#MyHand").empty();
    RummyApp.CurrentGame = RummyApp.Pool.startNextGame();

    RummyApp.CurrentGame.cutDeck(); // At this point of time Players have cards

    RummyApp.DealCards(); 

    //alert("Cards are Dealt press Show All Hands"); 
   l(RummyApp);
}; 

RummyApp.DealCards = function () {
    Hub.StartConnection(); 

    if (RummyApp.CurrentGame) {

        RummyApp.CurrentGame.players.forEach(function (p) {

            var player = { "Name": p.name, "Cards": p.cards }; 

            Hub.Connection.invoke("DealPlayerCards", player).catch(function (err) {
                return console.error(err.toString());
            });
        });

        //Save remaning Cards in Cards Table 
        Hub.Connection.invoke("SaveGameCards", RummyApp.CurrentGame.cards).catch(function (err) {
            return console.error(err.toString());
        });
    }
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
