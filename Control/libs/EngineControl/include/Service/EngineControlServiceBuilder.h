#include "Service/ServiceLocator.h"

#include "EngineControlServiceIds.h"

//hardwareabstraction includes
#include "HardwareAbstraction/HardwareAbstractionCollection.h"

//IOService Inlcudes
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "IOServices/ButtonService/IButtonService.h"
#include "IOServices/FloatOutputService/IFloatOutputService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "IOServices/StepperOutputService/IStepperOutputService.h"

//Reluctor
#include "Reluctor/IReluctor.h"
#include "Reluctor/Gm24xReluctor.h"
#include "Reluctor/Universal2xReluctor.h"

//EngineControlServices Includes
#include "EngineControlServices/RpmService/RpmService.h"
#include "EngineControlServices/TachometerService/TachometerService.h"
#include "EngineControlServices/PrimeService/IPrimeService.h"
#include "EngineControlServices/IdleControlService/IIdleControlService.h"
#include "EngineControlServices/AfrService/IAfrService.h"
#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "EngineControlServices/FuelPumpService/IFuelPumpService.h"
#include "EngineControlServices/CylinderAirTemperatureService/ICylinderAirTemperatureService.h"
#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "EngineControlServices/InjectorGramService/IInjectorGramService.h"
#include "EngineControlServices/InjectorTimingService/IInjectorTimingService.h"
#include "EngineControlServices/InjectionService/InjectionSchedulingService.h"
#include "EngineControlServices/IgnitionService/IgnitionSchedulingService.h"

using namespace HardwareAbstraction;
using namespace IOServices;
using namespace EngineControlServices;
using namespace Reluctor;

namespace Service
{
	class EngineControlServiceBuilder
	{
		
	public:
		static ServiceLocator *CreateServices(ServiceLocator *serviceLocator, const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &totalSize);
		
		static void* EngineControlServiceBuilder::CreateBooleanOutputArray(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void* CreateIgnitionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void* EngineControlServiceBuilder::CreateInjectionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void RegisterRpmService(ServiceLocator *serviceLocator);
		static void* CreateReluctor(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
