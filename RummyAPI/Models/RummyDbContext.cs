using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Sqlite; 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RummyAPI.Models
{
    public class RummyDbContext: DbContext
    {
        public RummyDbContext(DbContextOptions<RummyDbContext> options): base(options)
        {
            Database.EnsureCreated(); 
        }

        public DbSet<Game> Games { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Card> Cards { get; set; }

    }
}
