#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Services.h"
#include "EthanolService_Pwm.h"
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
		HardwareAbstraction::MockPwmService _pwmService;

		void CreateServices()
		{
			EngineManagement::CurrentPwmService = &_pwmService;

			void *config = malloc(19);
			void *buildConfig = config;
			//adcPin
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

			EngineManagement::CurrentEthanolService = new EngineManagement::EthanolService_Pwm(config);
		}

		TEST_METHOD(WhenGettingEthanolContentThenCorrectEthanolContentIsReturned)
		{
			CreateServices();
			HardwareAbstraction::PwmValue pwmValue = { 0.01f, 0.00f };
			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(-10.0f, EngineManagement::CurrentEthanolService->EthanolContent, 0.1f);

			pwmValue = { 0.01f, 0.01f };
			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(20.0f, EngineManagement::CurrentEthanolService->EthanolContent, 0.1f);

			pwmValue = { 0.01f, 0.005f };
			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(-1.25f, EngineManagement::CurrentEthanolService->EthanolContent, 0.001f);

			EXPECT_CALL(_pwmService, ReadPin(1)).Times(1).WillOnce(Return(pwmValue));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(-1.25f, EngineManagement::CurrentEthanolService->EthanolContent, 0.001f);
		}
	};
}