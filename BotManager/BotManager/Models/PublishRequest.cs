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
        public string label { get; set; }
        [Required]
        public IFormFile content { get; set; }
    }

    public class PublishResult
    {
        public string versionID { get; set; }
        public string label { get; set; }
    }
}
