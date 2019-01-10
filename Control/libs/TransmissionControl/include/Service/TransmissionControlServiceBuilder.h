//hardware abstraction 1-1000
#define HARDWARE_ABSTRACTION_COLLECTION_ID		1
#define ANALOG_SERVICE_ID						2				// IAnalogService			voltage
#define DIGITAL_SERVICE_ID						3				// IDigitalService
#define PWM_SERVICE_ID							4				// IPwmService
#define TIMER_SERVICE_ID						5				// ITimerService

//config 1001-2000
#define IGNITION_CONFIG_ID						1001
#define INJECTION_CONFIG_ID						1002

//inputs 2001-3000
#define DECODER_SERVICE_ID						2001			// ICrankCamDecoderService
#define INTAKE_AIR_TEMPERATURE_SERVICE_ID		2002			// IFloatInputService		degrees C
#define ENGINE_COOLANT_TEMPERATURE_SERVICE_ID	2003			// IFloatInputService		degrees C
#define MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID	2004			// IFloatInputService		Bar
#define VOLTAGE_SERVICE_ID						2005			// IFloatInputService		Volts
#define THROTTLE_POSITION_SERVICE_ID			2006			// IFloatInputService		TPS 0.0-1.0
#define ETHANOL_CONTENT_SERVICE_ID				2007			// IFloatInputService		Content 0.0-1.0
#define VEHICLE_SPEED_SERVICE_ID				2008			// IFloatInputService		MPH cause thats what people care about

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
#define IGNITION_SCHEDULING_SERVICE_ID			4007			// IgnitionSchedulingService
#define INJECTION_SCHEDULING_SERVICE_ID			4008			// InjectionSchedulingService
#define SHIFT_SERVICE_ID						4009			// ShiftService
#define GEAR_CONTROL_SERVICE_ID					4010			// GearControlService

//callback groups 5001-6000
#define PRE_DECODER_SYNC_CALL_BACK_GROUP		5001
#define POST_DECODER_SYNC_CALL_BACK_GROUP		5002
#define TICK_CALL_BACK_GROUP					5003

#include "Service/ServiceLocator.h"

//hardwareabstraction includes
#include "HardwareAbstraction/HardwareAbstractionCollection.h"

//IOService Inlcudes
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "IOServices/ButtonService/IButtonService.h"
#include "IOServices/FloatOutputService/IFloatOutputService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "IOServices/StepperOutputService/IStepperOutputService.h"

//Decoder
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "CrankCamDecoders/Gm24xDecoder.h"

//TransmissionControlServices Includes
#include "TransmissionControlServices/ShiftService/ShiftService_Solenoid.h"
#include "TransmissionControlServices/GearControlService/GearControlService_ButtonShift.h"

using namespace HardwareAbstraction;
using namespace IOServices;
using namespace CrankCamDecoders;
using namespace TransmissionControlServices;

namespace Service
{
	class TransmissionControlServiceBuilder
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
			IBooleanOutputService *booleanOutputService = IBooleanOutputService::CreateBooleanOutputService((HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), *config, &size);
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
		
		static IButtonService * CreateButtonService(ServiceLocator *serviceLocator, void **config, unsigned int *totalSize)
		{
			unsigned int size;
			IButtonService *buttonService = IButtonService::CreateButtonService((HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID), *config, &size);
			CallBackGroup *tickCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
			tickCallBackGroup->Add(IButtonService::TickCallBack, buttonService);
			*config = (void *)((unsigned char *)*config + size);
			*totalSize += size;
			return buttonService;
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
		static ServiceLocator *CreateServices(ServiceLocator *serviceLocator, const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize);

		static ICrankCamDecoder *CreateDecoderService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
		static IShiftService *TransmissionControlServiceBuilder::CreateShiftService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize);
		static IGearControlService *TransmissionControlServiceBuilder::CreateGearControlService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize);
	};
}