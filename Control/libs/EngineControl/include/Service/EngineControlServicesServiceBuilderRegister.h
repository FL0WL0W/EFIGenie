#include "Service/ServiceLocator.h"
#include "Service/ServiceBuilder.h"

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

//inputs 2001-3000
#define INSTANCE_INTAKE_AIR_TEMPERATURE			0		    	// IFloatInputService		degrees C
#define INSTANCE_ENGINE_COOLANT_TEMPERATURE		1		    	// IFloatInputService		degrees C
#define INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE		2		    	// IFloatInputService		Bar
#define INSTANCE_VOLTAGE						3		    	// IFloatInputService		Volts
#define INSTANCE_THROTTLE_POSITION				4			    // IFloatInputService		TPS 0.0-1.0
#define INSTANCE_ETHANOL_CONTENT				5			    // IFloatInputService		Content 0.0-1.0
#define INSTANCE_VEHICLE_SPEED					6			    // IFloatInputService		MPH cause thats what people care about
#define INSTANCE_CRANK_RELUCTOR					0			    // IReluctor
#define INSTANCE_CAM_RELUCTOR					1			    // IReluctor

//outputs 3001-4000
#define BUILDER_IBOOLEANOUTPUTSERVICEARRAY			3002
#define INSTANCE_IGNITORS							0			// IBooleanOutputService[]
#define INSTANCE_INJECTORS							1			// IBooleanOutputService[]
#define INSTANCE_IDLE_AIR_CONTROL_VALVE				0  			// IFloatOutputService		sq mm

//application services 4001-5000
#define RPMSERVICE									4001			// RpmService
#define BUILDER_TACHOMETERSERVICE					4002			// TachometerService
#define BUILDER_IPRIMESERVICE						4003			// IPrimeService
#define BUILDER_IIDLECONTROLSERVICE					4004			// IIdleControlService
#define BUILDER_IAFRSERVICE							4005			// IAfrService
#define BUILDER_IFUELTRIMSERVICE					4006			// IFuelTrimService
#define BUILDER_IFUELPUMPSERVICE					4007			// IFuelPumpService
#define BUILDER_ICYLINDERAIRTEMPERATURESERVICE		4008			// ICylinderAirTemperatureService
#define BUILDER_ICYLINDERAIRMASSSERVICE		    	4009			// ICylinderAirmassService
#define BUILDER_IINJECTORGRAMSERVICE				4000			// IInjectorGramService
#define BUILDER_IINJECTORTIMINGSERVICE				4011			// IInjectorTimingService
#define BUILDER_IIGNITIONSCHEDULINGSERVICE			4012			// IgnitionSchedulingService
#define BUILDER_IINJECTIONSCHEDULINGSERVICE			4013			// InjectionSchedulingService

//callback groups 5001-6000
#define PRE_RELUCTOR_SYNC_CALL_BACK_GROUP		5002
#define POST_RELUCTOR_SYNC_CALL_BACK_GROUP		5003

namespace Service
{
	class EngineControlServicesServiceBuilderRegister
	{
		void Register(ServiceBuilder *&serviceBuilder);
		
	public:
		static ServiceLocator *CreateServices(ServiceLocator *serviceLocator, HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &totalSize);
		
		static void* CreateBooleanOutputArray(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void* CreateIgnitionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void* CreateInjectionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void RegisterRpmService(ServiceLocator *serviceLocator);
		static void* CreateReluctor(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
