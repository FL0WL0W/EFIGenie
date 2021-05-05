#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "EngineMain.h"
#include "MockAnalogService.h"
#include "MockDigitalService.h"
#include "MockPwmService.h"
#include "MockTimerService.h"
#include <fstream>
using namespace testing;

using namespace EmbeddedIOServices;
using namespace Engine;

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
		unsigned int _sizeOut = 0;

		AcceptanceTest()
		{
			_embeddedIOServiceCollection.AnalogService = &_analogService;
			_embeddedIOServiceCollection.DigitalService = &_digitalService;
			_embeddedIOServiceCollection.PwmService = &_pwmService;
			_embeddedIOServiceCollection.TimerService = &_timerService;

			std::ifstream file("tune.bin", std::ios::binary | std::ios::ate);
			std::streamsize size = file.tellg();
			file.seekg(0, std::ios::beg);

			_config = malloc(size);
			if (file.read(reinterpret_cast<char *>(_config), size))
			{
				EngineMain::Start(&_embeddedIOServiceCollection, _config, _sizeOut);
			}
			//EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
		}
	};

	TEST_F(AcceptanceTest, AcceptanceTest1)
	{
	}
}