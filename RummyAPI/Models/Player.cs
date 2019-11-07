using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RummyAPI.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public bool IsDropped { get; set; } 
        public int Position { get; set; }
        public bool IsMyTurn { get; set; }
        public int CurrentGameCount { get; set; }

    }
}
