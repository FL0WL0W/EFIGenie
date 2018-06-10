#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "MockDigitalService.h"
#include "HardwareAbstractionCollection.h"
#include "IBooleanOutputService.h"
#include "BooleanOutputService.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;
using namespace HardwareAbstraction;
using namespace IOService;

namespace UnitTests
{
	TEST_CLASS(BooleanOutputServiceTests)
	{
	public:
		MockDigitalService _digitalService;
		HardwareAbstractionCollection _hardwareAbstractionCollection;
		IBooleanOutputService *_booleanOutputService0;
		IBooleanOutputService *_booleanOutputService1;
		IBooleanOutputService *_booleanOutputService2;
		IBooleanOutputService *_booleanOutputService3;

		void CreateServices()
		{
			_hardwareAbstractionCollection.DigitalService = &_digitalService;

			BooleanOutputServiceConfig *outputConfig = (BooleanOutputServiceConfig *)malloc(sizeof(BooleanOutputServiceConfig));

			outputConfig->Pin = 1;
			outputConfig->NormalOn = false;

			void *config = malloc(outputConfig->Size() + 1);
			*(unsigned char *)config = 1;
			memcpy(((unsigned char *)config + 1), outputConfig, outputConfig->Size());

			unsigned int size = 0;
			_booleanOutputService0 = IBooleanOutputService::CreateBooleanOutputService(&_hardwareAbstractionCollection, config, &size, false);

			outputConfig->Pin = 3;
			config = malloc(outputConfig->Size() + 1);
			*(unsigned char *)config = 1;
			memcpy(((unsigned char *)config + 1), outputConfig, outputConfig->Size());
			_booleanOutputService2 = IBooleanOutputService::CreateBooleanOutputService(&_hardwareAbstractionCollection, config, &size, true);

			outputConfig->Pin = 2;
			outputConfig->NormalOn = true;
			config = malloc(outputConfig->Size() + 1);
			*(unsigned char *)config = 1;
			memcpy(((unsigned char *)config + 1), outputConfig, outputConfig->Size());
			_booleanOutputService1 = IBooleanOutputService::CreateBooleanOutputService(&_hardwareAbstractionCollection, config, &size, false);

			outputConfig->Pin = 4;
			config = malloc(outputConfig->Size() + 1);
			*(unsigned char *)config = 1;
			memcpy(((unsigned char *)config + 1), outputConfig, outputConfig->Size());
			_booleanOutputService3 = IBooleanOutputService::CreateBooleanOutputService(&_hardwareAbstractionCollection, config, &size, true);
		}

		TEST_METHOD(WhenCallingBooleanOutputServiceThenCorrectPinIsChangedCorrectly)
		{
			CreateServices();

			//dwell
			EXPECT_CALL(_digitalService, WritePin(1, true)).Times(1);
			IBooleanOutputService::OutputSetTask(_booleanOutputService0);

			EXPECT_CALL(_digitalService, WritePin(2, false)).Times(1);
			IBooleanOutputService::OutputSetTask(_booleanOutputService1);

			EXPECT_CALL(_digitalService, InitPin(3, HardwareAbstraction::In)).Times(1);
			IBooleanOutputService::OutputSetTask(_booleanOutputService2);

			EXPECT_CALL(_digitalService, InitPin(4, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(4, false)).Times(1);
			IBooleanOutputService::OutputSetTask(_booleanOutputService3);

			//fire
			EXPECT_CALL(_digitalService, WritePin(1, false)).Times(1);
			IBooleanOutputService::OutputResetTask(_booleanOutputService0);

			EXPECT_CALL(_digitalService, WritePin(2, true)).Times(1);
			IBooleanOutputService::OutputResetTask(_booleanOutputService1);

			EXPECT_CALL(_digitalService, InitPin(3, HardwareAbstraction::Out)).Times(1);
			EXPECT_CALL(_digitalService, WritePin(3, false)).Times(1);
			IBooleanOutputService::OutputResetTask(_booleanOutputService2);

			EXPECT_CALL(_digitalService, InitPin(4, HardwareAbstraction::In)).Times(1);
			IBooleanOutputService::OutputResetTask(_booleanOutputService3);
			
		}
	};
}