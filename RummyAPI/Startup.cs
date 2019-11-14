using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RummyAPI.Controllers;
using RummyAPI.Hubs;
using RummyAPI.Models;

namespace RummyAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            services.AddSignalR(hubOptions=> {
                hubOptions.ClientTimeoutInterval = new TimeSpan(5,5,5); //5 Hours 
                hubOptions.HandshakeTimeout = new TimeSpan(5, 5, 5); //5 Hours 
                hubOptions.KeepAliveInterval = new TimeSpan(5, 5, 5); //5 Hours 
            });
            services.AddEntityFrameworkSqlite(); 
            services.AddDbContext<RummyDbContext>(options => options.UseSqlite(@"Data Source =.\RummyDb.db")); 
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseMvc();
            app.UseSignalR(routes=> 
            {
                routes.MapHub<RummySignalRHub>("/rummyHub");
            });
            
         //   RummyDbContext dbCont = new RummyDbContext();  

        }
    }
}
