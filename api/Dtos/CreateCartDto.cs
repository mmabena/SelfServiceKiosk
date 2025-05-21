using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.DTOs
{
    public class CreateCartDto
    {
           public int CartId { get; set; }
    public DateTime DateCreated { get; set; }
    public int UserId { get; set; }
    }
}