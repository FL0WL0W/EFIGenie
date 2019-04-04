#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "EngineControlServices/InjectorGramService/InjectorGramServiceWrapper_DFCO.h"
#include "MockTimerService.h"
#include "MockAfrService.h"
#include "MockInjectorGramService.h"
#include "MockFloatInputService.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "Service/EngineControlServiceBuilder.h"
using ::testing::AtLeast;
using ::testing::Return;

using namespace Reluctor;
using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Service;

namespace UnitTests
{		
	class InjectorGramServiceWrapper_DFCOTests : public ::testing::Test 
	{
		protected:
		IInjectorGramService *_injectorGramService;
		MockFloatInputService _tpsService;
		RpmService *_rpmService;
		
		MockInjectorGramService _child;

		InjectorGramServiceWrapper_DFCOTests() 
		{
			_rpmService = new RpmService(0, 0);

			InjectorGramServiceWrapper_DFCOConfig *config = new InjectorGramServiceWrapper_DFCOConfig();

			config->TpsThreshold = 0.1;
			config->RpmEnable = 1200;
			config->RpmDisable = 1300;
			
			_child.InjectorGrams = reinterpret_cast<float *>(calloc(sizeof(float) * 8, sizeof(float) * 8));

			_injectorGramService = new InjectorGramServiceWrapper_DFCO(config, &_tpsService, _rpmService, &_child);
		}

		~InjectorGramServiceWrapper_DFCOTests() override 
		{
			free(_rpmService);
			free(_injectorGramService);
		}
	};
		
	TEST_F(InjectorGramServiceWrapper_DFCOTests, WhenGettingInjectorGramsThenCorrectInjectorGramsIsReturned)
	{
		_rpmService->Rpm = 1000;
		_tpsService.Value = 0.2f;
		_child.InjectorGrams[0] = 10;
		_injectorGramService->CalculateInjectorGrams();
		ASSERT_NEAR(10, _injectorGramService->InjectorGrams[0], 0.0001f);
		
		_rpmService->Rpm = 2000;
		_injectorGramService->CalculateInjectorGrams();
		ASSERT_NEAR(10, _injectorGramService->InjectorGrams[0], 0.0001f);
		
		_rpmService->Rpm = 2000;
		_tpsService.Value = 0.05f;
		_injectorGramService->CalculateInjectorGrams();
		ASSERT_EQ(0, _injectorGramService->InjectorGrams);
		
		_rpmService->Rpm = 1350;
		_injectorGramService->CalculateInjectorGrams();
		ASSERT_EQ(0, _injectorGramService->InjectorGrams);

		_rpmService->Rpm = 1250;
		_injectorGramService->CalculateInjectorGrams();
		ASSERT_NEAR(10, _injectorGramService->InjectorGrams[0], 0.0001f);
	}
}