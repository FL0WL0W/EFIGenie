#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Service/ServiceBuilder.h"
#include "MockBooleanOutputService.h"
#include "MockCrankCamDecoder.h"
#include "MockTimerService.h"
#include "MockIgnitionConfig.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace HardwareAbstraction;
using namespace EngineManagementServices;
using namespace IOServices;
using namespace CrankCamDecoders;

namespace UnitTests
{
	class IgnitionSchedulingServiceTests : public ::testing::Test 
	{
		protected:
		IgnitionSchedulingService *_ignitionSchedulingService;
		MockBooleanOutputService _ignitorOutputService0;
		MockBooleanOutputService _ignitorOutputService1;
		MockBooleanOutputService _ignitorOutputService2;
		MockBooleanOutputService _ignitorOutputService3;
		MockCrankCamDecoder _decoder;
		MockTimerService _timerService;
		MockIgnitionConfig _ignitionConfig;

		IgnitionSchedulingServiceTests()
		{
			EXPECT_CALL(_timerService, GetTick()).WillOnce(Return(0));
			IgnitionSchedulingServiceConfig *ignitionSchedulingConfig = (IgnitionSchedulingServiceConfig *)malloc(sizeof(IgnitionSchedulingServiceConfig));

			ignitionSchedulingConfig->SequentialRequired = false;
			ignitionSchedulingConfig->Ignitors = 4;
			ignitionSchedulingConfig = IgnitionSchedulingServiceConfig::Cast(ignitionSchedulingConfig);
			ignitionSchedulingConfig->IgnitorTdc[0] = 0;
			ignitionSchedulingConfig->IgnitorTdc[1] = 180;
			ignitionSchedulingConfig->IgnitorTdc[2] = 360;
			ignitionSchedulingConfig->IgnitorTdc[3] = 540;
			
			IBooleanOutputService **ignitorOutputServices = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService **) * 5);
			ignitorOutputServices[0] = (IBooleanOutputService *)(&_ignitorOutputService0);
			ignitorOutputServices[1] = (IBooleanOutputService *)(&_ignitorOutputService1);
			ignitorOutputServices[2] = (IBooleanOutputService *)(&_ignitorOutputService2);
			ignitorOutputServices[3] = (IBooleanOutputService *)(&_ignitorOutputService3);
			ignitorOutputServices[4] = 0;

			unsigned int size = 0;
			_ignitionSchedulingService = new IgnitionSchedulingService(ignitionSchedulingConfig, &_ignitionConfig, ignitorOutputServices, &_timerService, &_decoder);
		}
	};

	TEST_F(IgnitionSchedulingServiceTests, IgnitionSchedulingServiceTests_WhenSchedulingIgnition)
	{

		EXPECT_CALL(_decoder, HasCamPosition()).WillRepeatedly(Return(true));
		EXPECT_CALL(_decoder, GetTickPerDegree()).WillRepeatedly(Return(1));
		EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
			
		EXPECT_CALL(_decoder, GetCamPosition()).WillOnce(Return(15));
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(0));
		IgnitionTiming ignitionTiming = IgnitionTiming();
		ignitionTiming.IgnitionAdvance64thDegree = 15 * 64;
		ignitionTiming.IgnitionDwellTime = 0.004;
		ignitionTiming.IgnitionEnable = true;
		EXPECT_CALL(_ignitionConfig, GetIgnitionTiming()).WillOnce(Return(ignitionTiming));
		EXPECT_CALL(_timerService, ScheduleCallBack(0x2B2));
		EXPECT_CALL(_timerService, ScheduleCallBack(0x29e));
		EXPECT_CALL(_timerService, ScheduleCallBack(0x96));
		EXPECT_CALL(_timerService, ScheduleCallBack(0x82));
		_ignitionSchedulingService->ScheduleEvents();
		EXPECT_CALL(_timerService, ScheduleCallBack(0x96));
		_timerService.ReturnCallBack();
		EXPECT_CALL(_timerService, ScheduleCallBack(0x136));
		_timerService.ReturnCallBack();
		EXPECT_CALL(_timerService, ScheduleCallBack(0x14a));
		_timerService.ReturnCallBack();
		EXPECT_CALL(_timerService, ScheduleCallBack(0x1ea));
		_timerService.ReturnCallBack();
		EXPECT_CALL(_timerService, ScheduleCallBack(0x1fe));
		_timerService.ReturnCallBack();
		EXPECT_CALL(_timerService, ScheduleCallBack(0x29e));
		_timerService.ReturnCallBack();
		EXPECT_CALL(_timerService, ScheduleCallBack(0x2B2));
		_timerService.ReturnCallBack();

		//TODO: More comprehensive testing
	}
}