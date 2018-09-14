//#include "stdafx.h"
//#include "CppUnitTest.h" 
//#include "gmock/gmock.h"
//#include "gtest/gtest.h" 
//#include "BooleanOutputService.h"
//#include "ServiceBuilder.h"
//#include "FuelPumpService.h"
//#include "MockDecoder.h"
//#include "MockBooleanOutputService.h"
//#include "MockDigitalService.h"
//#include "MockTimerService.h"
//#include "MockInjectionConfig.h"
//#include "MockIgnitionConfig.h"
//using ::testing::AtLeast; 
//using ::testing::Return;
//
//using namespace Microsoft::VisualStudio::CppUnitTestFramework;
//using namespace HardwareAbstraction;
//using namespace IOServices;
//using namespace EngineManagementServices;
//
//namespace UnitTests
//{
//	TEST_CLASS(Pistm  onEngineServiceTests)
//	{
//	public:
//
//		MockTimerService _timerService;
//		MockDecoder _decoder;
//		PistonEngineConfig *_pistonEngineConfig;
//		MockInjectionConfig _injectionConfig;
//		MockIgnitionConfig _ignitionConfig;
//		PistonEngineService * _pistonEngineService;
//		PistonEngineService * _pistonEngineServiceIgnitionOnly;
//		PistonEngineService * _pistonEngineServiceInjectionOnly;
//		MockBooleanOutputService _injectorOutputService0;
//		MockBooleanOutputService _injectorOutputService1;
//		MockBooleanOutputService _injectorOutputService2;
//		MockBooleanOutputService _injectorOutputService3;
//		MockBooleanOutputService _injectorOutputService4;
//		MockBooleanOutputService _injectorOutputService5;
//		MockBooleanOutputService _injectorOutputService6;
//		MockBooleanOutputService _injectorOutputService7;
//		MockBooleanOutputService _ignitorOutputService0;
//		MockBooleanOutputService _ignitorOutputService1;
//		MockBooleanOutputService _ignitorOutputService2;
//		MockBooleanOutputService _ignitorOutputService3;
//		MockBooleanOutputService _ignitorOutputService4;
//		MockBooleanOutputService _ignitorOutputService5;
//		MockBooleanOutputService _ignitorOutputService6;
//		MockBooleanOutputService _ignitorOutputService7;
//		IBooleanOutputService **_injectorOutputServices;
//		IBooleanOutputService **_ignitorOutputServices;
//
//		void CreateServices()
//		{
//			_pistonEngineConfig = (PistonEngineConfig *)malloc(sizeof(PistonEngineConfig));
//			_pistonEngineConfig->Cylinders = 8;
//			_pistonEngineConfig->IsDistributor = false;
//			_pistonEngineConfig->IsDistributor = false;
//			_pistonEngineConfig->Ml8thPerCylinder = 650;
//
//			_injectorOutputServices = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService **) * 8);
//			_injectorOutputServices[0] = (IBooleanOutputService *)(&_injectorOutputService0);
//			_injectorOutputServices[1] = (IBooleanOutputService *)(&_injectorOutputService1);
//			_injectorOutputServices[2] = (IBooleanOutputService *)(&_injectorOutputService2);
//			_injectorOutputServices[3] = (IBooleanOutputService *)(&_injectorOutputService3);
//			_injectorOutputServices[4] = (IBooleanOutputService *)(&_injectorOutputService4);
//			_injectorOutputServices[5] = (IBooleanOutputService *)(&_injectorOutputService5);
//			_injectorOutputServices[6] = (IBooleanOutputService *)(&_injectorOutputService6);
//			_injectorOutputServices[7] = (IBooleanOutputService *)(&_injectorOutputService7);
//			_ignitorOutputServices = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService **) * 8);
//			_ignitorOutputServices[0] = (IBooleanOutputService *)(&_ignitorOutputService0);
//			_ignitorOutputServices[1] = (IBooleanOutputService *)(&_ignitorOutputService1);
//			_ignitorOutputServices[2] = (IBooleanOutputService *)(&_ignitorOutputService2);
//			_ignitorOutputServices[3] = (IBooleanOutputService *)(&_ignitorOutputService3);
//			_ignitorOutputServices[4] = (IBooleanOutputService *)(&_ignitorOutputService4);
//			_ignitorOutputServices[5] = (IBooleanOutputService *)(&_ignitorOutputService5);
//			_ignitorOutputServices[6] = (IBooleanOutputService *)(&_ignitorOutputService6);
//			_ignitorOutputServices[7] = (IBooleanOutputService *)(&_ignitorOutputService7);
//
//			_pistonEngineServiceIgnitionOnly = new PistonEngineService(_pistonEngineConfig, 0, 0, &_ignitionConfig, _ignitorOutputServices, &_timerService, &_decoder);
//			_pistonEngineServiceInjectionOnly = new PistonEngineService(_pistonEngineConfig, &_injectionConfig, _injectorOutputServices, 0, 0, &_timerService, &_decoder);
//			_pistonEngineService = new PistonEngineService(_pistonEngineConfig, &_injectionConfig, _injectorOutputServices, &_ignitionConfig, _ignitorOutputServices, &_timerService, &_decoder);
//		}
//
//		TEST_METHOD(WhenCallingPistonEngineService)
//		{
//			EXPECT_CALL(_decoder, HasCamPosition()).WillRepeatedly(Return(true));
//			EXPECT_CALL(_decoder, GetTickPerDegree()).WillRepeatedly(Return(1));
//			EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
//
//			CreateServices();
//			EXPECT_CALL(_decoder, GetCamPosition()).WillOnce(Return(15));
//			EXPECT_CALL(_timerService, GetTick()).WillOnce(Return(0));
//			EXPECT_CALL(_ignitionConfig, GetIgnitionTiming()).WillOnce(Return(10));
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//CreateServices(false, false);
//
//			//EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
//			//EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
//			//_fuelPumpService->Prime();
//
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_timerService.ReturnCallBack();
//
//			//EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
//			//_fuelPumpService->On();
//
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_fuelPumpService->Off();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
//			//CreateServices(true, false);
//
//			//EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
//			//EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_fuelPumpService->Prime();
//
//			//EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
//			//_timerService.ReturnCallBack();
//
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_fuelPumpService->On();
//
//			//EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
//			//_fuelPumpService->Off();
//
//			////highz
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//CreateServices(false, true);
//
//			//EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
//			//EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
//			//_fuelPumpService->Prime();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_timerService.ReturnCallBack();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
//			//_fuelPumpService->On();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_fuelPumpService->Off();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
//			//CreateServices(true, true);
//
//			//EXPECT_CALL(_timerService, GetTick()).Times(2).WillRepeatedly(Return(0));
//			//EXPECT_CALL(_timerService, ScheduleCallBack(5000)).Times(1);
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_fuelPumpService->Prime();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
//			//_timerService.ReturnCallBack();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
//			//EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
//			//_fuelPumpService->On();
//
//			//EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::In)).Times(1);
//			//_fuelPumpService->Off();
//		}
//	};
//}