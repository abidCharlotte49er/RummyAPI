using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RummyAPI.Models
{
    public class Game
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Player> Players = new List<Player>(); 
    }
}
