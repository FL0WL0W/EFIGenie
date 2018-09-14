#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "MockBooleanOutputService.h"
#include "MockTimerService.h"
#include "Service/ServiceBuilder.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace HardwareAbstraction;
using namespace EngineManagementServices;
using namespace Service;

namespace UnitTests
{
	class PrimeService_StaticPulseWidthTests : public ::testing::Test 
	{
		protected:
		MockTimerService _timerService;
		IPrimeService *_primeService;
		ServiceLocator *_serviceLocator;
		MockBooleanOutputService _ignitorOutputService0;
		MockBooleanOutputService _ignitorOutputService1;
		MockBooleanOutputService _ignitorOutputService2;
		MockBooleanOutputService _ignitorOutputService3;
		CallBackGroup *_tickCallBackGroup;
		CallBackGroup *_postDecoderCallBackGroup;

		PrimeService_StaticPulseWidthTests()
		{
			_serviceLocator = new ServiceLocator();
			_tickCallBackGroup = new CallBackGroup();
			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);
			_postDecoderCallBackGroup = new CallBackGroup();
			_serviceLocator->Register(POST_DECODER_SYNC_CALL_BACK_GROUP, (void *)_postDecoderCallBackGroup);

			IBooleanOutputService **ignitorOutputServices = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService **) * 5);
			ignitorOutputServices[0] = (IBooleanOutputService *)(&_ignitorOutputService0);
			ignitorOutputServices[1] = (IBooleanOutputService *)(&_ignitorOutputService1);
			ignitorOutputServices[2] = (IBooleanOutputService *)(&_ignitorOutputService2);
			ignitorOutputServices[3] = (IBooleanOutputService *)(&_ignitorOutputService3);
			ignitorOutputServices[4] = 0;

			_serviceLocator->Register(INJECTOR_SERVICES_ID, ignitorOutputServices);
			_serviceLocator->Register(TIMER_SERVICE_ID, &_timerService);

			void *config = malloc(5);
			void *buildConfig = config;

			//fuel prime service id
			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

			//Prime Time
			*((float *)buildConfig) = 1;
			buildConfig = (void*)((float *)buildConfig + 1);

			EXPECT_CALL(_timerService, GetTicksPerSecond())
				.Times(1)
				.WillOnce(Return(5000));
			unsigned int sizeOut = 0;
			_primeService = ServiceBuilder::CreatePrimeService(_serviceLocator, config, &sizeOut);
		}
	};

	TEST_F(PrimeService_StaticPulseWidthTests, WhenUsingFuelPrimeThenFuelPrimeIsUsed)
	{
		EXPECT_CALL(_ignitorOutputService0, OutputSet()).Times(1);
		EXPECT_CALL(_ignitorOutputService1, OutputSet()).Times(1);
		EXPECT_CALL(_ignitorOutputService2, OutputSet()).Times(1);
		EXPECT_CALL(_ignitorOutputService3, OutputSet()).Times(1);
		EXPECT_CALL(_timerService, GetTick()).Times(5).WillRepeatedly(Return(0));
		EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(4);
		_postDecoderCallBackGroup->Execute();

		EXPECT_CALL(_ignitorOutputService0, OutputReset()).Times(1);
		EXPECT_CALL(_ignitorOutputService1, OutputReset()).Times(1);
		EXPECT_CALL(_ignitorOutputService2, OutputReset()).Times(1);
		EXPECT_CALL(_ignitorOutputService3, OutputReset()).Times(1);
		_timerService.ReturnCallBack();
	}
}