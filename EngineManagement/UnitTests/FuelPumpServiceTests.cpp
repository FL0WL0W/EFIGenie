#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Services.h"
#include "FuelPumpService.h"
#include "MockDigitalService.h"
#include "MockTimerService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	TEST_CLASS(FuelPumpServiceTests)
	{
	public:

		HardwareAbstraction::MockDigitalService _digitalService;
		HardwareAbstraction::MockTimerService _timerService;

		void CreateServices(bool normalOn, bool highZ)
		{
			EngineManagement::CurrentDigitalService = &_digitalService;
			EngineManagement::CurrentTimerService = &_timerService;

			void *config = malloc(6);
			void *buildConfig = config;
			//fuelPin
			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			//Prime Time
			*((float *)buildConfig) = 1;
			buildConfig = (void*)((float *)buildConfig + 1);

			//NormalOn
			*((unsigned char *)buildConfig) = normalOn;
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			EXPECT_CALL(_timerService, GetTicksPerSecond())
				.Times(1)
				.WillOnce(Return(5000));
			EngineManagement::CurrentFuelPumpService = new EngineManagement::FuelPumpService(config, highZ);
		}

		TEST_METHOD(WhenUsingFuelPumpThenFuelPumpIsUsed)
		{
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			CreateServices(false, false);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			EngineManagement::CurrentFuelPumpService->Prime();

			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentTimerService->ReturnCallBack();

			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			EngineManagement::CurrentFuelPumpService->On();

			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentFuelPumpService->Off();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			CreateServices(true, false);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentFuelPumpService->Prime();

			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			EngineManagement::CurrentTimerService->ReturnCallBack();

			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentFuelPumpService->On();

			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			EngineManagement::CurrentFuelPumpService->Off();

			//highz
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			CreateServices(false, true);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			EngineManagement::CurrentFuelPumpService->Prime();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentTimerService->ReturnCallBack();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			EngineManagement::CurrentFuelPumpService->On();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentFuelPumpService->Off();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			CreateServices(true, true);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentFuelPumpService->Prime();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			EngineManagement::CurrentTimerService->ReturnCallBack();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentFuelPumpService->On();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			EngineManagement::CurrentFuelPumpService->Off();
		}
	};
}