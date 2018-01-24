#include "stdafx.h"
#include "CppUnitTest.h"
#include <functional>
#include "ITimerService.h"
#include "MockTimerService.h"
#include "IDecoder.h"
#include "Gm24xDecoder.h"

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{		
	TEST_CLASS(Gm24xDecoder)
	{
	public:

		TEST_METHOD(WhenCrankTriggerImmediatelyAfterCamTriggerCrankPositionIsCorrect)
		{
			HardwareAbstraction::MockTimerService *timerService = new HardwareAbstraction::MockTimerService();
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(timerService);
			timerService->TicksPerSecond = 500000;

			timerService->Tick = 10;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 2093;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 4176;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 6259;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			timerService->Tick = 8142;
			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 8342;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			Assert::AreEqual(0.0f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(600, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			timerService->Tick = 10425;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			Assert::AreEqual(15.0f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(600, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			timerService->Tick = 11466;
			Assert::AreEqual(22.5f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(600, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");
		}

		TEST_METHOD(WhenCrankTriggerImmediatelyBeforeCamTriggerCrankPositionIsCorrect)
		{
			HardwareAbstraction::MockTimerService *timerService = new HardwareAbstraction::MockTimerService();
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(timerService);
			timerService->TicksPerSecond = 1000000;

			timerService->Tick = 10;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 2093;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 4176;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 6259;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			timerService->Tick = 8342;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			timerService->Tick = 8442;
			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Down);

			Assert::AreEqual(0.72f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(1200, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			timerService->Tick = 10425;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			Assert::AreEqual(15.0f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(1200, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			timerService->Tick = 11466;
			Assert::AreEqual(22.5f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(1200, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");
		}

		TEST_METHOD(SyncedReturnsTrueWhenCamTicked)
		{
			HardwareAbstraction::MockTimerService *timerService = new HardwareAbstraction::MockTimerService();
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(timerService);

			Assert::IsFalse(decoder->IsSynced());

			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Down);

			Assert::IsTrue(decoder->IsSynced());

			decoder = new Decoder::Gm24xDecoder(timerService);

			Assert::IsFalse(decoder->IsSynced());

			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Up);

			Assert::IsTrue(decoder->IsSynced());
		}

		TEST_METHOD(HasCamPositionReturnsFalseWhenCamNotTicked)
		{
			HardwareAbstraction::MockTimerService *timerService = new HardwareAbstraction::MockTimerService();
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(timerService);

			Assert::IsFalse(decoder->IsSynced());
			Assert::IsTrue(decoder->HasCamPosition());

			for (int i = 0; i < 47; i++)
			{
				timerService->Tick += 4;
				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
				Assert::IsTrue(decoder->HasCamPosition());
				Assert::IsFalse(decoder->IsSynced());
				timerService->Tick += 4;
				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
				Assert::IsFalse(decoder->IsSynced());
				Assert::IsTrue(decoder->HasCamPosition());
			}

			timerService->Tick += 4;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 4;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->IsSynced());
			Assert::IsFalse(decoder->HasCamPosition());
		}

		TEST_METHOD(SyncedReturnsTrueAfterCrankVerificationWhenCamNotTicked)
		{
			HardwareAbstraction::MockTimerService *timerService = new HardwareAbstraction::MockTimerService();
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(timerService);

			Assert::IsFalse(decoder->IsSynced());
			Assert::IsTrue(decoder->HasCamPosition());

			for (int i = 0; i < 47; i++)
			{
				timerService->Tick += 4;
				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
				Assert::IsTrue(decoder->HasCamPosition());
				Assert::IsFalse(decoder->IsSynced());
				timerService->Tick += 4;
				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
				Assert::IsFalse(decoder->IsSynced());
				Assert::IsTrue(decoder->HasCamPosition());
			}

			//TODO finsish this when signal is known
			timerService->Tick += 4;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(75 + 3.75f, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(75 + 3.75f, decoder->GetCrankPosition(), 0.0001f);
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(90.0f, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(90.0f, decoder->GetCrankPosition(), 0.0001f);
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(105 - 3.75f, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(105 - 3.75f, decoder->GetCrankPosition(), 0.0001f);
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(105, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(105, decoder->GetCrankPosition(), 0.0001f);

			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 6;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			timerService->Tick += 2;
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			Assert::AreEqual(0, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(0, decoder->GetCrankPosition(), 0.0001f);
		}
	};
}