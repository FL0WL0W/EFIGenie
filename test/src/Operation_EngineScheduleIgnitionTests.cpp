#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Operations/Operation_EngineScheduleIgnition.h"
#include "MockTimerService.h"
using namespace testing;

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;
using namespace EFIGenie;

namespace UnitTests
{
	class Operation_EngineScheduleIgnitionTests : public ::testing::Test 
	{
	protected:
		MockTimerService _timerService;
		bool _dwellCalled;
		bool _igniteCalled;
		callback_t _dwellCallBack;
		callback_t _igniteCallBack;
		Operation_EngineScheduleIgnition *_operation;
		EnginePosition _enginePosition;

		Operation_EngineScheduleIgnitionTests()
		{
			_dwellCalled = false;
			_igniteCalled = false;
			_dwellCallBack = [this]() { _dwellCalled = true; };
			_igniteCallBack = [this]() { _igniteCalled = true; };
			
			EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
			_operation = new Operation_EngineScheduleIgnition(&_timerService, 0, _dwellCallBack, _igniteCallBack);
		}

		~Operation_EngineScheduleIgnitionTests()
		{
			delete _operation;
		}

		void SetupSyncedPosition(tick_t calculatedTick, float position, float positionDot, bool sequential)
		{
			_enginePosition.CalculatedTick = calculatedTick;
			_enginePosition.Position = position;
			_enginePosition.PositionDot = positionDot;
			_enginePosition.Sequential = sequential;
			_enginePosition.Synced = true;
		}
	};

	// Not synced, not dwelling
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenNotSynced_ThenNoTasksScheduled)
	{
		_enginePosition.Synced = false;
		
		auto result = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);
		
		ASSERT_EQ(std::get<0>(result), 0);
		ASSERT_EQ(std::get<1>(result), 0);
	}

	// Not enabled, not dwelling
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenNotEnabled_ThenNoTasksScheduled)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		
		auto result = _operation->Execute(_enginePosition, false, 0.003f, 10, 0.0005f);
		
		ASSERT_EQ(std::get<0>(result), 0);
		ASSERT_EQ(std::get<1>(result), 0);
	}

	// Normal operation - first dwell (not dwelling)
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenFirstIgnition_ThenDwellAndIgniteScheduled)
	{
		SetupSyncedPosition(1000, 0, 3600, false); 
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);
		
		tick_t dwellAt = std::get<0>(result);
		tick_t igniteAt = std::get<1>(result);
		ASSERT_GT(dwellAt, 0);
		ASSERT_GT(igniteAt, dwellAt);
		ASSERT_EQ(igniteAt - dwellAt, 15); // 0.003s * 5000 ticks/s = 15 ticks
	}

	// Already dwelling, schedule ignite and next dwell
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenAlreadyDwelling_ThenIgniteAndNextDwellScheduled)
	{
		SetupSyncedPosition(1000, 90, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).WillRepeatedly(Return());

		// First schedule dwelling
		auto result1 = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);

		// Simulate dwell task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<0>(result1)));
		_timerService.ReturnCallBackPrivateFunction();
		
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<0>(result1) + 1));
		auto result2 = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);
		
		// Simulate ignite task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<1>(result2)));
		_timerService.ReturnCallBackPrivateFunction();

		//both calculate ignite the same
		ASSERT_EQ(std::get<1>(result1), std::get<1>(result2));
		//dwell is next dwell and ignite is before next dwell
		ASSERT_GT(std::get<0>(result2), std::get<1>(result2));
	}

	// Dwell time variation
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenDifferentDwellTimes_ThenTimingAdjusted)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result1 = _operation->Execute(_enginePosition, true, 0.002f, 10, 0.0005f);
		tick_t span1 = std::get<1>(result1) - std::get<0>(result1);
		
		// Reset operation
		delete _operation;
		_operation = new Operation_EngineScheduleIgnition(&_timerService, 0, _dwellCallBack, _igniteCallBack);
		
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result2 = _operation->Execute(_enginePosition, true, 0.004f, 10, 0.0005f);
		tick_t span2 = std::get<1>(result2) - std::get<0>(result2);
		
		ASSERT_NE(span1, span2);
		ASSERT_EQ(span1, 10); // 0.002s * 5000
		ASSERT_EQ(span2, 20); // 0.004s * 5000
	}

	// Ignition advance affects timing
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenDifferentAdvance_ThenTimingShifted)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result1 = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);
		tick_t igniteAt1 = std::get<1>(result1);
		
		// Reset operation
		delete _operation;
		_operation = new Operation_EngineScheduleIgnition(&_timerService, 0, _dwellCallBack, _igniteCallBack);
		
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result2 = _operation->Execute(_enginePosition, true, 0.003f, 20, 0.0005f);
		tick_t igniteAt2 = std::get<1>(result2);
		
		ASSERT_NE(igniteAt1, igniteAt2);
	}

	// TDC offset
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenTDCOffset_ThenTimingAdjusted)
	{
		delete _operation;
		_operation = new Operation_EngineScheduleIgnition(&_timerService, 45, _dwellCallBack, _igniteCallBack);
		
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result1 = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);
		tick_t igniteAt1 = std::get<1>(result1);
		
		// Create another with different TDC
		delete _operation;
		_operation = new Operation_EngineScheduleIgnition(&_timerService, 90, _dwellCallBack, _igniteCallBack);
		
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result2 = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);
		tick_t igniteAt2 = std::get<1>(result2);
		
		ASSERT_NE(igniteAt1, igniteAt2);
	}

	// Not synced but dwelling - schedules ignite
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenNotSyncedButDwelling_ThenIgniteScheduled)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).WillRepeatedly(Return());

		// First schedule dwelling
		auto result = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);

		// Simulate dwell task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<0>(result)));
		_timerService.ReturnCallBackPrivateFunction();
		
		// Now lose sync
		_enginePosition.Synced = false;
		
		//schedule ignition
		result = _operation->Execute(_enginePosition, true, 0.003f, 10, 0.0005f);
		
		ASSERT_EQ(std::get<0>(result), 0);
		ASSERT_GT(std::get<1>(result), 0); // Ignite tick is non-zero

		// Simulate ignite task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<1>(result)));
		_timerService.ReturnCallBackPrivateFunction();
	}

	// Very short dwell time rounds up to at least 1 tick
	TEST_F(Operation_EngineScheduleIgnitionTests, WhenVeryShortDwell_ThenScheduledCorrectly)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		
		auto result = _operation->Execute(_enginePosition, true, 0.00009f, 10, 0.0005f); // 0.09ms = 0.45 ticks
		
		tick_t dwellAt = std::get<0>(result);
		tick_t igniteAt = std::get<1>(result);
		ASSERT_GT(igniteAt, dwellAt);
		ASSERT_EQ(igniteAt - dwellAt, 1); // at least 1 tick
	}
}