namespace ScoreHub_Infrastructure;

public class PasswordHasher : IPasswordHasher
{
    public string Generate(string password) => BCrypt.Net.BCrypt.EnhancedHashPassword(password);
    public bool Verify(string hash, string password)  => BCrypt.Net.BCrypt.EnhancedVerify(password, hash);
}