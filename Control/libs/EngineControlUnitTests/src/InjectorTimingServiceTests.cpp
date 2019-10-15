// #include "gmock/gmock.h"
// #include "gtest/gtest.h"
// #include "EngineControlServices/InjectorTimingService/InjectorTimingService.h"
// #include "MockTimerService.h"
// #include "MockFloatInputService.h"
// #include "MockInjectorGramService.h"
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
// 	class InjectorTimingServiceTests : public ::testing::Test 
// 	{
// 		protected:
// 		IInjectorTimingService *_injectorTimingService;
// 		ServiceLocator *_serviceLocator;
// 		MockInjectorGramService _injectorGramService;
// 		MockFloatInputService _mapService;
// 		MockFloatInputService _voltageService;
// 		CallBackGroup *_tickCallBackGroup;

// 		InjectorTimingServiceTests() 
// 		{
// 			_serviceLocator = new ServiceLocator();

// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE, &_mapService);
// 			_serviceLocator->Register(BUILDER_IFLOATINPUTSERVICE, INSTANCE_VOLTAGE, &_voltageService);
// 			_serviceLocator->Register(BUILDER_IINJECTORGRAMSERVICE, 0, &_injectorGramService);

// 			_tickCallBackGroup = new CallBackGroup();
// 			_serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)_tickCallBackGroup);

// 			uint16_t injectorGramsPerMinute[8] = { 800, 800, 800, 800, 800, 800, 800, 800 }; 

// 			int16_t shortPulseAdder[29] = {0, 1800, 1700, 1500, 1400, 1200, 1100, 900, 800, 800, 600, 500, 500, 500, 500, 500, 300, 200, 200, 200, 200, 200, 300, 300, 300, 200, 200, 200, 0};

// 			int16_t offset[9 * 9] = {	1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 
// 										1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000 };	

// 			InjectorTimingServiceConfig *injectorTimingConfig = reinterpret_cast<InjectorTimingServiceConfig *>(malloc(sizeof(InjectorTimingServiceConfig)));

// 			injectorTimingConfig->Injectors = 8;
// 			injectorTimingConfig->VoltageMax = 16;
// 			injectorTimingConfig->VoltageMin = 8;
// 			injectorTimingConfig->MapResolution = 9;
// 			injectorTimingConfig->MapMax = 1;
// 			injectorTimingConfig->VoltageResolution = 9;
// 			injectorTimingConfig->ShortPulseAdderResolution = 29;
// 			injectorTimingConfig->ShortPulseLimit = 0.0017f;
// 			injectorTimingConfig->InjectorOpenPosition = 500;

// 			void *config = malloc(injectorTimingConfig->Size()+1);
// 			void *buildConfig = config;

// 			*((uint8_t *)buildConfig) = 1;
// 			buildConfig = (void *)(((uint8_t *)buildConfig) + 1);
			
// 			memcpy(buildConfig, injectorTimingConfig, sizeof(InjectorTimingServiceConfig));
// 			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(InjectorTimingServiceConfig));

// 			memcpy(buildConfig, injectorGramsPerMinute, sizeof(injectorGramsPerMinute));
// 			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(injectorGramsPerMinute));

// 			memcpy(buildConfig, shortPulseAdder, sizeof(shortPulseAdder));
// 			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(shortPulseAdder));

// 			memcpy(buildConfig, offset, sizeof(offset));
// 			buildConfig = (void *)((unsigned char *)buildConfig + sizeof(offset));
			
// 			_injectorGramService.InjectorGrams = reinterpret_cast<float *>(calloc(sizeof(float) * injectorTimingConfig->Injectors, sizeof(float) * injectorTimingConfig->Injectors));
			
// 			unsigned int size = 0;
// 			_injectorTimingService = reinterpret_cast<IInjectorTimingService *>(IInjectorTimingService::CreateInjectorTimingService(_serviceLocator, config, size));
// 		}

// 		~InjectorTimingServiceTests() override 
// 		{
// 			free(_injectorTimingService);
// 			free(_tickCallBackGroup);
// 			free(_serviceLocator);
// 		}
// 	};
		
// 	TEST_F(InjectorTimingServiceTests, WhenGettingInjectorTimingThenCorrectInjectorTimingIsReturned)
// 	{
// 		_injectorGramService.InjectorGrams[0] = 0.08;
// 		_injectorTimingService->CalculateInjectorTiming();
// 		ASSERT_NEAR(0.007f, _injectorTimingService->InjectorTiming[0].PulseWidth, 0.0001f);
// 		ASSERT_EQ(500, _injectorTimingService->InjectorTiming[0].OpenPosition);
// 	}
// }