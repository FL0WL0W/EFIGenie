//inputs 1-100
#define DECODER_SERVICE_ID						1			// IDecoderService
#define INTAKE_AIR_TEMPERATURE_SERVICE_ID		1			// IFloatInputService		degrees C
#define ENGINE_COOLANT_TEMPERATURE_SERVICE_ID	2			// IFloatInputService		degrees C
#define MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID	3			// IFloatInputService		Bar
#define VOLTAGE_SERVICE_ID						4			// IFloatInputService		Volts
#define THROTTLE_POSITION_SERVICE_ID			5			// IFloatInputService		TPS 0.0-1.0
#define ETHANOL_CONTENT_SERVICE_ID				6			// IFloatInputService		Content 0.0-1.0
#define VEHICLE_SPEED_SERVICE_ID				7			// IFloatInputService		MPH cause thats what people care about

//outputs 101-200
#define IGNITOR_SERVICES_ID						101			// IBooleanOutputService[]
#define INJECTOR_SERVICES_ID					102			// IBooleanOutputService[]
#define IDLE_AIR_CONTROL_VALVE_ID				103			// IFloatOutputService		sq mm

//application services 201-255
#define HARDWARE_ABSTRACTION_COLLECTION_ID		201
#define TACHOMETER_SERVICE_ID					202

#define BOOLEANOUTPUTSERVICE_HIGHZ				false

#include "HardwareAbstractionCollection.h"
#include "IFloatInputService.h"
#include "IBooleanInputService.h"
#include "IFloatOutputService.h"
#include "IBooleanOutputService.h"
#include "ServiceLocator.h"
#include "TachometerService.h"

using namespace HardwareAbstraction;
using namespace IOService;
using namespace Service;
using namespace ApplicationService;

namespace Service
{
	class ServiceBuilder
	{
	public:
		static ServiceLocator *CreateServices(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize);
	};
}