namespace FuryVibes.Domain;

public class Package
{
    public Guid Id { get; set; }
    
    public PackageType Type { get; set; }
    
    public float Weight { get; set; }
    
    public Coordinates Coordinates { get; set; }
    
    
}