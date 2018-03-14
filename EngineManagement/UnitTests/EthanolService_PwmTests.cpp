#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Services.h"
#include "SensorService_Frequency.h"
#include "MockTimerService.h"
#include "MockPwmService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	TEST_CLASS(EthanolService_PwmTests)
	{
	public:
		HardwareAbstraction::MockTimerService _timerService;
		HardwareAbstraction::MockPwmService _pwmService;

		void CreateServices()
		{
			EngineManagement::CurrentTimerService = &_timerService;
			EngineManagement::CurrentPwmService = &_pwmService;

			void *config = malloc(30);
			void *buildConfig = config;

			//ethanol service id
			*((unsigned char *)buildConfig) = 3;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

			//pwmPin
			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			//A0
			*((float *)buildConfig) = -10;
			buildConfig = (void*)((float *)buildConfig + 1);

			//A1
			*((float *)buildConfig) = 10;
			buildConfig = (void*)((float *)buildConfig + 1);

			//A2
			*((float *)buildConfig) = 10;
			buildConfig = (void*)((float *)buildConfig + 1);

			//A3
			*((float *)buildConfig) = 10;
			buildConfig = (void*)((float *)buildConfig + 1);

			//Derivative Sample Rate
			*((unsigned short *)buildConfig) = 500;
			buildConfig = (void*)((unsigned short *)buildConfig + 1);

			//MaxValue
			*((float *)buildConfig) = 150;
			buildConfig = (void*)((float *)buildConfig + 1);

			//MinValue
			*((float *)buildConfig) = 30;
			buildConfig = (void*)((float *)buildConfig + 1);

			//MinFrequency
			*((unsigned short *)buildConfig) = 40;
			buildConfig = (void*)((unsigned short *)buildConfig + 1);

			EXPECT_CALL(_timerService, GetTicksPerSecond())
				.WillRepeatedly(Return(5000));
			EngineManagement::CurrentEthanolContentService = EngineManagement::CreateSensorService(config);
		}

		TEST_METHOD(WhenGettingValueThenCorrectValueIsReturned)
		{
			CreateServices();
			HardwareAbstraction::PwmValue pwmValue = { 1.0f, 0.5f };
			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(5));
			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolContentService->ReadValue();
			Assert::AreEqual(30.0f, EngineManagement::CurrentEthanolContentService->Value, 0.1f);
			Assert::AreEqual(0.0f, EngineManagement::CurrentEthanolContentService->ValueDot, 0.1f);

			pwmValue = { 0.5f, 0.4f };
			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(10));
			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolContentService->ReadValue();
			Assert::AreEqual(130.0f, EngineManagement::CurrentEthanolContentService->Value, 0.1f);
			Assert::AreEqual(65000.0f, EngineManagement::CurrentEthanolContentService->ValueDot, 0.1f);

			pwmValue = { 0.25f, 0.2f };
			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(15));
			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolContentService->ReadValue();
			Assert::AreEqual(150.0f, EngineManagement::CurrentEthanolContentService->Value, 0.001f);
			Assert::AreEqual(65000.0f, EngineManagement::CurrentEthanolContentService->ValueDot, 0.1f);

			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(20));
			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolContentService->ReadValue();
			Assert::AreEqual(150.0f, EngineManagement::CurrentEthanolContentService->Value, 0.001f);
			Assert::AreEqual(10000.0f, EngineManagement::CurrentEthanolContentService->ValueDot, 0.1f);
		}
	};
}