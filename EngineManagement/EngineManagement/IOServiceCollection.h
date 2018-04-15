#define INTAKE_AIR_TEMPERATURE_SERVICE_ENABLED		// degrees C
#define ENGINE_COOLANT_TEMPERATURE_SERVICE_ENABLED	// degrees C
#define MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ENABLED	// Bar
#define VOLTAGE_SERVICE_ENABLED						// Volts
#define THROTTLE_POSITION_SERVICE_ENABLED			// TPS 0.0-1.0
#define ETHANOL_CONTENT_SERVICE_ENABLED				// Content 0.0-1.0
#define VEHICLE_SPEED_SERVICE_ENABLED				// MPH cause thats what people care about

#define IDLE_AIR_CONTROL_VALVE_ENABLED					// sq mm

#include "HardwareAbstractionCollection.h"
#include "IDecoder.h"
#include "IBooleanInputService.h"
#include "IBooleanOutputService.h"
#include "IFloatInputService.h"
#include "IFloatOutputService.h"

#ifndef IOSERVICELAYER_H
#define IOSERVICELAYER_H
namespace IOServiceLayer
{
	struct IOServiceCollection
	{
	public:
		const HardwareAbstraction::HardwareAbstractionCollection *HardwareAbstractionCollection;
		Decoder::IDecoder *Decoder;
		IBooleanOutputService *InjectorService[MAX_CYLINDERS];
		IBooleanOutputService *IgnitionService[MAX_CYLINDERS];

#ifdef IDLE_AIR_CONTROL_VALVE_ENABLED
		IFloatOutputService *IdleAirControlValveService;
#endif
#ifdef INTAKE_AIR_TEMPERATURE_SERVICE_ENABLED
		IFloatInputService *IntakeAirTemperatureService;// degrees C
#endif
#ifdef ENGINE_COOLANT_TEMPERATURE_SERVICE_ENABLED
		IFloatInputService *EngineCoolantTemperatureService;// degrees C
#endif
#ifdef MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ENABLED
		IFloatInputService *ManifoldAbsolutePressureService;// Bar
#endif
#ifdef VOLTAGE_SERVICE_ENABLED
		IFloatInputService *VoltageService;// Volts
#endif
#ifdef THROTTLE_POSITION_SERVICE_ENABLED
		IFloatInputService *ThrottlePositionService;// TPS 0.0-1.0
#endif
#ifdef ETHANOL_CONTENT_SERVICE_ENABLED
		IFloatInputService *EthanolContentService;// Content 0.0-1.0
#endif
#ifdef VEHICLE_SPEED_SERVICE_ENABLED
		IFloatInputService *VehicleSpeedService;// MPH cause thats what people care about
#endif

		void Tick()
		{
#ifdef INTAKE_AIR_TEMPERATURE_SERVICE_ENABLED
			if(IntakeAirTemperatureService != 0)
				IntakeAirTemperatureService->ReadValue();
#endif
#ifdef ENGINE_COOLANT_TEMPERATURE_SERVICE_ENABLED
			if (EngineCoolantTemperatureService != 0)
				EngineCoolantTemperatureService->ReadValue();
#endif
#ifdef MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ENABLED
			if (ManifoldAbsolutePressureService != 0)
				ManifoldAbsolutePressureService->ReadValue();
#endif
#ifdef VOLTAGE_SERVICE_ENABLED
			if (VoltageService != 0)
				VoltageService->ReadValue();
#endif
#ifdef THROTTLE_POSITION_SERVICE_ENABLED
			if (ThrottlePositionService != 0)
				ThrottlePositionService->ReadValue();
#endif
#ifdef ETHANOL_CONTENT_SERVICE_ENABLED
			if (EthanolContentService != 0)
				EthanolContentService->ReadValue();
#endif
#ifdef VEHICLE_SPEED_SERVICE_ENABLED
			if (VehicleSpeedService != 0)
				VehicleSpeedService->ReadValue();
#endif
		}

		static IOServiceCollection *CreateIOServiceCollection(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize)
		{
			IOServiceCollection serviceCollection;

			*totalSize = 0;
			unsigned int size;
#ifdef INTAKE_AIR_TEMPERATURE_SERVICE_ENABLED
			serviceCollection.IntakeAirTemperatureService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
			config = (void *)((unsigned char *)config + size);
			*totalSize += size;
#endif
#ifdef ENGINE_COOLANT_TEMPERATURE_SERVICE_ENABLED
			serviceCollection.EngineCoolantTemperatureService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
			config = (void *)((unsigned char *)config + size);
			*totalSize += size;
#endif
#ifdef MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ENABLED
			serviceCollection.ManifoldAbsolutePressureService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
			config = (void *)((unsigned char *)config + size);
			*totalSize += size;
#endif
#ifdef VOLTAGE_SERVICE_ENABLED
			serviceCollection.VoltageService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
			config = (void *)((unsigned char *)config + size);
			*totalSize += size;
#endif
#ifdef THROTTLE_POSITION_SERVICE_ENABLED
			serviceCollection.ThrottlePositionService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
			config = (void *)((unsigned char *)config + size);
			*totalSize += size;
#endif
#ifdef ETHANOL_CONTENT_SERVICE_ENABLED
			serviceCollection.EthanolContentService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
			config = (void *)((unsigned char *)config + size);
			*totalSize += size;
#endif
#ifdef VEHICLE_SPEED_SERVICE_ENABLED
			serviceCollection.VehicleSpeedService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
			config = (void *)((unsigned char *)config + size);
			*totalSize += size;
#endif
			
			return &serviceCollection;
		}
	};
}
#endif