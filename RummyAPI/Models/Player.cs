using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RummyAPI.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string RummyCookieId { get; set; }
        public string Name { get; set; }
        public string HubConnectionId { get; set; }
        public bool IsActive { get; set; }
        public bool IsDropped { get; set; }
        public bool IsMiddleDropped { get; set; }
        public bool IsOut { get; set; }
        public int Position { get; set; }
        public int Points { get; set; }
        public bool IsMyTurn { get; set; }
        public int CurrentGameCount { get; set; }
        public List<Card> Cards = new List<Card>(); 
    }
}
