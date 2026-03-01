using Api.Model;
using Microsoft.Extensions.Options;

namespace Api.Services;

public interface ITokenProvider
{
    public string GetAccessToken(ApplicationUser user, IEnumerable<string> roles, IOptions<JwtSettings> jwtSettings);
    public string GetRefreshToken();
}