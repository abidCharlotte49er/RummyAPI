﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RummyAPI.Models
{
    public class Game
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Card> Cards = new List<Card>();
        public int CutOffPoints { get; set; }
        public int DeckCount { get; set; }
        public int DropPoints { get; set; }
        public int MiddleDropPoints { get; set; }
        public int OpenerIndex { get; set; }

        public List<Player> Players = new List<Player>(); 
    }
}
