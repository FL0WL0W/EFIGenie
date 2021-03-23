#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Operations/Operation_EngineScheduleIgnition.h"
#include "MockTimerService.h"
#include "MockCallBack.h"
using namespace testing;

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;

namespace UnitTests
{
	class Operation_EngineScheduleIgnitionTests : public ::testing::Test 
	{
		protected:
		MockTimerService _timerService;
        MockCallBack _dwell;
        MockCallBack _ignite;
        Operation_EngineScheduleIgnition *_operation;
        EnginePosition _enginePosition;

		Operation_EngineScheduleIgnitionTests()
		{
			EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));

            _operation = new Operation_EngineScheduleIgnition(&_timerService, new Operation_EnginePositionPrediction(&_timerService), 0, &_dwell, &_ignite);
		}
	};

	TEST_F(Operation_EngineScheduleIgnitionTests, WhenSchedulingIgnition_ThenIgnitionScheduledCorrectly)
	{
        _enginePosition.CalculatedTick = 1000;
        _enginePosition.Position = 101;
        _enginePosition.PositionDot = 1;
        _enginePosition.Sequential = true;
        _enginePosition.Synced = true;
        _operation->Execute(_enginePosition, 0.003, 10);
	}
}