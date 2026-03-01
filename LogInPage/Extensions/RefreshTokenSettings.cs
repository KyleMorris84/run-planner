namespace Api;

public class RefreshTokenSettings
{
    public int ExpirationInDays { get; set; }
    public int CleanUpFrequencyInMinutes { get; set; }
}