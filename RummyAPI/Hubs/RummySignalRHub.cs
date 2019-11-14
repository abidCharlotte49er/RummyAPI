using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json; 
using Microsoft.AspNetCore.SignalR;
using RummyAPI.Models;
using System.IO;

namespace RummyAPI.Hubs
{
    public class RummySignalRHub : Hub
    {

        public Game Game = new Game();
        private RummyDbContext dbContext; 

        public RummySignalRHub(RummyDbContext dbc)
        {
            dbContext = dbc;
        }

        #region On Connected Disconnected 

        //Things that should happen when Client Connects 
        public override async Task OnConnectedAsync()
        {
            //Find user with his connection ID
            Player ConnectedPlayer = dbContext.Players.FirstOrDefault(p => p.HubConnectionId == Context.ConnectionId); 

            if(ConnectedPlayer ==null)
            {
                ConnectedPlayer = new Player(); 
                AssignCommonProps();
                dbContext.Players.Add(ConnectedPlayer); 
            }
            else
            {
                AssignCommonProps();
            }

            void AssignCommonProps()
            {
                ConnectedPlayer.IsActive = true;
                ConnectedPlayer.HubConnectionId = Context.ConnectionId;
            }

            dbContext.SaveChanges();

            await Clients.Caller.SendAsync("C_OnConnected", ConnectedPlayer);

            //await Clients.Caller.SendAsync(); 
            await base.OnConnectedAsync();
        }

        //Things that should happen when Client Disconnects 
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Player DisconnectedPlayer = dbContext.Players.FirstOrDefault(p => p.HubConnectionId == Context.ConnectionId);

            if(DisconnectedPlayer != null)
            {
                DisconnectedPlayer.IsActive = false; 
            }

            dbContext.SaveChanges(); 

            await base.OnDisconnectedAsync(exception);
        }

        #endregion 

        #region Private Methods 

        private void UpdateGameData(Game game)
        {
            try
            {
            }
            catch (Exception ex)
            {

            }

        }

        #endregion

        #region Signal R Hub endpoints 
        

        public async Task AddPlayers(List<Player> players)
        {
            ResponseDTO resp = new ResponseDTO { Success = false, Data = null };

            try
            {
                foreach(Player player in players)
                {
                    //Find player by Context Connection ID Or Name  
                    Player dbPlayer = dbContext.Players
                                .FirstOrDefault(p => p.HubConnectionId == Context.ConnectionId 
                                                  || p.Name == player.Name
                                                  || p.RummyCookieId == player.RummyCookieId);

                    if(dbPlayer ==null)
                    {
                        SaveCommonProps();
                        dbContext.Players.Add(player);
                    }
                    else
                    {
                        SaveCommonProps();
                    }

                    void SaveCommonProps()
                    {
                        dbPlayer.Name = player.Name;
                        dbPlayer.RummyCookieId = player.RummyCookieId; 
                        dbPlayer.HubConnectionId = Context.ConnectionId; 
                        dbPlayer.Position = player.Position;
                    }

                    dbContext.SaveChanges();
                    await Clients.All.SendAsync("OnPlayerJoined", dbPlayer); 
                }

            }
            catch(Exception ex)
            {

            }

        }

        public async Task DealPlayerCards(Player plyr)
        {
            ResponseDTO resp = new ResponseDTO { Success = false, Data = null };

            try
            {
                Player player = dbContext.Players.FirstOrDefault(p => p.Name == plyr.Name);

                if (player != null && !String.IsNullOrEmpty(player.HubConnectionId))
                {
                    player.Cards = plyr.Cards; //Assign cards we got from Client; 
                    await Clients.Client(player.HubConnectionId).SendAsync("OnDealingCards", player);
                }
            }
            catch (Exception ex)
            {

            }
        }

        public async Task SaveGameCards(List<Card> Cards)
        {

        }

        public async Task WhoseTurn(int gameID)
        {
            ResponseDTO resp = new ResponseDTO { Success = false, Data = null };

            try
            {
                await Clients.All.SendAsync("UserJoined", "Abid"); 
                await Clients.All.SendAsync("ReceiveMessage", Game); 
            }
            catch(Exception ex)
            {

            }
        }

        public async Task JoinGame(int gameID, string name)
        {
            ResponseDTO resp = new ResponseDTO { Success = false, Data= null }; 
            try
            {
             
                if (Game == null)
                {
                    resp.Message = "Your Game doesn't exist"; 
                    await Clients.Caller.SendAsync("C_HandleJoin", resp); 
                }
                else
                {
                    Player player = Game.Players.FirstOrDefault(p => p.Name == name);

                    if (player != null)
                    {
                        resp.Message = "Player Already exists";
                        resp.Data = player;

                        await Clients.Caller.SendAsync("C_HandlePlayerExists", resp); 
                    }
                    else
                    {
                        Player lastPalyer = Game.Players.OrderByDescending(p => p.Id).FirstOrDefault();

                        if (lastPalyer != null)
                        {
                            player = new Player { Id = lastPalyer.Id + 1, Position = lastPalyer.Position + 1, IsActive = true, Name = name };
                        }
                        else
                        {
                            player = new Player { Id = 1, Position = 1, IsActive = true, Name = name };
                        }

                        Game.Players.Add(player);

                        UpdateGameData(Game);

                        await Clients.Caller.SendAsync("C_HandleJoin", resp);
                    }
                }
            }
            catch(Exception ex)
            {

            }
        }

        public async Task SendMessageToPlayer(string name)
        {
            ResponseDTO resp = new ResponseDTO { Success = false, Data = null };
            try
            {
                Player player = dbContext.Players.FirstOrDefault(p => p.Name == name);
                if(player!=null && ! String.IsNullOrEmpty(player.HubConnectionId))
                {
                    await Clients.Client(player.HubConnectionId).SendAsync("OnSendMessageToPlayer", player);
                }
            }
            catch (Exception ex)
            {

            }
        }


        #endregion
    }
}

/*
 References : 

 https://docs.microsoft.com/en-us/aspnet/core/tutorials/signalr?view=aspnetcore-3.0&tabs=visual-studio
    https://www.codemag.com/Article/1807061/Build-Real-time-Applications-with-ASP.NET-Core-SignalR

     */

/*
 * OLD Code 
             using (StreamReader sr = new StreamReader("GameData.json"))
        {
            string json = sr.ReadToEnd();
            Game = JsonConvert.DeserializeObject<Game>(json); 
        }

                    var newJsonData = JsonConvert.SerializeObject(game);

                File.WriteAllText("GameData.json", newJsonData); 

 */
