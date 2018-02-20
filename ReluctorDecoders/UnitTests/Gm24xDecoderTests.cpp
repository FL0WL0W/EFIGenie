#include "stdafx.h"
#include "CppUnitTest.h"
#include <functional>
#include "ITimerService.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "MockTimerService.h"
#include "IDecoder.h"
#include "Gm24xDecoder.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{		
	TEST_CLASS(Gm24xDecoder)
	{
	public:

		TEST_METHOD(WhenCrankTriggerImmediatelyAfterCamTriggerCrankPositionIsCorrect)
		{
			HardwareAbstraction::MockTimerService timerService;
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(&timerService);
			EXPECT_CALL(timerService, GetTicksPerSecond())
				.Times(AtLeast(1))
				.WillRepeatedly(Return(500000));

			EXPECT_CALL(timerService, GetTick())
				.Times(10)
				.WillOnce(Return(10))
				.WillOnce(Return(2093))
				.WillOnce(Return(4176))
				.WillOnce(Return(6259))
				.WillOnce(Return(8142))
				.WillOnce(Return(8342))
				.WillOnce(Return(8342))
				.WillOnce(Return(10425))
				.WillOnce(Return(10425))
				.WillOnce(Return(11466));

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			
			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::AreEqual(0.0f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(600, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::AreEqual(15.0f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(600, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			Assert::AreEqual(22.5f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(600, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");
		}

		TEST_METHOD(WhenCrankTriggerImmediatelyBeforeCamTriggerCrankPositionIsCorrect)
		{
			HardwareAbstraction::MockTimerService timerService;
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(&timerService);
			EXPECT_CALL(timerService, GetTicksPerSecond())
				.Times(AtLeast(1))
				.WillRepeatedly(Return(1000000));

			EXPECT_CALL(timerService, GetTick())
				.Times(10)
				.WillOnce(Return(10))
				.WillOnce(Return(2093))
				.WillOnce(Return(4176))
				.WillOnce(Return(6259))
				.WillOnce(Return(8342))
				.WillOnce(Return(8442))
				.WillOnce(Return(8442))
				.WillOnce(Return(10425))
				.WillOnce(Return(10425))
				.WillOnce(Return(11466));

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);

			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::AreEqual(0.72f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(1200, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::AreEqual(15.0f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(1200, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");

			Assert::AreEqual(22.5f, decoder->GetCrankPosition(), 0.01f, (const wchar_t*)"crank position not correct");
			Assert::AreEqual(1200, (int)decoder->GetRpm(), (const wchar_t*)"rpm not correct");
		}

		TEST_METHOD(SyncedReturnsTrueWhenCamTicked)
		{
			HardwareAbstraction::MockTimerService timerService;
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(&timerService);

			Assert::IsFalse(decoder->IsSynced());

			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Down);

			Assert::IsTrue(decoder->IsSynced());

			decoder = new Decoder::Gm24xDecoder(&timerService);

			Assert::IsFalse(decoder->IsSynced());

			decoder->CamEdgeTrigger(Decoder::EdgeTrigger::Up);

			Assert::IsTrue(decoder->IsSynced());
		}

		TEST_METHOD(HasCamPositionReturnsFalseWhenCamNotTicked)
		{
			HardwareAbstraction::MockTimerService timerService;
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(&timerService);

			Assert::IsFalse(decoder->IsSynced());
			Assert::IsTrue(decoder->HasCamPosition());

			unsigned int tick = 0;

			for (int i = 0; i < 47; i++)
			{
				tick += 8;
				EXPECT_CALL(timerService, GetTick())
					.Times(1)
					.WillOnce(Return(tick));

				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
				Assert::IsTrue(decoder->HasCamPosition());
				Assert::IsFalse(decoder->IsSynced());

				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
				Assert::IsFalse(decoder->IsSynced());
				Assert::IsTrue(decoder->HasCamPosition());
			}

			tick += 4;
			EXPECT_CALL(timerService, GetTick())
				.Times(2)
				.WillOnce(Return(tick))
				.WillOnce(Return(tick + 4));

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->IsSynced());
			Assert::IsFalse(decoder->HasCamPosition());
		}

		TEST_METHOD(SyncedReturnsTrueAfterCrankVerificationWhenCamNotTicked)
		{
			HardwareAbstraction::MockTimerService timerService;
			Decoder::Gm24xDecoder *decoder = new Decoder::Gm24xDecoder(&timerService);

			Assert::IsFalse(decoder->IsSynced());
			Assert::IsTrue(decoder->HasCamPosition());

			unsigned int tick = 0;

			for (int i = 0; i < 47; i++)
			{
				tick += 8;
				EXPECT_CALL(timerService, GetTick())
					.Times(1)
					.WillOnce(Return(tick));

				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
				Assert::IsTrue(decoder->HasCamPosition());
				Assert::IsFalse(decoder->IsSynced());

				decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
				Assert::IsFalse(decoder->IsSynced());
				Assert::IsTrue(decoder->HasCamPosition());
			}

			tick += 4;
			EXPECT_CALL(timerService, GetTick())
				.Times(9)
				.WillOnce(Return(tick))
				.WillOnce(Return(tick + 6))
				.WillOnce(Return(tick + 8))
				.WillOnce(Return(tick + 14))
				.WillOnce(Return(tick + 16))
				.WillOnce(Return(tick + 22))
				.WillOnce(Return(tick + 24))
				.WillOnce(Return(tick + 30))
				.WillOnce(Return(tick + 32));

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			tick += 34;
			EXPECT_CALL(timerService, GetTick())
				.Times(11)
				.WillOnce(Return(tick))
				.WillOnce(Return(tick + 6))
				.WillOnce(Return(tick + 8))
				.WillOnce(Return(tick + 14))
				.WillOnce(Return(tick + 16))
				.WillOnce(Return(tick + 22))
				.WillOnce(Return(tick + 24))
				.WillOnce(Return(tick + 30))
				.WillOnce(Return(tick + 32))
				.WillOnce(Return(tick + 32))
				.WillOnce(Return(tick + 32));

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsFalse(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(75 + 3.75f, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(75 + 3.75f, decoder->GetCrankPosition(), 0.0001f);

			tick += 38;
			EXPECT_CALL(timerService, GetTick())
				.Times(45)
				.WillOnce(Return(tick))
				.WillOnce(Return(tick))
				.WillOnce(Return(tick))
				.WillOnce(Return(tick + 6))
				.WillOnce(Return(tick + 6))
				.WillOnce(Return(tick + 6))
				.WillOnce(Return(tick + 8))
				.WillOnce(Return(tick + 8))
				.WillOnce(Return(tick + 8))
				.WillOnce(Return(tick + 14))
				.WillOnce(Return(tick + 16))
				.WillOnce(Return(tick + 22))
				.WillOnce(Return(tick + 24))
				.WillOnce(Return(tick + 30))
				.WillOnce(Return(tick + 32))
				.WillOnce(Return(tick + 38))
				.WillOnce(Return(tick + 40))
				.WillOnce(Return(tick + 46))
				.WillOnce(Return(tick + 48))
				.WillOnce(Return(tick + 54))
				.WillOnce(Return(tick + 56))
				.WillOnce(Return(tick + 62))
				.WillOnce(Return(tick + 64))
				.WillOnce(Return(tick + 70))
				.WillOnce(Return(tick + 72))
				.WillOnce(Return(tick + 78))
				.WillOnce(Return(tick + 80))
				.WillOnce(Return(tick + 86))
				.WillOnce(Return(tick + 88))
				.WillOnce(Return(tick + 94))
				.WillOnce(Return(tick + 96))
				.WillOnce(Return(tick + 102))
				.WillOnce(Return(tick + 104))
				.WillOnce(Return(tick + 110))
				.WillOnce(Return(tick + 112))
				.WillOnce(Return(tick + 118))
				.WillOnce(Return(tick + 120))
				.WillOnce(Return(tick + 126))
				.WillOnce(Return(tick + 128))
				.WillOnce(Return(tick + 134))
				.WillOnce(Return(tick + 136))
				.WillOnce(Return(tick + 142))
				.WillOnce(Return(tick + 144))
				.WillOnce(Return(tick + 144))
				.WillOnce(Return(tick + 144));

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(90.0f, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(90.0f, decoder->GetCrankPosition(), 0.0001f);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(105 - 3.75f, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(105 - 3.75f, decoder->GetCrankPosition(), 0.0001f);

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());
			Assert::AreEqual(105, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(105, decoder->GetCrankPosition(), 0.0001f);


			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Up);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			decoder->CrankEdgeTrigger(Decoder::EdgeTrigger::Down);
			Assert::IsFalse(decoder->HasCamPosition());
			Assert::IsTrue(decoder->IsSynced());

			Assert::AreEqual(0, decoder->GetCamPosition(), 0.0001f);
			Assert::AreEqual(0, decoder->GetCrankPosition(), 0.0001f);
		}
	};
}