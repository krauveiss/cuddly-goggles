namespace FuryVibes.Domain;

public class Elevator
{
    public float Speed { get; set; }
    
    public float RemainingDistanceToStation { get; set; }
    
    public ElevatorStatus Status { get; set; }
    
    public List<Order> Orders { get; set; }
    
    public float Capacity { get; set; }
    
}