#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "ITimerService.h"
#include "MockTimerService.h"
using ::testing::Return;


using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	static int lastCallBack;

	static void testCallback1(void *parameters)
	{
		lastCallBack = 1;
	}
	static void testCallback2(void *parameters)
	{
		lastCallBack = 2;
	}

	TEST_CLASS(TimerServiceTests)
	{
	public:
		
		TEST_METHOD(WhenAddingLaterTaskFirstTaskIsCalledFirst)
		{
			HardwareAbstraction::MockTimerService timerService;
			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(0));

			HardwareAbstraction::Task *task1 = timerService.ScheduleTask(testCallback1, 0, 100, 1, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer not set to first");
			
			HardwareAbstraction::Task *task2 = timerService.ScheduleTask(testCallback2, 0, 150, 1, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer not set to first after new later task added");
			Assert::AreEqual((void *)task2, (void *)timerService.CallBackStackPointer[timerService.StackSize - 2], (const wchar_t*)"CallBackStackPointer-1 not set to second  after new later task added");

			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(100));

			timerService.ReturnCallBack();
			Assert::AreEqual(1, lastCallBack, (const wchar_t*)"first callback not called");
			Assert::AreEqual((void *)task2, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"Schedule not set to second after first task called");

			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(150));

			timerService.ReturnCallBack();
			Assert::AreEqual(2, lastCallBack, (const wchar_t*)"second callback not called");
			
			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService.ReturnCallBack();
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");

			//overflow tasks
			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(2900000000));

			task1 = timerService.ScheduleTask(testCallback1, 0, 3000000000, 1, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer not set to first");

			task2 = timerService.ScheduleTask(testCallback2, 0, 300, 1, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer not set to first after new later task added");
			Assert::AreEqual((void *)task2, (void *)timerService.CallBackStackPointer[timerService.StackSize - 2], (const wchar_t*)"CallBackStackPointer-1 not set to second  after new later task added");

			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(3000000000));
			timerService.ReturnCallBack();
			Assert::AreEqual(1, lastCallBack, (const wchar_t*)"first callback not called");
			Assert::AreEqual((void *)task2, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"Schedule tick not set to second overflow task after first task called");

			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(300));
			timerService.ReturnCallBack();
			Assert::AreEqual(2, lastCallBack, (const wchar_t*)"second callback not called");
			Assert::AreEqual((unsigned char)0, timerService.StackSize, (const wchar_t*)"Schedule tick not set to second overflow task after second task called");

			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService.ReturnCallBack();
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");
		}

		TEST_METHOD(WhenAddingLowerPriorityTaskHigherPriorityTaskIsCalledFirst)
		{
			HardwareAbstraction::MockTimerService timerService;

			HardwareAbstraction::Task *task1 = timerService.ScheduleTask(testCallback1, 0, 100, 1, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer not set to first");

			HardwareAbstraction::Task *task2 = timerService.ScheduleTask(testCallback2, 0, 100, 2, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer not set to first after new later task added");
			Assert::AreEqual((void *)task2, (void *)timerService.CallBackStackPointer[timerService.StackSize - 2], (const wchar_t*)"CallBackStackPointer-1 not set to second  after new later task added");

			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(100));
			timerService.ReturnCallBack();
			Assert::AreEqual(2, lastCallBack, (const wchar_t*)"first callback not called");

			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService.ReturnCallBack();
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");

			task1 = timerService.ScheduleTask(testCallback1, 0, 200, 2, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer not set to first");

			task2 = timerService.ScheduleTask(testCallback2, 0, 200, 1, true);
			Assert::AreEqual((void *)task1, (void *)timerService.CallBackStackPointer[timerService.StackSize - 2], (const wchar_t*)"CallBackStackPointer not set to first after new later task added");
			Assert::AreEqual((void *)task2, (void *)timerService.CallBackStackPointer[timerService.StackSize - 1], (const wchar_t*)"CallBackStackPointer-1 not set to second  after new later task added");

			EXPECT_CALL(timerService, GetTick())
				.WillRepeatedly(Return(200));
			timerService.ReturnCallBack();
			Assert::AreEqual(1, lastCallBack, (const wchar_t*)"second callback not called");
			
			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService.ReturnCallBack();
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");
		}

	};
}