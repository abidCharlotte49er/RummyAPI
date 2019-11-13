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
            //Player p = dbContext.Players.FirstOrDefault(); 


        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"{Context.User.ToString()}");
            //await Clients.Caller.SendAsync(); 
            await base.OnConnectedAsync();
        }

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
                    Player dbPlayer = dbContext.Players.FirstOrDefault(p => p.Name == player.Name); 

                    if(dbPlayer ==null)
                    {
                        dbContext.Players.Add(player); 
                    }
                    else
                    {
                        dbPlayer.Position = player.Position; //Just update his position 
                    }
                    dbContext.SaveChanges(); 
                }
                await Clients.All.SendAsync("UsersJoined", players); 
            }
            catch(Exception ex)
            {

            }

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
