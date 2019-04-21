#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "IOServices/BooleanOutputService/BooleanOutputService.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "EngineControlServices/FuelPumpService/FuelPumpService.h"
#include "MockDigitalService.h"
#include "MockTimerService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Service;
using namespace EngineControlServices;

namespace UnitTests
{
	class FuelPumpServiceTests : public ::testing::Test 
	{
		protected:
		MockDigitalService _digitalService;
		MockTimerService _timerService;
		IFuelPumpService * _fuelPumpService;
		HardwareAbstractionCollection _hardwareAbstractionCollection;
		ServiceLocator *_serviceLocator;
		CallBackGroup *_tickCallBackGroup;
		CallBackGroup *_preReluctorCallBackGroup;
		CallBackGroup *_postReluctorCallBackGroup;

		FuelPumpServiceTests()
		{
			_serviceLocator = new ServiceLocator();
			_serviceLocator->Register(DIGITAL_SERVICE_ID, &_digitalService);
			_serviceLocator->Register(TIMER_SERVICE_ID, &_timerService);
			_tickCallBackGroup = new CallBackGroup();
			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);
			_preReluctorCallBackGroup = new CallBackGroup();
			_serviceLocator->Register(PRE_RELUCTOR_SYNC_CALL_BACK_GROUP, (void *)_preReluctorCallBackGroup);
			_postReluctorCallBackGroup = new CallBackGroup();
			_serviceLocator->Register(POST_RELUCTOR_SYNC_CALL_BACK_GROUP, (void *)_postReluctorCallBackGroup);

			_hardwareAbstractionCollection.TimerService = &_timerService;
			_hardwareAbstractionCollection.DigitalService = &_digitalService;

			_serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, &_hardwareAbstractionCollection);
		}

		void SetUp(bool normalOn, bool highZ) 
		{
			_tickCallBackGroup->Clear();
			_preReluctorCallBackGroup->Clear();
			_postReluctorCallBackGroup->Clear();
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

			unsigned int size = 0;
			_fuelPumpService = reinterpret_cast<IFuelPumpService *>(IFuelPumpService::CreateFuelPumpService(_serviceLocator, config, size));
		}
	};

	TEST_F(FuelPumpServiceTests, WhenUsingFuelPumpThenFuelPumpIsUsed)
	{
		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		SetUp(false, false);

		EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
		EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
		_preReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(5000));
		_timerService.ReturnCallBack();

		EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
		_postReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		_fuelPumpService->Off();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
		SetUp(true, false);

		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
		EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		_preReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(5000));
		_timerService.ReturnCallBack();

		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		_postReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
		_fuelPumpService->Off();

		//highz
		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		SetUp(false, true);

		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
		EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
		_preReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(5000));
		_timerService.ReturnCallBack();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
		_postReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		_fuelPumpService->Off();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
		SetUp(true, true);

		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
		EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		_preReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
		EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(5000));
		_timerService.ReturnCallBack();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
		EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
		_postReluctorCallBackGroup->Execute();

		EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
		_fuelPumpService->Off();
	}
}