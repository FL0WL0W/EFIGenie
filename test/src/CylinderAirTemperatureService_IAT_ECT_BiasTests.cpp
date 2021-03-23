// #include "gmock/gmock.h"
// #include "gtest/gtest.h"
// #include "EngineControlServices/CylinderAirTemperatureService/CylinderAirTemperatureService_IAT_ECT_Bias.h"
// #include "MockTimerService.h"
// #include "MockFloatInputService.h"
// #include "MockCylinderAirTemperatureService.h"
// #include "MockCylinderAirMassService.h"
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
// 	class CylinderAirTemperatureService_IAT_ECT_BiasTests : public ::testing::Test 
// 	{
// 		protected:
// 		ICylinderAirTemperatureService *_cylinderAirTemperatureService;
// 		ServiceLocator *_serviceLocator;
// 		MockFloatInputService _intakeAirTemperatureService;
// 		MockFloatInputService _engineCoolantTemperatureService;
// 		MockCylinderAirmassService _cylinderAirmassService;
// 		RpmService *_rpmService;
// 		CallBackGroup *_tickCallBackGroup;

// 		CylinderAirTemperatureService_IAT_ECT_BiasTests() 
// 		{
// 			_serviceLocator = new ServiceLocator();

// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_INTAKE_AIR_TEMPERATURE, &_intakeAirTemperatureService);
// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_ENGINE_COOLANT_TEMPERATURE, &_engineCoolantTemperatureService);
// 			_serviceLocator->Register(BUILDER_ICYLINDERAIRMASSSERVICE, 0, &_cylinderAirmassService);
// 			_rpmService = new RpmService(0, 0);
// 			_serviceLocator->Register(RPMSERVICE, _rpmService);

// 			_tickCallBackGroup = new CallBackGroup();
// 			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);

// 			CylinderAirTemperatureService_IAT_ECT_BiasConfig *airTemperatureConfig = reinterpret_cast<CylinderAirTemperatureService_IAT_ECT_BiasConfig *>(malloc(sizeof(CylinderAirTemperatureService_IAT_ECT_BiasConfig)));

// 			float biasTable[16] = {0.39990234375f, 0.255859375f, 0.2216796875f, 0.2060546875f, 0.1953125f, 0.18701171875f, 0.1796875f, 0.17236328125f, 0.166015625f, 0.1591796875f, 0.15283203125f, 0.146484375f, 0.140625f, 0.134765625f, 0.12890625f, 0.123046875};

// 			airTemperatureConfig->Cylinders = 8;
// 			airTemperatureConfig->DefaultTemperatureBias = 0.5;
// 			airTemperatureConfig->MaxTemperatureBiasAirflow = 150;
// 			airTemperatureConfig->TemperatureBiasResolution = 16;

// 			void *config = malloc(airTemperatureConfig->Size()+1);
// 			void *buildConfig = config;

// 			*((uint8_t *)buildConfig) = 1;
// 			buildConfig = (void *)(((uint8_t *)buildConfig) + 1);
			
// 			memcpy(buildConfig, airTemperatureConfig, sizeof(CylinderAirTemperatureService_IAT_ECT_BiasConfig));
// 			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(CylinderAirTemperatureService_IAT_ECT_BiasConfig));
			
// 			memcpy(buildConfig, biasTable, sizeof(biasTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(biasTable));

// 			_cylinderAirmassService.CylinderAirmass = reinterpret_cast<float *>(calloc(sizeof(float) * airTemperatureConfig->Cylinders, sizeof(float) * airTemperatureConfig->Cylinders));
			
// 			unsigned int size = 0;
// 			_cylinderAirTemperatureService = reinterpret_cast<ICylinderAirTemperatureService *>(ICylinderAirTemperatureService::CreateCylinderAirTemperatureService(_serviceLocator, config, size));
// 		}

// 		~CylinderAirTemperatureService_IAT_ECT_BiasTests() override 
// 		{
// 			free(_cylinderAirTemperatureService);
// 			free(_rpmService);
// 			free(_tickCallBackGroup);
// 			free(_serviceLocator);
// 		}
// 	};
		
// 	TEST_F(CylinderAirTemperatureService_IAT_ECT_BiasTests, WhenGettingCylinderAirTemperatureThenCorrectCylinderAirTemperatureIsReturned)
// 	{
// 		_rpmService->Rpm = 2000;
// 		_intakeAirTemperatureService.Value = 20;
// 		_engineCoolantTemperatureService.Value = 100;

// 		_cylinderAirTemperatureService->CalculateCylinderAirTemperature();
// 		ASSERT_NEAR(60.0f, _cylinderAirTemperatureService->CylinderAirTemperature[0], 0.001f);

// 		_cylinderAirmassService.CylinderAirmass[0] = 0.4f;
// 		_cylinderAirTemperatureService->CalculateCylinderAirTemperature();
// 		ASSERT_NEAR(34.765625f, _cylinderAirTemperatureService->CylinderAirTemperature[0], 0.001f);
// 	}
// }