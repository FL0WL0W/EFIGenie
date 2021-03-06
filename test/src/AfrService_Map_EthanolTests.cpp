// #include "gmock/gmock.h"
// #include "gtest/gtest.h"
// #include "EngineControlServices/AfrService/AfrService_Map_Ethanol.h"
// #include "MockTimerService.h"
// #include "MockFloatInputService.h"
// #include "EngineControlServices/RpmService/RpmService.h"
// #include "Service/EngineControlServicesServiceBuilderRegister.h"
// #include "Service/IOServicesServiceBuilderRegister.h"
// #include "Service/HardwareAbstractionServiceBuilder.h"
// using ::testing::AtLeast;
// using ::testing::Return;

// using namespace Reluctor;
// using namespace HardwareAbstraction;
// using namespace IOServices;
// using namespace Service;

// namespace UnitTests
// {		
// 	class AfrService_Map_EthanolTests : public ::testing::Test 
// 	{
// 		protected:
// 		MockTimerService _timerService;
// 		MockFloatInputService _mapService;
// 		MockFloatInputService _ectService;
// 		MockFloatInputService _tpsService;
// 		MockFloatInputService _ethanolService;
// 		ServiceLocator *_serviceLocator;
// 		EngineControlServices::IAfrService *_afrService;
// 		RpmService *_rpmService;
// 		CallBackGroup *_tickCallBackGroup;

// 		AfrService_Map_EthanolTests() 
// 		{
// 			_serviceLocator = new ServiceLocator();

// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE, &_mapService);
// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_ENGINE_COOLANT_TEMPERATURE, &_ectService);
// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_THROTTLE_POSITION, &_tpsService);
// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_ETHANOL_CONTENT, &_ethanolService);
// 			_rpmService = new RpmService(0, 0);
// 			_serviceLocator->Register(RPMSERVICE, _rpmService);
// 			_serviceLocator->Register(TIMER_SERVICE_ID, &_timerService);
// 			_tickCallBackGroup = new CallBackGroup();
// 			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);

// 			//GAS AFR TABLE, values in 1/1024	0	   2000	  4000	 6000
// 			unsigned short gasTable[4 * 4] = {	16076, 16076, 16076, 16076,	//0
// 												16076, 15052, 15052, 15052,	//33
// 												15052, 15052, 15052, 15052,	//67
// 												13245, 12041, 12041, 12041};//100
			
// 			//ETHANOL AFR TABLE, values in 1/1024	0	   2000	  4000	 6000	
// 			unsigned short ethanolTable[4 * 4] = {	11024, 11024, 11024, 11024,	//0
// 													11024, 10000, 10000, 10000,	//33
// 													10000, 10000, 10000, 10000,	//67
// 													9000, 8400, 8400, 8400};	//100
			
// 			//ECT MULTIPLIER TABLE		   -40	 13	   67	 120
// 			unsigned char ectMultiplierTable[4] = { 0.8f * 255, 0.85f * 255, 0.95f * 255, 1 * 255 };

// 			//TPS MIN AFR TABLE GAS values in 1/1024	 0		33	   67	  100
// 			unsigned short tpsMinAfrTableGasTable[4] = { 16076, 15052, 14148, 13245 };

// 			//TPS MIN AFR TABLE ETHANOL values in 1/1024	 0		33	   67	 100
// 			unsigned short tpsMinAfrTableEthanolTable[4] = { 11024, 10000, 9200, 9000 };

// 			//Stoich Table values in 1/1024
// 			unsigned short stoichTable[2] = { 15052, 10000 };

// 			AfrService_Map_EthanolConfig *afrConfig = (AfrService_Map_EthanolConfig *)malloc(sizeof(AfrService_Map_EthanolConfig));

// 			afrConfig->StartupAfrMultiplier = 0.9f;
// 			afrConfig->StartupAfrDelay = 1;
// 			afrConfig->StartupAfrDecay = 10;
// 			afrConfig->MaxRpm = 6000;
// 			afrConfig->MaxMapBar = 1;
// 			afrConfig->AfrRpmResolution = 4;
// 			afrConfig->AfrMapResolution = 4;
// 			afrConfig->MaxEct = 120;
// 			afrConfig->MinEct = -40;
// 			afrConfig->AfrEctResolution = sizeof(ectMultiplierTable) / sizeof(unsigned char);
// 			afrConfig->StoichResolution = sizeof(stoichTable) / sizeof(unsigned short);
// 			afrConfig->AfrTpsResolution = sizeof(tpsMinAfrTableGasTable) / sizeof(unsigned short);

// 			void *config = malloc(afrConfig->Size()+1);
// 			void *buildConfig = config;

// 			//afr service id
// 			*((unsigned char *)buildConfig) = 2;
// 			buildConfig = (void *)(((unsigned char *)buildConfig) + 1);

// 			memcpy(buildConfig, afrConfig, sizeof(AfrService_Map_EthanolConfig));
// 			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(AfrService_Map_EthanolConfig));

// 			//GAS AFR TABLE
// 			memcpy(buildConfig, gasTable, sizeof(gasTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(gasTable));
				
// 			//ETHANOL AFR TABLE
// 			memcpy(buildConfig, ethanolTable, sizeof(ethanolTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(ethanolTable));

// 			//ECT MULTIPLIER TABLE
// 			memcpy(buildConfig, ectMultiplierTable, sizeof(ectMultiplierTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(ectMultiplierTable));

// 			//TPS MIN AFR TABLE GAS
// 			memcpy(buildConfig, tpsMinAfrTableGasTable, sizeof(tpsMinAfrTableGasTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(tpsMinAfrTableGasTable));

// 			//TPS MIN AFR TABLE ETHANOL
// 			memcpy(buildConfig, tpsMinAfrTableEthanolTable, sizeof(tpsMinAfrTableEthanolTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(tpsMinAfrTableEthanolTable));

// 			//Stoich table
// 			memcpy(buildConfig, stoichTable, sizeof(stoichTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(stoichTable));

// 			EXPECT_CALL(_timerService, GetTicksPerSecond())
// 				.WillRepeatedly(Return(5000));
// 			unsigned int size = 0;
// 			_afrService = reinterpret_cast<IAfrService *>(IAfrService::CreateAfrService(_serviceLocator, config, size));
// 		}

// 		~AfrService_Map_EthanolTests() override 
// 		{
// 			free(_afrService);
// 			free(_rpmService);
// 			free(_tickCallBackGroup);
// 			free(_serviceLocator);
// 		}
// 	};
		
// 	TEST_F(AfrService_Map_EthanolTests, WhenGettingAfrThenCorrectAfrIsReturned)
// 	{
// 		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(0));
// 		_rpmService->Rpm = 0;
// 		_mapService.Value = 0;
// 		_ectService.Value = -40;
// 		_tpsService.Value = 0;
// 		_ethanolService.Value = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_FLOAT_EQ(11.3034375f, _afrService->Afr);
// 		ASSERT_NEAR(0.769f, _afrService->Lambda, 0.001f);

// 		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(5000));
// 		_rpmService->Rpm = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_FLOAT_EQ(11.3034375f, _afrService->Afr);
// 		ASSERT_NEAR(0.769f, _afrService->Lambda, 0.001f);

// 		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(27500));
// 		_rpmService->Rpm = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_FLOAT_EQ(11.93140625f, _afrService->Afr);
// 		ASSERT_NEAR(0.81f, _afrService->Lambda, 0.002f);

// 		EXPECT_CALL(_timerService, GetTick()).Times(1).WillOnce(Return(50000));
// 		_rpmService->Rpm = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_FLOAT_EQ(12.559375f, _afrService->Afr);
// 		ASSERT_NEAR(0.855f, _afrService->Lambda, 0.001f);
// 		EXPECT_CALL(_timerService, GetTick()).WillRepeatedly(Return(50001));

// 		_mapService.Value = 0.33;
// 		_rpmService->Rpm = 2000;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_NEAR(11.76f, _afrService->Afr, 0.01f);
// 		ASSERT_NEAR(0.8f, _afrService->Lambda, 0.001f);

// 		_mapService.Value = 0.165;
// 		_ectService.Value = 100;
// 		_rpmService->Rpm = 1000;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_NEAR(15.14f, _afrService->Afr, 0.01f);

// 		_mapService.Value = 0.165;
// 		_rpmService->Rpm = 2000;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_NEAR(14.9f, _afrService->Afr, 0.01f);

// 		_mapService.Value = 0;
// 		_tpsService.Value = 1;
// 		_rpmService->Rpm = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_NEAR(12.94f, _afrService->Afr, 0.01f);

// 		_ethanolService.Value = 1;
// 		_rpmService->Rpm = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_NEAR(8.79f, _afrService->Afr, 0.01f);

// 		_tpsService.Value = 0;
// 		_rpmService->Rpm = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_NEAR(10.55f, _afrService->Afr, 0.01f);

// 		_ethanolService.Value = 0.5;
// 		_rpmService->Rpm = 0;
// 		_tickCallBackGroup->Execute();
// 		ASSERT_NEAR(12.97f, _afrService->Afr, 0.01f);
// 	}
// }