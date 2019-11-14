using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RummyAPI.Models
{
    public class Card
    {
        public int Id { get; set; }
        public string Rank { get; set; }
        public string Suit { get; set; }
        public string SuitValue { get; set; }
        public string Face { get; set; }
        public int ValueLow { get; set; }
        public int Value { get; set; }
        public int Points { get; set; }
        public string Unicode { get; set; }
        public string SuitCode { get; set; }
    }
}

