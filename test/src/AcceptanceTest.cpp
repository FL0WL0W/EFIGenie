#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "EFIGenieMain.h"
#include "MockAnalogService.h"
#include "MockDigitalService.h"
#include "MockPwmService.h"
#include "MockTimerService.h"
#include <fstream>
using namespace testing;

using namespace EmbeddedIOServices;
using namespace EmbeddedIOOperations;
using namespace EFIGenie;

namespace UnitTests
{
	class AcceptanceTest : public ::testing::Test 
	{
		protected:
		MockAnalogService _analogService;
		MockDigitalService _digitalService;
		MockPwmService _pwmService;
		MockTimerService _timerService;
		EmbeddedIOServiceCollection _embeddedIOServiceCollection;
		void *_config;
		size_t _sizeOut = 0;
		EFIGenieMain *_eFIGenieMain;
		callback_t _crankTriggerCallback;
		callback_t _camTriggerCallback;

		AcceptanceTest()
		{
			size_t uint8_align = alignof(uint8_t);
			size_t uint16_align = alignof(uint16_t);
			size_t uint32_align = alignof(uint32_t);
			size_t uint64_align = alignof(uint64_t);
			size_t int8_align = alignof(int8_t);
			size_t int16_align = alignof(int16_t);
			size_t int32_align = alignof(int32_t);
			size_t int64_align = alignof(int64_t);
			size_t bool_align = alignof(bool);
			size_t float_align = alignof(float);
			size_t double_align = alignof(double);


			_embeddedIOServiceCollection.AnalogService = &_analogService;
			_embeddedIOServiceCollection.DigitalService = &_digitalService;
			_embeddedIOServiceCollection.PwmService = &_pwmService;
			_embeddedIOServiceCollection.TimerService = &_timerService;

			EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
			EXPECT_CALL(_digitalService, AttachInterrupt(11, _)).WillOnce(SaveArg<1>(&_crankTriggerCallback));
			EXPECT_CALL(_digitalService, AttachInterrupt(17, _)).WillOnce(SaveArg<1>(&_camTriggerCallback));

			std::ifstream file("tune.bin", std::ios::binary | std::ios::ate);
			std::streamsize size = file.tellg();
			file.seekg(0, std::ios::beg);

			_config = malloc(size);
			if (file.read(reinterpret_cast<char *>(_config), size))
			{
				_eFIGenieMain = new EFIGenieMain(_config, _sizeOut, &_embeddedIOServiceCollection);
			}
		}
	};

	TEST_F(AcceptanceTest, ParsingConfigDidNotBreak)
	{
	}
}