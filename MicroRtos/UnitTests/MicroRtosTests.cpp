#include "CppUnitTest.h"
#include <stdint.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "MicroRtos.h"
#include "MockTimerService.h"

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{
	int lastCallBack;

	void testCalback1()
	{
		lastCallBack = 1;
	}
	void testCalback2()
	{
		lastCallBack = 2;
	}

	TEST_CLASS(MicroRtosTests)
	{
	public:

		TEST_METHOD(WhenAddingLaterTaskFirstTaskIsCalledFirst)
		{
			HardwareAbstraction::MockTimerService *timerService = new HardwareAbstraction::MockTimerService();
			MicroRtos::MicroRtos *microRtos = new MicroRtos::MicroRtos(timerService);

			microRtos->ScheduleTask(testCalback1, 100, 1, true);
			Assert::AreEqual((unsigned int)100, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first");

			microRtos->ScheduleTask(testCalback2, 150, 1, true);
			Assert::AreEqual((unsigned int)100, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first after new later task added");

			timerService->CallBack(100);
			Assert::AreEqual(1, lastCallBack, (const wchar_t*)"first callback not called");
			Assert::AreEqual((unsigned int)150, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to second after first task called");

			timerService->CallBack(150);
			Assert::AreEqual(2, lastCallBack, (const wchar_t*)"second callback not called");
			Assert::AreEqual((unsigned int)150, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to second after second taks called");

			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService->CallBack(150);
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");

			//overflow tasks
			microRtos->ScheduleTask(testCalback1, 3000000000, 1, true);
			Assert::AreEqual((unsigned int)3000000000, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first");

			microRtos->ScheduleTask(testCalback2, 300, 1, true);
			Assert::AreEqual((unsigned int)3000000000, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first after new later overflow task added");
			
			timerService->CallBack(3000000000);
			Assert::AreEqual(1, lastCallBack, (const wchar_t*)"first callback not called");
			Assert::AreEqual((unsigned int)300, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to second overflow task after first task called");
			
			timerService->CallBack(300);
			Assert::AreEqual(2, lastCallBack, (const wchar_t*)"second callback not called");
			Assert::AreEqual((unsigned int)300, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to second overflow task after second task called");

			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService->CallBack(300);
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");
		}

		TEST_METHOD(WhenAddingLowerPriorityTaskHigherPriorityTaskIsCalledFirst)
		{
			HardwareAbstraction::MockTimerService *timerService = new HardwareAbstraction::MockTimerService();
			MicroRtos::MicroRtos *microRtos = new MicroRtos::MicroRtos(timerService);

			microRtos->ScheduleTask(testCalback1, 100, 1, true);
			Assert::AreEqual((unsigned int)100, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first after new later task added");

			microRtos->ScheduleTask(testCalback2, 100, 2, true);
			Assert::AreEqual((unsigned int)100, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first after new later task added");

			timerService->CallBack(100);
			Assert::AreEqual(2, lastCallBack, (const wchar_t*)"first callback not called");
			Assert::AreEqual((unsigned int)100, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to second after first task called");

			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService->CallBack(100);
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");

			microRtos->ScheduleTask(testCalback1, 200, 2, true);
			Assert::AreEqual((unsigned int)200, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first");

			microRtos->ScheduleTask(testCalback2, 200, 1, true);
			Assert::AreEqual((unsigned int)200, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to first after new later overflow task added");

			timerService->CallBack(200);
			Assert::AreEqual(1, lastCallBack, (const wchar_t*)"second callback not called");
			Assert::AreEqual((unsigned int)200, timerService->CallBackTick, (const wchar_t*)"Schedule tick not set to second overflow task after second task called");
			
			//make sure another callback doesnt mess it up
			lastCallBack = 0;
			timerService->CallBack(200);
			Assert::AreEqual(0, lastCallBack, (const wchar_t*)"callback was called");
		}
	};
}