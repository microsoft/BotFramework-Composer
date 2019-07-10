using System;
using System.Collections.Generic;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Input;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Recognizers;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Rules;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Steps;
using Microsoft.Extensions.Configuration;

namespace Microsoft.BotBuilderSamples
{
    public class RootDialog : ComponentDialog
    {
        private static IConfiguration Configuration;
        public RootDialog(IConfiguration configuration)
            : base(nameof(RootDialog))
        {
            Configuration = configuration;
            var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
            {
                Recognizer = CreateRecognizer(),
                Steps = new List<IDialog>()
                {
                    new SendActivity("[welcome]"),
                    new TextInput()
                    {
                        Property = "user.ans",
                        Prompt = new ActivityTemplate("[askintent]")
                    }
                },
                Rules = new List<IRule>()
                {
                    new IntentRule("FlightIntent")
                    {
                         Steps = new List<IDialog>()
                        {
                            new TextInput()
                            {
                                Property = "user.FlightDate",
                                Prompt = new ActivityTemplate("[FlightDate]")
                            },
                            new TextInput()
                            {
                                Property = "user.FlightDestination",
                                Prompt = new ActivityTemplate("[FlightDestination]")
                            },
                            new TextInput()
                            {
                                Property = "user.FlightPlace",
                                Prompt = new ActivityTemplate("[FlightPlace]")
                            },
                            new SendActivity("[FlightInfo]")
                        }
                    },
                    new IntentRule("HotelIntent")
                    {
                        Steps = new List<IDialog>()
                        {
                            new TextInput()
                            {
                                Property = "user.HotelPlace",
                                Prompt = new ActivityTemplate("[HotelPlace]")
                            },
                            new TextInput()
                            {
                                Property = "user.HotelDate",
                                Prompt = new ActivityTemplate("[HotelDate]")
                            },
                            new TextInput()
                            {
                                Property = "user.HotelPriority",
                                Prompt = new ActivityTemplate("[HotelPriority]")
                            },
                            new SendActivity("[HotelInfo]")
                        }
                    },
                    new IntentRule("TicketIntent")
                    {
                        Steps = new List<IDialog>()
                        {
                            new TextInput()
                            {
                                Property = "user.TicketPlace",
                                Prompt = new ActivityTemplate("[TicketPlace]")
                            },
                            new TextInput()
                            {
                                Property = "user.TicketDate",
                                Prompt = new ActivityTemplate("[TicketDate]")
                            },
                            new TextInput()
                            {
                                Property = "user.TicketNumber",
                                Prompt = new ActivityTemplate("[TicketNumber]")
                            },
                            new SendActivity("[TicketInfo]")
                        }
                    },
                    new IntentRule("CancelIntent")
                    {
                        Steps = new List<IDialog>()
                        {
                            new SendActivity("[Cancel]"),
                            new EndDialog()
                        }
                    },
                    

                }
            };

            AddDialog(rootDialog);

            InitialDialogId = nameof(AdaptiveDialog);
        }

        private static IRecognizer CreateRecognizer()
        {
            return new RegexRecognizer()
            {
                Intents = new Dictionary<string, string>()
                {
                    {"FlightIntent", "(?i)flight"},
                    {"HotelIntent", "(?i)hotel"},
                    {"TicketIntent", "(?i)ticket"},
                    {"CancelIntent", "(?i)cancel"}
                }
            };
        }
    }


}