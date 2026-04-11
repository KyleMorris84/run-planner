using System.Runtime.InteropServices.JavaScript;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Api.Model;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace Api.Controllers;

public record RegistrationRequest(string Email, string Password, string Name, bool NotificationsEnabled = true);
public record RegisterResponse(string Id, string Email, string Name);
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, DateTime exp);

[Route("api")]
[ApiController]
public sealed class UserController(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext,
    ITokenProvider tokenProvider,
    IOptions<JwtSettings> jwtSettings,
    IOptions<RefreshTokenSettings> refreshTokenSettings)
    : Controller
{
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser([FromBody] RegistrationRequest request)
    {
        var transaction = await dbContext.Database.BeginTransactionAsync();
        
        var newUser = new ApplicationUser
        {
            Name = request.Name,
            Email = request.Email,
            UserName = request.Email,
            NotificationsEnabled = request.NotificationsEnabled
        };

        var identityResult = await userManager.CreateAsync(newUser, request.Password);

        if (!identityResult.Succeeded)
        {
            return BadRequest(identityResult.Errors);
        }
        
        var addToRoleResult = await userManager.AddToRoleAsync(newUser, Roles.Member);
        
        if (!addToRoleResult.Succeeded)
        {
            return BadRequest(addToRoleResult.Errors);
        }
        
        await transaction.CommitAsync();

        return Ok(new RegisterResponse(newUser.Id, newUser.Email!, newUser.Name));
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized();
        }
        var roles = await userManager.GetRolesAsync(user);

        var accessToken = tokenProvider.GetAccessToken(user, roles, jwtSettings);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = tokenProvider.GetRefreshToken(),
            Created = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddDays(refreshTokenSettings.Value.ExpirationInDays)
        };
        
        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync();
        
        HttpContext.Response.Headers.SetCookie = $"refreshToken={refreshToken.Token}; HttpOnly";

        return Ok(new LoginResponse(accessToken, DateTime.UtcNow.AddMinutes(jwtSettings.Value.ExpirationInMinutes)));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginRequest>> Refresh()
    {
        var inputRefreshToken =  HttpContext.Request.Cookies["refreshToken"];
        
        var dbRefreshToken = await dbContext.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(t => t.Token == inputRefreshToken);

        if (dbRefreshToken is null || dbRefreshToken.Expires < DateTime.UtcNow)
        {
            return Unauthorized();
        }
        
        var roles = await userManager.GetRolesAsync(dbRefreshToken.User);
        var accessToken = tokenProvider.GetAccessToken(dbRefreshToken.User, roles, jwtSettings);

        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = dbRefreshToken.UserId,
            Token = tokenProvider.GetRefreshToken(),
            Created = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddDays(refreshTokenSettings.Value.ExpirationInDays)
        };

        dbContext.RefreshTokens.Remove(dbRefreshToken);
        dbContext.RefreshTokens.Add(newRefreshToken);

        await dbContext.SaveChangesAsync();
        
        HttpContext.Response.Headers.SetCookie = $"refreshToken={newRefreshToken.Token}; HttpOnly";

        return Ok(new LoginResponse(accessToken, DateTime.UtcNow.AddMinutes(jwtSettings.Value.ExpirationInMinutes)));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult GetMe()
    {
        return Ok(User.Claims.ToDictionary(c => c.Type, c => c.Value));
    }
    
    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var refreshTokenQueryResult = dbContext.RefreshTokens
            .Where(r => r.UserId == userId);

        if (!refreshTokenQueryResult.Any())
        {
            return Ok();
        }

        await refreshTokenQueryResult.ExecuteDeleteAsync();
        await dbContext.SaveChangesAsync();

        HttpContext.Response.Headers.SetCookie = $"refreshToken=; HttpOnly; expires={DateTime.UtcNow}";

        return Ok();
    }
}