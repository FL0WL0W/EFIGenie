// #include "gmock/gmock.h"
// #include "gtest/gtest.h"
// #include "EngineControlServices/CylinderAirmassService/CylinderAirmassService_SD.h"
// #include "MockTimerService.h"
// #include "MockFloatInputService.h"
// #include "MockCylinderAirTemperatureService.h"
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
// 	class CylinderAirmassService_SDTests : public ::testing::Test 
// 	{
// 		protected:
// 		ICylinderAirmassService *_cylinderAirmassService;
// 		ServiceLocator *_serviceLocator;
// 		MockFloatInputService _mapService;
// 		MockCylinderAirTemperatureService _cylinderAirTemperatureService;
// 		RpmService *_rpmService;
// 		CallBackGroup *_tickCallBackGroup;

// 		CylinderAirmassService_SDTests() 
// 		{
// 			_serviceLocator = new ServiceLocator();

// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE, &_mapService);
// 			_serviceLocator->Register(BUILDER_ICYLINDERAIRTEMPERATURESERVICE, 0, &_cylinderAirTemperatureService);
// 			_rpmService = new RpmService(0, 0);
// 			_serviceLocator->Register(RPMSERVICE, _rpmService);

// 			_tickCallBackGroup = new CallBackGroup();
// 			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);

// 			//GAS AFR TABLE, values in 1/1024	0	  2000  4000  6000
// 			unsigned short veTable[4 * 4] = {	8192, 8192, 4096, 8192,	//0
// 												8192, 8192, 4096, 8192,	//33
// 												8192, 8192, 4096, 8192,	//67
// 												8192, 8192, 4096, 8192};//100

// 			CylinderAirmassService_SDConfig *airmassConfig = reinterpret_cast<CylinderAirmassService_SDConfig *>(malloc(sizeof(CylinderAirmassService_SDConfig)));

// 			airmassConfig->Cylinders = 8;
// 			airmassConfig->Ml8thPerCylinder = 500 * 8;

// 			airmassConfig->MaxRpm = 6000;
// 			airmassConfig->MaxMap = 1;
// 			airmassConfig->VeRpmResolution = 4;
// 			airmassConfig->VeMapResolution = 4;

// 			void *config = malloc(airmassConfig->Size()+1);
// 			void *buildConfig = config;

// 			*((uint8_t *)buildConfig) = 1;
// 			buildConfig = (void *)(((uint8_t *)buildConfig) + 1);
			
// 			memcpy(buildConfig, airmassConfig, sizeof(CylinderAirmassService_SDConfig));
// 			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(CylinderAirmassService_SDConfig));
			
// 			memcpy(buildConfig, veTable, sizeof(veTable));
// 			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(veTable));
			
// 			_cylinderAirTemperatureService.CylinderAirTemperature = reinterpret_cast<float *>(calloc(sizeof(float) * airmassConfig->Cylinders, sizeof(float) * airmassConfig->Cylinders));
			
// 			unsigned int size = 0;
// 			_cylinderAirmassService = reinterpret_cast<ICylinderAirmassService *>(ICylinderAirmassService::CreateCylinderAirmassService(_serviceLocator, config, size));
// 		}

// 		~CylinderAirmassService_SDTests() override 
// 		{
// 			free(_cylinderAirmassService);
// 			free(_rpmService);
// 			free(_tickCallBackGroup);
// 			free(_serviceLocator);
// 		}
// 	};
		
// 	TEST_F(CylinderAirmassService_SDTests, WhenGettingCylinderAirmassThenCorrectCylinderAirmassIsReturned)
// 	{
// 		_rpmService->Rpm = 2000;
// 		_mapService.Value = 0.33f;
// 		_cylinderAirTemperatureService.CylinderAirTemperature[0] = 50;
// 		_cylinderAirmassService->CalculateCylinderAirmass();
// 		ASSERT_NEAR(0.18027f, _cylinderAirmassService->CylinderAirmass[0], 0.01f);
		
// 		_mapService.Value = 0.66f;
// 		_cylinderAirmassService->CalculateCylinderAirmass();
// 		ASSERT_NEAR(0.36054f, _cylinderAirmassService->CylinderAirmass[0], 0.01f);
		
// 		_rpmService->Rpm = 4000;
// 		_cylinderAirmassService->CalculateCylinderAirmass();
// 		ASSERT_NEAR(0.18027f, _cylinderAirmassService->CylinderAirmass[0], 0.01f);
// 	}
// }