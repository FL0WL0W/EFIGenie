#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Operations/Operation_EngineScheduleInjection.h"
#include "MockTimerService.h"
using namespace testing;

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;
using namespace EFIGenie;

namespace UnitTests
{
	class Operation_EngineScheduleInjectionTests : public ::testing::Test 
	{
	protected:
		MockTimerService _timerService;
		bool _openCalled;
		bool _closeCalled;
		callback_t _openCallBack;
		callback_t _closeCallBack;
		Operation_EngineScheduleInjection *_operation;
		EnginePosition _enginePosition;

		Operation_EngineScheduleInjectionTests()
		{
			_openCalled = false;
			_closeCalled = false;
			_openCallBack = [this]() { _openCalled = true; };
			_closeCallBack = [this]() { _closeCalled = true; };
			
			EXPECT_CALL(_timerService, GetTicksPerSecond()).WillRepeatedly(Return(5000));
			_operation = new Operation_EngineScheduleInjection(&_timerService, 0, Operation_EngineScheduleInjection_InjectAt::Middle, _openCallBack, _closeCallBack);
		}

		~Operation_EngineScheduleInjectionTests()
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

	// Not synced, don't open
	TEST_F(Operation_EngineScheduleInjectionTests, WhenNotSynced_ThenNoTasksScheduled)
	{
		_enginePosition.Synced = false;
		
		auto result = _operation->Execute(_enginePosition, true, 0.01f, 0);
		
		ASSERT_EQ(std::get<0>(result), 0);
		ASSERT_EQ(std::get<1>(result), 0);
	}

	// Not enabled, don't open
	TEST_F(Operation_EngineScheduleInjectionTests, WhenNotEnabled_ThenNoTasksScheduled)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		
		auto result = _operation->Execute(_enginePosition, false, 0.01f, 0);
		
		ASSERT_EQ(std::get<0>(result), 0);
		ASSERT_EQ(std::get<1>(result), 0);
	}

	// Normal operation - first injection (not open)
	TEST_F(Operation_EngineScheduleInjectionTests, WhenFirstInjection_ThenOpenAndCloseScheduled)
	{
		SetupSyncedPosition(1000, 0, 3600, false); // 360deg at 3600deg/s = 0.1s per cycle
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).Times(AtLeast(1));
		
		auto result = _operation->Execute(_enginePosition, true, 0.01f, 0); // 10ms pulse width
		
		tick_t openAt = std::get<0>(result);
		tick_t closeAt = std::get<1>(result);
		ASSERT_GT(openAt, 0);
		ASSERT_GT(closeAt, openAt);
		ASSERT_EQ(closeAt - openAt, 50); // 0.01s * 5000 ticks/s = 50 ticks
		
		// Verify tasks are scheduled in the task list
		TaskList taskList = _timerService.GetTaskList();
		ASSERT_EQ(taskList.size(), 2); // open and close tasks
	}

	// 100% duty cycle
	TEST_F(Operation_EngineScheduleInjectionTests, When100PercentDutyCycle_ThenInjectorStaysOpen)
	{
		SetupSyncedPosition(1000, 0, 3600, false); // ticksPerCycle = 500
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).Times(AtLeast(1));
		
		auto result = _operation->Execute(_enginePosition, true, 0.1f, 0); // 100ms = 500 ticks >= ticksPerCycle
		
		tick_t openAt = std::get<0>(result);
		tick_t closeAt = std::get<1>(result);
		ASSERT_GT(openAt, 0);
		ASSERT_EQ(closeAt, 0); // No close scheduled
		
		// Verify only open task is scheduled
		TaskList taskList = _timerService.GetTaskList();
		ASSERT_EQ(taskList.size(), 1); // only open task
	}

	// Injector already open, schedule close and next open
	TEST_F(Operation_EngineScheduleInjectionTests, WhenAlreadyOpen_ThenCloseAndNextOpenScheduled)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).WillRepeatedly(Return());

		// First schedule open
		auto result1 = _operation->Execute(_enginePosition, true, 0.01f, 0);

		// Simulate open task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<0>(result1)));
		_timerService.ReturnCallBackPrivateFunction();
		
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<0>(result1) + 1));
		auto result2 = _operation->Execute(_enginePosition, true, 0.01f, 0);
		
		// Simulate close task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<1>(result2)));
		_timerService.ReturnCallBackPrivateFunction();

		//both calculate close the same
		ASSERT_EQ(std::get<1>(result1), std::get<1>(result2));
		//open is next open and close is before next open
		ASSERT_GT(std::get<0>(result2), std::get<1>(result2));
	}

	// Injector position offset
	TEST_F(Operation_EngineScheduleInjectionTests, WhenInjectionPositionOffset_ThenTimingShifted)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).Times(AtLeast(1));
		
		auto result1 = _operation->Execute(_enginePosition, true, 0.01f, 0);
		tick_t openAt1 = std::get<0>(result1);
		
		// Try with different injection position
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).Times(AtLeast(1));
		
		auto result2 = _operation->Execute(_enginePosition, true, 0.01f, 90); // 90 degree offset
		tick_t openAt2 = std::get<0>(result2);
		
		ASSERT_NE(openAt1, openAt2);
	}

	// Test 11: Not synced but injector open - schedules close
	TEST_F(Operation_EngineScheduleInjectionTests, WhenNotSyncedButOpen_ThenCloseScheduled)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).WillRepeatedly(Return());

		// First schedule open
		auto result = _operation->Execute(_enginePosition, true, 0.01f, 0);

		// Simulate open task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<0>(result)));
		_timerService.ReturnCallBackPrivateFunction();
		
		// Now lose sync
		_enginePosition.Synced = false;
		
		//schedule close
		result = _operation->Execute(_enginePosition, true, 0.01f, 0);
		
		ASSERT_EQ(std::get<0>(result), 0);
		ASSERT_GT(std::get<1>(result), 0); // Close tick is non-zero

		// Simulate close task firing
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(std::get<1>(result)));
		_timerService.ReturnCallBackPrivateFunction();
	}

	// Test 12: Very short pulse width
	TEST_F(Operation_EngineScheduleInjectionTests, WhenVeryShortPulse_ThenScheduledCorrectly)
	{
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).Times(AtLeast(1));
		
		auto result = _operation->Execute(_enginePosition, true, 0.00009f, 0); // 0.09ms = 0.45 ticks
		
		tick_t openAt = std::get<0>(result);
		tick_t closeAt = std::get<1>(result);
		ASSERT_GT(closeAt, openAt);
		ASSERT_EQ(closeAt - openAt, 1); // at least 1 tick
	}

	// TDC offset
	TEST_F(Operation_EngineScheduleInjectionTests, WhenTDCOffset_ThenTimingAdjusted)
	{
		delete _operation;
		_operation = new Operation_EngineScheduleInjection(&_timerService, 45, Operation_EngineScheduleInjection_InjectAt::Middle, _openCallBack, _closeCallBack);
		
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).Times(AtLeast(1));
		
		auto result1 = _operation->Execute(_enginePosition, true, 0.01f, 0);
		tick_t openAt1 = std::get<0>(result1);
		
		// Create another with different TDC
		delete _operation;
		_operation = new Operation_EngineScheduleInjection(&_timerService, 90, Operation_EngineScheduleInjection_InjectAt::Middle, _openCallBack, _closeCallBack);
		
		SetupSyncedPosition(1000, 0, 3600, false);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(1000));
		EXPECT_CALL(_timerService, ScheduleCallBack(_)).Times(AtLeast(1));
		
		auto result2 = _operation->Execute(_enginePosition, true, 0.01f, 0);
		tick_t openAt2 = std::get<0>(result2);
		
		ASSERT_NE(openAt1, openAt2);
	}
}
