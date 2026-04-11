using Api.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Api.Services;

public class TokenCleanupService(
    IServiceScopeFactory scopeFactory,
    IOptions<RefreshTokenSettings> refreshTokenSettings
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var expiredTokens = await dbContext.RefreshTokens
                .Where(t => t.Expires < DateTime.UtcNow)
                .ToListAsync(cancellationToken);

            Console.WriteLine("{0} | Removing {1} expired tokens...", DateTime.UtcNow, expiredTokens.Count);

            dbContext.RefreshTokens.RemoveRange(expiredTokens);
            await dbContext.SaveChangesAsync(cancellationToken);
            
            await Task.Delay(
                TimeSpan.FromMinutes(refreshTokenSettings.Value.CleanUpFrequencyInMinutes),
                cancellationToken
            );
        }
    }
}