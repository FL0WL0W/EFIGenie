#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "EngineControlServices/InjectorGramService/InjectorGramService.h"
#include "MockTimerService.h"
#include "MockAfrService.h"
#include "MockCylinderAirTemperatureService.h"
#include "MockCylinderAirMassService.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "Service/EngineControlServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Reluctor;
using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Service;

namespace UnitTests
{		
	class InjectorGramServiceTests : public ::testing::Test 
	{
		protected:
		IInjectorGramService *_injectorGramService;
		ServiceLocator *_serviceLocator;
		MockAfrService _afrService;
		MockCylinderAirmassService _cylinderAirmassService;
		CallBackGroup *_tickCallBackGroup;

		InjectorGramServiceTests() 
		{
			_serviceLocator = new ServiceLocator();

			_serviceLocator->Register(AFR_SERVICE_ID, &_afrService);
			_serviceLocator->Register(CYLINDER_AIRMASS_SERVICE_ID, &_cylinderAirmassService);

			_tickCallBackGroup = new CallBackGroup();
			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);

			InjectorGramServiceConfig *injectorGramConfig = reinterpret_cast<InjectorGramServiceConfig *>(malloc(sizeof(InjectorGramServiceConfig)));

			uint8_t injectorToCylinder[8] = {0, 1, 2, 3, 4, 5, 6, 7};

			injectorGramConfig->Injectors = 8;

			void *config = malloc(injectorGramConfig->Size()+1);
			void *buildConfig = config;

			*((uint8_t *)buildConfig) = 1;
			buildConfig = (void *)(((uint8_t *)buildConfig) + 1);
			
			memcpy(buildConfig, injectorGramConfig, sizeof(InjectorGramServiceConfig));
			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(InjectorGramServiceConfig));
			
			memcpy(buildConfig, injectorToCylinder, sizeof(injectorToCylinder));
			buildConfig = (void*)((unsigned char *)buildConfig + sizeof(injectorToCylinder));

			_cylinderAirmassService.CylinderAirmass = reinterpret_cast<float *>(calloc(sizeof(float) * injectorGramConfig->Injectors, sizeof(float) * injectorGramConfig->Injectors));
			
			unsigned int size = 0;
			_injectorGramService = reinterpret_cast<IInjectorGramService *>(InjectorGramService::CreateInjectorGramService(_serviceLocator, config, size));
		}

		~InjectorGramServiceTests() override 
		{
			free(_injectorGramService);
			free(_tickCallBackGroup);
			free(_serviceLocator);
		}
	};
		
	TEST_F(InjectorGramServiceTests, WhenGettingInjectorGramsThenCorrectInjectorGramsIsReturned)
	{
		_cylinderAirmassService.CylinderAirmass[0] = 1.2;
		_afrService.Afr = 14.7f;
		_injectorGramService->CalculateInjectorGrams();
		ASSERT_NEAR(0.0816326530612245f, _injectorGramService->InjectorGrams[0], 0.0001f);
	}
}