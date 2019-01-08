#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "EngineControlServices/AfrService/AfrService_Map_Ethanol.h"
#include "MockTimerService.h"
#include "MockFloatInputService.h"
#include "MockCrankCamDecoder.h"
#include "Service/EngineControlServiceBuilder.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace CrankCamDecoders;
using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Service;

namespace UnitTests
{		
	class AfrService_Map_EthanolTests : public ::testing::Test 
	{
		protected:
		MockTimerService _timerService;
		MockFloatInputService _mapService;
		MockFloatInputService _ectService;
		MockFloatInputService _tpsService;
		MockFloatInputService _ethanolService;
		ServiceLocator *_serviceLocator;
		EngineControlServices::IAfrService *_afrService;
		MockCrankCamDecoder _decoder;
		CallBackGroup *_tickCallBackGroup;

		AfrService_Map_EthanolTests() 
		{
			_serviceLocator = new ServiceLocator();

			_serviceLocator->Register(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID, &_mapService);
			_serviceLocator->Register(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID, &_ectService);
			_serviceLocator->Register(THROTTLE_POSITION_SERVICE_ID, &_tpsService);
			_serviceLocator->Register(ETHANOL_CONTENT_SERVICE_ID, &_ethanolService);
			_serviceLocator->Register(DECODER_SERVICE_ID, &_decoder);
			_serviceLocator->Register(TIMER_SERVICE_ID, &_timerService);
			_tickCallBackGroup = new CallBackGroup();
			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);

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
			unsigned char ectMultiplierTable[4] = { 0.8 * 255, 0.85 * 255, 0.95 * 255, 1 * 255 };

			//TPS MIN AFR TABLE GAS values in 1/1024	 0		33	   67	  100
			unsigned short tpsMinAfrTableGasTable[4] = { 16076, 15052, 14148, 13245 };

			//TPS MIN AFR TABLE ETHANOL values in 1/1024	 0		33	   67	 100
			unsigned short tpsMinAfrTableEthanolTable[4] = { 11024, 10000, 9200, 9000 };

			//Stoich Table values in 1/1024
			unsigned short stoichTable[2] = { 15052, 10000 };

			AfrService_Map_EthanolConfig *afrConfig = (AfrService_Map_EthanolConfig *)malloc(sizeof(AfrService_Map_EthanolConfig));

			afrConfig->StartupAfrMultiplier = 0.9;
			afrConfig->StartupAfrDelay = 1;
			afrConfig->StartupAfrDecay = 10;
			afrConfig->MaxRpm = 6000;
			afrConfig->MaxMapBar = 1;
			afrConfig->AfrRpmResolution = 4;
			afrConfig->AfrMapResolution = 4;
			afrConfig->MaxEct = 120;
			afrConfig->MinEct = -40;
			afrConfig->AfrEctResolution = sizeof(ectMultiplierTable) / sizeof(unsigned char);
			afrConfig->StoichResolution = sizeof(stoichTable) / sizeof(unsigned short);
			afrConfig->AfrTpsResolution = sizeof(tpsMinAfrTableGasTable) / sizeof(unsigned short);

			void *config = malloc(afrConfig->Size()+1);
			void *buildConfig = config;

			//afr service id
			*((unsigned char *)buildConfig) = 2;
			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

			memcpy(buildConfig, afrConfig, sizeof(AfrService_Map_EthanolConfig));
			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(AfrService_Map_EthanolConfig));

			//GAS AFR TABLE
			memcpy(buildConfig, gasTable, sizeof(gasTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(gasTable));
				
			//ETHANOL AFR TABLE
			memcpy(buildConfig, ethanolTable, sizeof(ethanolTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(ethanolTable));

			//ECT MULTIPLIER TABLE
			memcpy(buildConfig, ectMultiplierTable, sizeof(ectMultiplierTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(ectMultiplierTable));

			//Stoich table
			memcpy(buildConfig, stoichTable, sizeof(stoichTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(stoichTable));

			//TPS MIN AFR TABLE GAS
			memcpy(buildConfig, tpsMinAfrTableGasTable, sizeof(tpsMinAfrTableGasTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(tpsMinAfrTableGasTable));

			//TPS MIN AFR TABLE ETHANOL
			memcpy(buildConfig, tpsMinAfrTableEthanolTable, sizeof(tpsMinAfrTableEthanolTable));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(tpsMinAfrTableEthanolTable));

			EXPECT_CALL(_timerService, GetTicksPerSecond())
				.WillRepeatedly(Return(5000));
			unsigned int size = 0;
			_afrService = EngineControlServiceBuilder::CreateAfrService(_serviceLocator, config, &size);
		}

		~AfrService_Map_EthanolTests() override 
		{
			free(_afrService);
			free(_serviceLocator);
		}
	};
		
	TEST_F(AfrService_Map_EthanolTests, WhenGettingAfrThenCorrectAfrIsReturned)
	{
		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(0));
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_mapService.Value = 0;
		_ectService.Value = -40;
		_tpsService.Value = 0;
		_ethanolService.Value = 0;
		_tickCallBackGroup->Execute();
		ASSERT_FLOAT_EQ(11.3034375f, _afrService->Afr);
		ASSERT_NEAR(0.769f, _afrService->Lambda, 0.001f);

		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(5000));
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_tickCallBackGroup->Execute();
		ASSERT_FLOAT_EQ(11.3034375f, _afrService->Afr);
		ASSERT_NEAR(0.769f, _afrService->Lambda, 0.001f);

		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(27500));
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_tickCallBackGroup->Execute();
		ASSERT_FLOAT_EQ(11.93140625f, _afrService->Afr);
		ASSERT_NEAR(0.81f, _afrService->Lambda, 0.002f);

		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(50000));
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_tickCallBackGroup->Execute();
		ASSERT_FLOAT_EQ(12.559375f, _afrService->Afr);
		ASSERT_NEAR(0.855f, _afrService->Lambda, 0.001f);
		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(50001));

		_mapService.Value = 0.33;
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(2000));
		_tickCallBackGroup->Execute();
		ASSERT_NEAR(11.76f, _afrService->Afr, 0.01f);
		ASSERT_NEAR(0.8f, _afrService->Lambda, 0.001f);

		_mapService.Value = 0.165;
		_ectService.Value = 100;
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(1000));
		_tickCallBackGroup->Execute();
		ASSERT_NEAR(15.14f, _afrService->Afr, 0.01f);

		_mapService.Value = 0.165;
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(2000));
		_tickCallBackGroup->Execute();
		ASSERT_NEAR(14.9f, _afrService->Afr, 0.01f);

		_mapService.Value = 0;
		_tpsService.Value = 1;
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_tickCallBackGroup->Execute();
		ASSERT_NEAR(12.94f, _afrService->Afr, 0.01f);

		_ethanolService.Value = 1;
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_tickCallBackGroup->Execute();
		ASSERT_NEAR(8.79f, _afrService->Afr, 0.01f);

		_tpsService.Value = 0;
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_tickCallBackGroup->Execute();
		ASSERT_NEAR(10.55f, _afrService->Afr, 0.01f);

		_ethanolService.Value = 0.5;
		EXPECT_CALL(_decoder, GetRpm()).Times(1).WillOnce(Return(0));
		_tickCallBackGroup->Execute();
		ASSERT_NEAR(12.97f, _afrService->Afr, 0.01f);
	}
}