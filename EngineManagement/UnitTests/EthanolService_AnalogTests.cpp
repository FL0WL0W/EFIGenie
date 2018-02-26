#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Services.h"
#include "EthanolService_Analog.h"
#include "MockTimerService.h"
#include "MockAnalogService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	TEST_CLASS(EthanolService_AnalogTests)
	{
	public:
		HardwareAbstraction::MockAnalogService _analogService;

		void CreateServices()
		{
			EngineManagement::CurrentAnalogService = &_analogService;

			void *config = malloc(20);
			void *buildConfig = config;

			//ethanol service id
			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

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

			EngineManagement::CurrentEthanolService = EngineManagement::CreateEthanolService(config);
		}

		TEST_METHOD(WhenGettingEthanolContentThenCorrectEthanolContentIsReturned)
		{
			CreateServices();

			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(-10.0f, EngineManagement::CurrentEthanolService->EthanolContent, 0.1f);

			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(1));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(20.0f, EngineManagement::CurrentEthanolService->EthanolContent, 0.1f);

			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(0.5));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(-1.25f, EngineManagement::CurrentEthanolService->EthanolContent, 0.001f);

			EXPECT_CALL(_analogService, ReadPin(1)).Times(1).WillOnce(Return(0.5));
			EngineManagement::CurrentEthanolService->ReadEthanolContent();
			Assert::AreEqual(-1.25f, EngineManagement::CurrentEthanolService->EthanolContent, 0.001f);
		}
	};
}