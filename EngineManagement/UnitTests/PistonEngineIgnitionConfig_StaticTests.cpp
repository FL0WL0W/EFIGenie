#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "ServiceBuilder.h"
#include "BooleanOutputService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;
using namespace HardwareAbstraction;
using namespace EngineManagement;
using namespace IOService;

namespace UnitTests
{
	TEST_CLASS(PistonEngineIgnitionConfig_StaticTests)
	{
	public:
		IPistonEngineIgnitionConfig *_ignitionConfig;
		PistonEngineConfig *_pistonEngineConfig;

		void CreateServices()
		{
			PistonEngineIgnitionConfig_StaticConfig *outputConfig = (PistonEngineIgnitionConfig_StaticConfig *)malloc(sizeof(PistonEngineIgnitionConfig_StaticConfig));
			ServiceLocator *serviceLocator = new ServiceLocator();

			outputConfig->IgnitionAdvance64thDegree = 10 * 64;
			outputConfig->IgnitionDwellTime = 4*0.001;

			void *config = malloc(outputConfig->Size() + 1);
			*(unsigned char *)config = 1;
			memcpy(((unsigned char *)config + 1), outputConfig, outputConfig->Size());

			_pistonEngineConfig = (PistonEngineConfig *)malloc(sizeof(PistonEngineConfig));
			_pistonEngineConfig->Cylinders = 8;
			_pistonEngineConfig->Ml8thPerCylinder = 650*8;

			unsigned int size = 0;
			_ignitionConfig = ServiceBuilder::CreatePistonEngineIgnitionConfig(serviceLocator, _pistonEngineConfig, config, &size);
		}

		TEST_METHOD(WhenGettingPistonEngineIgnitionConfig)
		{
			CreateServices();

			IgnitionTiming timing = _ignitionConfig->GetIgnitionTiming();

			Assert::AreEqual((short)(10 * 64), timing.IgnitionAdvance64thDegree);
			Assert::AreEqual(4*0.001f, timing.IgnitionDwellTime, 0.0001f);
			Assert::IsTrue(timing.IgnitionEnable);
		}
	};
}