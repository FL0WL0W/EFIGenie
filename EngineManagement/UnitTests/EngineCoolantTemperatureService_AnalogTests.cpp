//#include "stdafx.h"
//#include "CppUnitTest.h"
//#include "gmock/gmock.h"
//#include "gtest/gtest.h"
//#include "Services.h"
//#include "SensorService_Analog.h"
//#include "MockTimerService.h"
//#include "MockAnalogService.h"
//using ::testing::AtLeast;
//using ::testing::Return;
//
//using namespace Microsoft::VisualStudio::CppUnitTestFramework;
//
//namespace UnitTests
//{
//	TEST_CLASS(EngineCoolantTemperatureService_AnalogTests)
//	{
//	public:
//		HardwareAbstraction::MockTimerService _timerService;
//		HardwareAbstraction::MockAnalogService _analogService;
//
//		void CreateServices()
//		{
//			EngineManagement::CurrentTimerService = &_timerService;
//			EngineManagement::CurrentAnalogService = &_analogService;
//			
//			void *config = malloc(28);
//			void *buildConfig = config;
//
//			//ect service id
//			*((unsigned char *)buildConfig) = 2;
//			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);
//
//			//adcPin
//			*((unsigned char *)buildConfig) = 1;
//			buildConfig = (void*)((unsigned char *)buildConfig + 1);
//
//			//A0
//			*((float *)buildConfig) = -10;
//			buildConfig = (void*)((float *)buildConfig + 1);
//
//			//A1
//			*((float *)buildConfig) = 10;
//			buildConfig = (void*)((float *)buildConfig + 1);
//
//			//A2
//			*((float *)buildConfig) = 10;
//			buildConfig = (void*)((float *)buildConfig + 1);
//
//			//A3
//			*((float *)buildConfig) = 10;
//			buildConfig = (void*)((float *)buildConfig + 1);
//			
//			//Derivative Sample Rate
//			*((unsigned short *)buildConfig) = 500;
//			buildConfig = (void*)((unsigned short *)buildConfig + 1);
//
//			//MaxValue
//			*((float *)buildConfig) = 150;
//			buildConfig = (void*)((float *)buildConfig + 1);
//
//			//MinValue
//			*((float *)buildConfig) = -40;
//			buildConfig = (void*)((float *)buildConfig + 1);
//
//			EXPECT_CALL(_timerService, GetTicksPerSecond())
//				.WillRepeatedly(Return(5000));
//			EXPECT_CALL(_analogService, InitPin(1)).Times(1);
//			EngineManagement::CurrentEngineCoolantTemperatureService = EngineManagement::CreateSensorService(config);
//		}
//
//		TEST_METHOD(WhenGettingValueThenCorrectValueIsReturned)
//		{
//			CreateServices();
//
//			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(5));
//			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(0));
//			EngineManagement::CurrentEngineCoolantTemperatureService->ReadValue();
//			Assert::AreEqual(-10.0f, EngineManagement::CurrentEngineCoolantTemperatureService->Value, 0.1f);
//			Assert::AreEqual(0.0f, EngineManagement::CurrentEngineCoolantTemperatureService->ValueDot, 0.1f);
//
//			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(10));
//			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(1));
//			EngineManagement::CurrentEngineCoolantTemperatureService->ReadValue();
//			Assert::AreEqual(20.0f, EngineManagement::CurrentEngineCoolantTemperatureService->Value, 0.1f);
//			Assert::AreEqual(10000.0f, EngineManagement::CurrentEngineCoolantTemperatureService->ValueDot, 0.1f);
//
//			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(15));
//			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(0.5));
//			EngineManagement::CurrentEngineCoolantTemperatureService->ReadValue();
//			Assert::AreEqual(-1.25f, EngineManagement::CurrentEngineCoolantTemperatureService->Value, 0.001f);
//			Assert::AreEqual(10000.0f, EngineManagement::CurrentEngineCoolantTemperatureService->ValueDot, 0.1f);
//
//			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(20));
//			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(0.5));
//			EngineManagement::CurrentEngineCoolantTemperatureService->ReadValue();
//			Assert::AreEqual(-1.25f, EngineManagement::CurrentEngineCoolantTemperatureService->Value, 0.001f);
//			Assert::AreEqual(-10625.0f, EngineManagement::CurrentEngineCoolantTemperatureService->ValueDot, 0.1f);
//
//			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(30));
//			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(100));
//			EngineManagement::CurrentEngineCoolantTemperatureService->ReadValue();
//			Assert::AreEqual(150.0f, EngineManagement::CurrentEngineCoolantTemperatureService->Value, 0.1f);
//
//			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(30));
//			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(-100));
//			EngineManagement::CurrentEngineCoolantTemperatureService->ReadValue();
//			Assert::AreEqual(-40.0f, EngineManagement::CurrentEngineCoolantTemperatureService->Value, 0.1f);
//		}
//	};
//}