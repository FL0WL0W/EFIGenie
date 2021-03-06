// #include "gmock/gmock.h"
// #include "gtest/gtest.h"
// #include "Service/EngineControlServicesServiceBuilderRegister.h"
// #include "MockBooleanOutputService.h"
// #include "MockReluctor.h"
// #include "MockTimerService.h"
// #include "MockIgnitionConfig.h"
// using ::testing::AtLeast;
// using ::testing::Return;

// using namespace HardwareAbstraction;
// using namespace EngineControlServices;
// using namespace IOServices;
// using namespace Reluctor;

// namespace UnitTests
// {
// 	class IgnitionSchedulingServiceTests : public ::testing::Test 
// 	{
// 		protected:
// 		IgnitionSchedulingService *_ignitionSchedulingService;
// 		MockBooleanOutputService _ignitorOutputService0;
// 		MockBooleanOutputService _ignitorOutputService1;
// 		MockBooleanOutputService _ignitorOutputService2;
// 		MockBooleanOutputService _ignitorOutputService3;
// 		MockReluctor _camReluctor;
// 		MockReluctor _crankReluctor;
// 		MockTimerService _timerService;
// 		MockIgnitionConfig _ignitionConfig;

// 		IgnitionSchedulingServiceTests()
// 		{
// 			EXPECT_CALL(_timerService, GetTick()).WillOnce(Return(0));
// 			IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = (IgnitionSchedulingServiceConfig *)malloc(sizeof(IgnitionSchedulingServiceConfig) + 8);

// 			ignitionSchedulingConfig->SequentialRequired = false;
// 			ignitionSchedulingConfig->Ignitors = 4;
// 			unsigned short *IgnitorTdc = (unsigned short *)(ignitionSchedulingConfig + 1);
// 			IgnitorTdc[0] = 0;
// 			IgnitorTdc[1] = 180 * 64;
// 			IgnitorTdc[2] = 360 * 64;
// 			IgnitorTdc[3] = 540 * 64;
			
// 			IBooleanOutputService **ignitorOutputServices = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService **) * 5);
// 			ignitorOutputServices[0] = (IBooleanOutputService *)(&_ignitorOutputService0);
// 			ignitorOutputServices[1] = (IBooleanOutputService *)(&_ignitorOutputService1);
// 			ignitorOutputServices[2] = (IBooleanOutputService *)(&_ignitorOutputService2);
// 			ignitorOutputServices[3] = (IBooleanOutputService *)(&_ignitorOutputService3);
// 			ignitorOutputServices[4] = 0;

// 			unsigned int size = 0;
// 			_ignitionSchedulingService = new IgnitionSchedulingService(ignitionSchedulingConfig, &_ignitionConfig, ignitorOutputServices, &_timerService, &_crankReluctor, &_camReluctor);
// 		}
// 	};

// 	TEST_F(IgnitionSchedulingServiceTests, IgnitionSchedulingServiceTests_WhenSchedulingIgnition)
// 	{
// 		EXPECT_CALL(_camReluctor, IsSynced()).WillRepeatedly(Return(true));
// 		EXPECT_CALL(_crankReluctor, IsSynced()).WillRepeatedly(Return(true));
// 		EXPECT_CALL(_camReluctor, GetResolution()).WillRepeatedly(Return(2));
// 		EXPECT_CALL(_crankReluctor, GetResolution()).WillRepeatedly(Return(24));
// 		EXPECT_CALL(_crankReluctor, GetTickPerDegree()).WillRepeatedly(Return(1));
// 		EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
			
// 		EXPECT_CALL(_crankReluctor, GetPosition()).WillOnce(Return(15));
// 		EXPECT_CALL(_camReluctor, GetPosition()).WillOnce(Return(7.5));
// 		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(0));
// 		IgnitionTiming ignitionTiming = IgnitionTiming();
// 		ignitionTiming.IgnitionAdvance64thDegree = 15 * 64;
// 		ignitionTiming.IgnitionDwellTime = 0.004;
// 		ignitionTiming.IgnitionEnable = true;
// 		EXPECT_CALL(_ignitionConfig, GetIgnitionTiming()).WillOnce(Return(ignitionTiming));
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x2B2));
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x29e));
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x96));
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x82)).Times(5);
// 		_ignitionSchedulingService->ScheduleEvents();
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x96));
// 		EXPECT_CALL(_timerService, GetTick()).Times(3).WillRepeatedly(Return(0x82));
// 		EXPECT_CALL(_ignitorOutputService1, OutputSet()).Times(1);
// 		_timerService.ReturnCallBack();
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x136));
// 		EXPECT_CALL(_timerService, GetTick()).Times(3).WillRepeatedly(Return(0x96));
// 		EXPECT_CALL(_ignitorOutputService1, OutputReset()).Times(1);
// 		_timerService.ReturnCallBack();
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x14a));
// 		EXPECT_CALL(_timerService, GetTick()).Times(3).WillRepeatedly(Return(0x136));
// 		EXPECT_CALL(_ignitorOutputService2, OutputSet()).Times(1);
// 		_timerService.ReturnCallBack();
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x1ea));
// 		EXPECT_CALL(_timerService, GetTick()).Times(3).WillRepeatedly(Return(0x14a));
// 		EXPECT_CALL(_ignitorOutputService2, OutputReset()).Times(1);
// 		_timerService.ReturnCallBack();
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x1fe));
// 		EXPECT_CALL(_timerService, GetTick()).Times(3).WillRepeatedly(Return(0x1ea));
// 		EXPECT_CALL(_ignitorOutputService3, OutputSet()).Times(1);
// 		_timerService.ReturnCallBack();
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x29e));
// 		EXPECT_CALL(_timerService, GetTick()).Times(3).WillRepeatedly(Return(0x1fe));
// 		EXPECT_CALL(_ignitorOutputService3, OutputReset()).Times(1);
// 		_timerService.ReturnCallBack();
// 		EXPECT_CALL(_timerService, ScheduleCallBack(0x2B2));
// 		EXPECT_CALL(_timerService, GetTick()).Times(3).WillRepeatedly(Return(0x29e));
// 		EXPECT_CALL(_ignitorOutputService0, OutputSet()).Times(1);
// 		_timerService.ReturnCallBack();
// 		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0x2B2));
// 		EXPECT_CALL(_ignitorOutputService0, OutputReset()).Times(1);
// 		_timerService.ReturnCallBack();

// 		//TODO: More comprehensive testing
// 	}
// }