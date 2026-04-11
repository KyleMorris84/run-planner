using Api.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Extensions;

public static class WebApplicationExtensions
{
    public static async Task<WebApplication> InitialiseDb(this WebApplication app)
    {
        // migrate
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();
    
        // seed roles
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            var role = new IdentityRole("Admin");
            await roleManager.CreateAsync(role);
        }
        if (!await roleManager.RoleExistsAsync("Member"))
        {
            var role = new IdentityRole("Member");
            await roleManager.CreateAsync(role);
        }

        return app;
    }
}