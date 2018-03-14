#include "stdafx.h"
#include "CppUnitTest.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "Services.h"
#include "AfrService_Map_Ethanol.h"
#include "MockTimerService.h"
#include "MockSensorService.h"
#include "MockDecoder.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTests
{		
	TEST_CLASS(AfrService_Map_EthanolTests)
	{
	public:
		HardwareAbstraction::MockTimerService _timerService;
		EngineManagement::MockSensorService _mapService;
		EngineManagement::MockSensorService _ectService;
		EngineManagement::MockSensorService _tpsService;
		EngineManagement::MockSensorService _ethanolService;
		Decoder::MockDecoder _decoder;

		void CreateServices()
		{
			EngineManagement::CurrentDecoder = &_decoder;
			EngineManagement::CurrentTimerService = &_timerService;
			EngineManagement::CurrentManifoldAirPressureService = &_mapService;
			EngineManagement::CurrentEngineCoolantTemperatureService = &_ectService;
			EngineManagement::CurrentThrottlePositionService = &_tpsService;
			EngineManagement::CurrentEthanolContentService = &_ethanolService;
						
			//GAS AFR TABLE, values in 1/1024	0	   2000	  4000	 6000
			unsigned short gasTable[4 * 4] = {	16076, 16076, 16076, 16076,	//0
												16076, 15052, 15052, 15052,	//33
												15052, 15052, 15052, 15052,	//67
												13245, 12041, 12041, 12041};//100
			
			//ETHANOL AFR TABLE, values in 1/1024	0	   2000	  4000	 6000	
			unsigned short ethanolTable[4 * 4] = {	11024, 11024, 11024, 11024,	//0
													11024, 10000, 10000, 10000,	//33
													10000, 10000, 10000, 10000,	//67
													9000, 8400, 8400, 8400};	//100
			
			//ECT MULTIPLIER TABLE		   -40	 13	   67	 120
			float ectMultiplierTable[4] = { 0.8, 0.85, 0.95, 1 };

			//TPS MIN AFR TABLE GAS values in 1/1024	 0		33	   67	  100
			unsigned short tpsMinAfrTableGasTable[4] = { 16076, 15052, 14148, 13245 };

			//TPS MIN AFR TABLE ETHANOL values in 1/1024	 0		33	   67	 100
			unsigned short tpsMinAfrTableEthanolTable[4] = { 11024, 10000, 9200, 9000 };

			//Stoich Table values in 1/1024
			unsigned short stoichTable[2] = { 15052, 10000 };


			void *config = malloc(148);
			void *buildConfig = config;

			//afr service id
			*((unsigned char *)buildConfig) = 1;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

			//MaxRpm
			*((unsigned short *)buildConfig) = 6000;
			buildConfig = (void*)((unsigned short *)buildConfig + 1);

			//MaxMapBar
			*((float *)buildConfig) = 1;
			buildConfig = (void*)((float *)buildConfig + 1);

			//MinEct
			*((float *)buildConfig) = -40;
			buildConfig = (void*)((float *)buildConfig + 1);

			//MaxEct
			*((float *)buildConfig) = 120;
			buildConfig = (void*)((float *)buildConfig + 1);

			//RPM resolution
			*((unsigned char *)buildConfig) = 4;
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			//MAP resolution
			*((unsigned char *)buildConfig) = 4;
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			//ECT resolution
			*((unsigned char *)buildConfig) = sizeof(ectMultiplierTable) / sizeof(float);
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			//TPS resolution
			*((unsigned char *)buildConfig) = sizeof(tpsMinAfrTableGasTable) / sizeof(unsigned short);
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			//Stoich resolution
			*((unsigned char *)buildConfig) = sizeof(stoichTable) / sizeof(unsigned short);
			buildConfig = (void*)((unsigned char *)buildConfig + 1);

			memcpy(buildConfig, stoichTable, sizeof(stoichTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(stoichTable));
			
			//GAS AFR TABLE
			memcpy(buildConfig, gasTable, sizeof(gasTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(gasTable));
				
			//ETHANOL AFR TABLE
			memcpy(buildConfig, ethanolTable, sizeof(ethanolTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(ethanolTable));

			//ECT MULTIPLIER TABLE
			memcpy(buildConfig, ectMultiplierTable, sizeof(ectMultiplierTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(ectMultiplierTable));

			//TPS MIN AFR TABLE GAS
			memcpy(buildConfig, tpsMinAfrTableGasTable, sizeof(tpsMinAfrTableGasTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(tpsMinAfrTableGasTable));

			//TPS MIN AFR TABLE ETHANOL
			memcpy(buildConfig, tpsMinAfrTableEthanolTable, sizeof(tpsMinAfrTableEthanolTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(tpsMinAfrTableEthanolTable));

			//Startup AFR multiplier
			*((float *)buildConfig) = 0.9;
			buildConfig = (void*)((float *)buildConfig + 1);

			//Startup AFR delay
			*((float *)buildConfig) = 1;
			buildConfig = (void*)((float *)buildConfig + 1);

			//Startup AFR decay
			*((float *)buildConfig) = 10;
			buildConfig = (void*)((float *)buildConfig + 1);

			EXPECT_CALL(_timerService, GetTicksPerSecond())
				.Times(1)
				.WillOnce(Return(5000));
			EngineManagement::CurrentAfrService = EngineManagement::CreateAfrService(config);
		}

		TEST_METHOD(WhenGettingAfrThenCorrectAfrIsReturned)
		{
			CreateServices();
			
			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(0));
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			_mapService.Value = 0;
			_ectService.Value = -40;
			_tpsService.Value = 0;
			_ethanolService.Value = 0;
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(11.3034375f, EngineManagement::CurrentAfrService->Afr, 0.1f);
			Assert::AreEqual(0.769f, EngineManagement::CurrentAfrService->Lambda, 0.01f);

			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(5000));
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(11.3034375f, EngineManagement::CurrentAfrService->Afr, 0.1f);
			Assert::AreEqual(0.769f, EngineManagement::CurrentAfrService->Lambda, 0.01f);

			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(27500));
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(11.93140625f, EngineManagement::CurrentAfrService->Afr, 0.1f);
			Assert::AreEqual(0.81f, EngineManagement::CurrentAfrService->Lambda, 0.01f);

			EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(50000));
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(12.559375f, EngineManagement::CurrentAfrService->Afr, 0.1f);
			Assert::AreEqual(0.855f, EngineManagement::CurrentAfrService->Lambda, 0.01f);
			EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(50001));

			_mapService.Value = 0.33;
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(2000));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(11.76f, EngineManagement::CurrentAfrService->Afr, 0.1f);
			Assert::AreEqual(0.8f, EngineManagement::CurrentAfrService->Lambda, 0.01f);

			_mapService.Value = 0.165;
			_ectService.Value = 100;
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(1000));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(15.14f, EngineManagement::CurrentAfrService->Afr, 0.1f);

			_mapService.Value = 0.165;
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(2000));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(14.9f, EngineManagement::CurrentAfrService->Afr, 0.1f);

			_mapService.Value = 0;
			_tpsService.Value = 1;
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(12.94f, EngineManagement::CurrentAfrService->Afr, 0.1f);

			_ethanolService.Value = 1;
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(8.79f, EngineManagement::CurrentAfrService->Afr, 0.1f);

			_tpsService.Value = 0;
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(10.55f, EngineManagement::CurrentAfrService->Afr, 0.1f);

			_ethanolService.Value = 0.5;
			EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
			EngineManagement::CurrentAfrService->CalculateAfr();
			Assert::AreEqual(12.97f, EngineManagement::CurrentAfrService->Afr, 0.1f);
		}

	};
}