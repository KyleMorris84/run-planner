using Microsoft.AspNetCore.Identity;

namespace Api.Model;

public sealed class ApplicationUser : IdentityUser
{
    public bool NotificationsEnabled { get; set; }
    public required string Name { get; set; }
}