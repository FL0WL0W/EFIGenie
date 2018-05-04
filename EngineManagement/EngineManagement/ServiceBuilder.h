//hardware abstraction 1-1000
#define HARDWARE_ABSTRACTION_COLLECTION_ID		1
#define ANALOG_SERVICE_ID						2				// IAnalogService			voltage
#define DIGITAL_SERVICE_ID						3				// IDigitalService
#define PWM_SERVICE_ID							4				// IPwmService
#define TIMER_SERVICE_ID						5				// ITimerService

//config 1001-2000

//inputs 2001-3000
#define DECODER_SERVICE_ID						2001			// IDecoderService
#define INTAKE_AIR_TEMPERATURE_SERVICE_ID		2001			// IFloatInputService		degrees C
#define ENGINE_COOLANT_TEMPERATURE_SERVICE_ID	2002			// IFloatInputService		degrees C
#define MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID	2003			// IFloatInputService		Bar
#define VOLTAGE_SERVICE_ID						2004			// IFloatInputService		Volts
#define THROTTLE_POSITION_SERVICE_ID			2005			// IFloatInputService		TPS 0.0-1.0
#define ETHANOL_CONTENT_SERVICE_ID				2006			// IFloatInputService		Content 0.0-1.0
#define VEHICLE_SPEED_SERVICE_ID				2007			// IFloatInputService		MPH cause thats what people care about

//outputs 3001-4000
#define IGNITOR_SERVICES_ID						3001			// IBooleanOutputService[]
#define INJECTOR_SERVICES_ID					3002			// IBooleanOutputService[]
#define IDLE_AIR_CONTROL_VALVE_SERVICE_ID		3003			// IFloatOutputService		sq mm

//application services 4001-5000
#define TACHOMETER_SERVICE_ID					4001			// TachometerService
#define PRIME_SERVICE_ID						4002			// IPrimeService
#define IDLE_CONTROL_SERVICE_ID					4003			// IIdleControlService
#define AFR_SERVICE_ID							4004			// IAfrService
#define FUEL_TRIM_SERVICE_ID					4005			// IFuelTrimService
#define FUEL_PUMP_SERVICE_ID					4006			// IFuelPumpService
#define PISTON_ENGINE_SERVICE_ID				4007			// IFuelPumpService

#define BOOLEAN_OUTPUT_SERVICE_HIGHZ			false

#include "ServiceLocator.h"

//hardwareabstraction includes
#include "HardwareAbstractionCollection.h"

//IOService Inlcudes
#include "IFloatInputService.h"
#include "IBooleanInputService.h"
#include "IFloatOutputService.h"
#include "IBooleanOutputService.h"
#include "IStepperOutputService.h"

//ApplicationService Includes
#include "TachometerService.h"
#include "IPrimeService.h"
#include "PrimeService_StaticPulseWidth.h"
#include "IIdleControlService.h"
#include "IdleControlService_Pid.h"
#include "IAfrService.h"
#include "AfrService_Static.h"
#include "AfrService_Map_Ethanol.h"
#include "IFuelTrimService.h"
#include "FuelTrimService_InterpolatedTable.h"
#include "FuelTrimServiceWrapper_MultiChannel.h"
#include "IFuelPumpService.h"
#include "FuelPumpService.h"
#include "FuelPumpService_Analog.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineInjectionConfigWrapper_DFCO.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "PistonEngineIgnitionConfigWrapper_HardRpmLimit.h"
#include "PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit.h"
#include "PistonEngineService.h"

using namespace HardwareAbstraction;
using namespace IOService;
using namespace Service;
using namespace ApplicationService;
using namespace EngineManagement;

namespace Service
{
	class ServiceBuilder
	{
		template<typename T>
		static T* CastConfig(void **config, unsigned int *size)
		{
			T *castedConfig = T::Cast(*config);
			unsigned int confSize = castedConfig->Size();
			*size += confSize;
			*config = (void *)((unsigned char *)*config + confSize);
			
			return castedConfig;
		}
		
		static IBooleanOutputService * CreateBooleanOutputService(ServiceLocator *serviceLocator, void **config, unsigned int *totalSize)
		{
			unsigned int size;
			IBooleanOutputService *booleanOutputService = IBooleanOutputService::CreateBooleanOutputService((HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), *config, &size, BOOLEAN_OUTPUT_SERVICE_HIGHZ);
			*config = (void *)((unsigned char *)*config + size);
			*totalSize += size;
			return booleanOutputService;
		}
		
		static IBooleanInputService * CreateBooleanInputService(ServiceLocator *serviceLocator, void **config, unsigned int *totalSize)
		{
			unsigned int size;
			IBooleanInputService *booleanInputService = IBooleanInputService::CreateBooleanInputService((HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), *config, &size);
			*config = (void *)((unsigned char *)*config + size);
			*totalSize += size;
			return booleanInputService;
		}
		
		static IFloatOutputService * CreateFloatOutputService(ServiceLocator *serviceLocator, void **config, unsigned int *totalSize)
		{
			unsigned int size;
			IFloatOutputService *floatOutputService = IFloatOutputService::CreateFloatOutputService((HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), *config, &size);
			*config = (void *)((unsigned char *)*config + size);
			*totalSize += size;
			return floatOutputService;
		}
		
		static IFloatInputService * CreateFloatInputService(ServiceLocator *serviceLocator, void **config, unsigned int *totalSize)
		{
			unsigned int size;
			IFloatInputService *floatInputService = IFloatInputService::CreateFloatInputService((HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), *config, &size);
			*config = (void *)((unsigned char *)*config + size);
			*totalSize += size;
			return floatInputService;
		}
		
		static unsigned char GetServiceId(void **config, unsigned int *size)
		{
			unsigned char serviceId = *((unsigned char*)*config);
			*config = (void *)((unsigned char*)*config + 1);
			*size = 1;
			return serviceId;
		}
		
	public:
		static ServiceLocator *CreateServices(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize);
		
		static TachometerService *CreateTachometerService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
		static IPrimeService* CreatePrimeService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
		static IIdleControlService* CreateIdleControlService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
		static IAfrService *CreateAfrService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
		static IFuelTrimService *CreateFuelTrimService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
		static IFuelPumpService *CreateFuelPumpService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
		static IPistonEngineInjectionConfig *CreatePistonEngineInjetionConfig(ServiceLocator *serviceLocator, PistonEngineConfig *pistonEngineConfig, void *config, unsigned int *size);
		static IPistonEngineIgnitionConfig *CreatePistonEngineIgnitionConfig(ServiceLocator *serviceLocator, PistonEngineConfig *pistonEngineConfig, void *config, unsigned int *size);
		static PistonEngineService *CreatePistonEngineService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
	};
}