using BotManager.Controllers;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BotManager.Models
{
    public class PublishRequest
    {
        [Required]
        public string botID { get; set; }
        [Required]
        public string version { get; set; }
        [Required]
        public IFormFile content { get; set; }
    }

    public class PublishResult
    {
        public string jobID { get; set; }
        public string version { get; set; }
        public string message { get; set; }
    }

    public class PublishRecord
    {
        public string botID { get; set; }
        public string version { get; set; }
        public string lastUpdateTime { get; set; }
    }
}
