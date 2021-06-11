using Bot.MessageRouting.Tests.AutoMocking;
using Moq;

namespace Bot.MessageRouting.Tests
{
    public class TestsFor<TInstance> where TInstance : class
    {
        public TInstance Instance { get; set; }
        public MoqAutoMocker<TInstance> AutoMocker { get; private set; }

        public TestsFor()
        {
            AutoMocker = new MoqAutoMocker<TInstance>();

            BeforeTestClassCreation();

            Instance = AutoMocker.ClassUnderTest;

            AfterTestClassCreation();
        }

        public virtual void BeforeTestClassCreation()
        {
            // No code - ever!
        }

        public virtual void AfterTestClassCreation()
        {
            // No code - ever!
        }

        public Mock<TContract> GetMockFor<TContract>() where TContract : class
        {
            return Mock.Get(AutoMocker.Get<TContract>());
        }
    }
}