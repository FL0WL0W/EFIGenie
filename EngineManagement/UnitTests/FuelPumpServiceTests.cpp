#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "BooleanOutputService.h"
#include "ServiceBuilder.h"
#include "FuelPumpService.h"
#include "MockDigitalService.h"
#include "MockTimerService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;
using namespace HardwareAbstraction;
using namespace IOService;
using namespace ApplicationService;

namespace UnitTests
{
	TEST_CLASS(FuelPumpServiceTests)
	{
	public:

		MockDigitalService _digitalService;
		MockTimerService _timerService;
		IFuelPumpService * _fuelPumpService;
		HardwareAbstractionCollection _hardwareAbstractionCollection;

		void CreateServices(bool normalOn, bool highZ)
		{
			ServiceLocator *serviceLocator = new ServiceLocator();
			serviceLocator->Register(DIGITAL_SERVICE_ID, &_digitalService);
			serviceLocator->Register(TIMER_SERVICE_ID, &_timerService);

			_hardwareAbstractionCollection.TimerService = &_timerService;
			_hardwareAbstractionCollection.DigitalService = &_digitalService;

			serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, &_hardwareAbstractionCollection);

			FuelPumpServiceConfig *fuelPumpServiceConfig = (FuelPumpServiceConfig *)malloc(sizeof(FuelPumpServiceConfig));
			fuelPumpServiceConfig->PrimeTime = 1;

			BooleanOutputServiceConfig *booleanOutputConfig = (BooleanOutputServiceConfig *)malloc(sizeof(BooleanOutputServiceConfig));
			booleanOutputConfig->Pin = 1;
			booleanOutputConfig->NormalOn = normalOn;
			booleanOutputConfig->HighZ = highZ;

			void *config = malloc(fuelPumpServiceConfig->Size() + booleanOutputConfig->Size() + 2);
			void *buildConfig = config;

			//fuel pump service id
			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);
			memcpy(buildConfig, fuelPumpServiceConfig, fuelPumpServiceConfig->Size());
			buildConfig = (void *)(((unsigned char *)buildConfig) + fuelPumpServiceConfig->Size());

			//boolean output service id
			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);
			memcpy(buildConfig, booleanOutputConfig, booleanOutputConfig->Size());

			EXPECT_CALL(_timerService, GetTicksPerSecond())
				.Times(1)
				.WillOnce(Return(5000));
			unsigned int size = 0;
			_fuelPumpService = ServiceBuilder::CreateFuelPumpService(serviceLocator, config, &size);
		}

		TEST_METHOD(WhenUsingFuelPumpThenFuelPumpIsUsed)
		{
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			CreateServices(false, false);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			_fuelPumpService->Prime();

			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_timerService.ReturnCallBack();

			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			_fuelPumpService->On();

			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_fuelPumpService->Off();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			CreateServices(true, false);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_fuelPumpService->Prime();

			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			_timerService.ReturnCallBack();

			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_fuelPumpService->On();

			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			_fuelPumpService->Off();

			//highz
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			CreateServices(false, true);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			_fuelPumpService->Prime();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_timerService.ReturnCallBack();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			_fuelPumpService->On();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_fuelPumpService->Off();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			CreateServices(true, true);

			EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
			EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_fuelPumpService->Prime();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			_timerService.ReturnCallBack();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			_fuelPumpService->On();

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
			_fuelPumpService->Off();
		}
	};
}