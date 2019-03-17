using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BotProject.Controllers
{
    [Route("api/[controller]")]
    public class CommandController : Controller
    {
        [HttpPost]
        public IActionResult ShutDownService()
        {
            Task.Run(()=>Environment.Exit(0));
            return Ok();
        }

        [HttpGet]
        public IActionResult TestAPI()
        {
            return Ok("ok");
        }
    }
}
