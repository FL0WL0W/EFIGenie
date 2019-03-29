// #include "gmock/gmock.h"
// #include "gtest/gtest.h"
// #include "Service/EngineControlServiceBuilder.h"
// using ::testing::AtLeast;
// using ::testing::Return;

// using namespace HardwareAbstraction;
// using namespace EngineControlServices;
// using namespace IOServices;
// using namespace Service;

// namespace UnitTests
// {
// 	TEST(IgnitionConfig_StaticTests, WhenGettingIgnitionConfig)
// 	{
// 		IgnitionConfig_StaticConfig *ignitionConfigConfig = (IgnitionConfig_StaticConfig *)malloc(sizeof(IgnitionConfig_StaticConfig));
// 		ServiceLocator *serviceLocator = new ServiceLocator();

// 		ignitionConfigConfig->IgnitionAdvance64thDegree = 10 * 64;
// 		ignitionConfigConfig->IgnitionDwellTime = 4*0.001f;

// 		void *config = malloc(ignitionConfigConfig->Size() + 1);
// 		*(unsigned char *)config = 1;
// 		memcpy(((unsigned char *)config + 1), ignitionConfigConfig, ignitionConfigConfig->Size());

// 		unsigned int size = 0;
// 		IIgnitionConfig *ignitionConfig = EngineControlServiceBuilder::CreateIgnitionConfig(serviceLocator, config, &size);

// 		IgnitionTiming timing = ignitionConfig->GetIgnitionTiming();

// 		ASSERT_EQ((short)(10 * 64), timing.IgnitionAdvance64thDegree);
// 		ASSERT_NEAR(4*0.001f, timing.IgnitionDwellTime, 0.0001f);
// 		ASSERT_TRUE(timing.IgnitionEnable);
// 	}
// }