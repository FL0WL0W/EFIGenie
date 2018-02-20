#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Services.h"
#include "IgnitorService.h"
#include "MockDigitalService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	TEST_CLASS(IgnitorServiceTests)
	{
	public:

		HardwareAbstraction::MockDigitalService _digitalService;

		void CreateServices()
		{
			EngineManagement::CurrentDigitalService = &_digitalService;

			EXPECT_CALL(_digitalService, InitPin(1, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::CurrentIgnitorServices[0] = new EngineManagement::IgnitorService(1, false, false);

			EXPECT_CALL(_digitalService, InitPin(2, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(2, true)).Times(1);
			EngineManagement::CurrentIgnitorServices[1] = new EngineManagement::IgnitorService(2, true, false);

			EXPECT_CALL(_digitalService, InitPin(3, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(3, false)).Times(1);
			EngineManagement::CurrentIgnitorServices[2] = new EngineManagement::IgnitorService(3, false, true);

			EXPECT_CALL(_digitalService, InitPin(4, HardwareAbstraction::In)).Times(1);
			EngineManagement::CurrentIgnitorServices[3] = new EngineManagement::IgnitorService(4, true, true);
		}

		TEST_METHOD(WhenCallingIgnitorServiceThenCorrectPinIsChangedCorrectly)
		{
			CreateServices();

			//dwell
			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			EngineManagement::IIgnitorService::CoilDwellTask(EngineManagement::CurrentIgnitorServices[0]);

			EXPECT_CALL(_digitalService, WritePin(2, false)).Times(1);
			EngineManagement::IIgnitorService::CoilDwellTask(EngineManagement::CurrentIgnitorServices[1]);

			EXPECT_CALL(_digitalService, InitPin(3, HardwareAbstraction::In)).Times(1);
			EngineManagement::IIgnitorService::CoilDwellTask(EngineManagement::CurrentIgnitorServices[2]);

			EXPECT_CALL(_digitalService, InitPin(4, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(4, false)).Times(1);
			EngineManagement::IIgnitorService::CoilDwellTask(EngineManagement::CurrentIgnitorServices[3]);

			//fire
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			EngineManagement::IIgnitorService::CoilFireTask(EngineManagement::CurrentIgnitorServices[0]);

			EXPECT_CALL(_digitalService, WritePin(2, true)).Times(1);
			EngineManagement::IIgnitorService::CoilFireTask(EngineManagement::CurrentIgnitorServices[1]);

			EXPECT_CALL(_digitalService, InitPin(3, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(3, false)).Times(1);
			EngineManagement::IIgnitorService::CoilFireTask(EngineManagement::CurrentIgnitorServices[2]);

			EXPECT_CALL(_digitalService, InitPin(4, HardwareAbstraction::In)).Times(1);
			EngineManagement::IIgnitorService::CoilFireTask(EngineManagement::CurrentIgnitorServices[3]);
			
		}
	};
}