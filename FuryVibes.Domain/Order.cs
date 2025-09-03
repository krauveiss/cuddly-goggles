namespace FuryVibes.Domain;

public class Order
{
    public Guid Id { get; set; }
    
    public List<Package> Packages { get; set; }
    
    public DateTime ArrivalTime { get; set; }
    
    public Guid CustomerId { get; set; }
}