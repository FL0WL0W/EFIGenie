#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Services.h"
#include "PistonEngineFactory.h"
#include "MockDigitalService.h"
#include "MockTimerService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	TEST_CLASS(PrimeService_StaticPulseWidthTests)
	{
	public:
		HardwareAbstraction::MockDigitalService _digitalService;
		HardwareAbstraction::MockTimerService _timerService;

		void CreateServices()
		{
			EngineManagement::CurrentDigitalService = &_digitalService;
			EngineManagement::CurrentTimerService = &_timerService;

			void *config = malloc(4);
			void *buildConfig = config;

			*((unsigned char *)buildConfig) = 4;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

			*((unsigned short *)buildConfig) = 14400; //1/8 ml
			buildConfig = (void *)(((unsigned short *)buildConfig) + 1);

			*((bool *)buildConfig) = 0;
			buildConfig = (void *)(((bool *)buildConfig) + 1);

			*((bool *)buildConfig) = 0;
			buildConfig = (void *)(((bool *)buildConfig) + 1);

			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

			EngineManagement::CurrentPistonEngineConfig = new EngineManagement::PistonEngineConfig(config);

			EngineManagement::CurrentInjectorServices[0] = new EngineManagement::InjectorService(1, false, false);
			EngineManagement::CurrentInjectorServices[1] = new EngineManagement::InjectorService(2, false, false);
			EngineManagement::CurrentInjectorServices[2] = new EngineManagement::InjectorService(3, false, false);
			EngineManagement::CurrentInjectorServices[3] = new EngineManagement::InjectorService(4, false, false);

			config = malloc(4);
			buildConfig = config;
			
			//Prime Time
			*((float *)buildConfig) = 1;
			buildConfig = (void*)((float *)buildConfig + 1);

			EXPECT_CALL(_timerService, GetTicksPerSecond())
				.Times(1)
				.WillOnce(Return(5000));
			EngineManagement::CurrentPrimeService = new EngineManagement::PrimeService_StaticPulseWidth(config);
		}

		TEST_METHOD(WhenUsingFuelPrimeThenFuelPrimeIsUsed)
		{
			CreateServices();

			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(2, true)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(3, true)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(4, true)).Times(1);
			EXPECT_CALL(_timerService, GetTick()).Times(5).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(4);
			EngineManagement::CurrentPrimeService->Prime();

			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(2, false)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(3, false)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(4, false)).Times(1);
			_timerService.ReturnCallBack();
		}
	};
}