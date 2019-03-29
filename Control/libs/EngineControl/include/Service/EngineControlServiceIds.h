//inputs 2001-3000
#define RPM_SERVICE_ID							2001			// RpmService
#define INTAKE_AIR_TEMPERATURE_SERVICE_ID		2002			// IFloatInputService		degrees C
#define ENGINE_COOLANT_TEMPERATURE_SERVICE_ID	2003			// IFloatInputService		degrees C
#define MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID	2004			// IFloatInputService		Bar
#define VOLTAGE_SERVICE_ID						2005			// IFloatInputService		Volts
#define THROTTLE_POSITION_SERVICE_ID			2006			// IFloatInputService		TPS 0.0-1.0
#define ETHANOL_CONTENT_SERVICE_ID				2007			// IFloatInputService		Content 0.0-1.0
#define VEHICLE_SPEED_SERVICE_ID				2008			// IFloatInputService		MPH cause thats what people care about
#define CRANK_RELUCTOR_SERVICE_ID				2009			// IReluctor
#define CAM_RELUCTOR_SERVICE_ID					2010			// IReluctor

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
#define CYLINDER_AIR_TEMPERATURE_SERVICE_ID		4007			// ICylinderAirTemperatureService
#define CYLINDER_AIRMASS_SERVICE_ID		    	4008			// ICylinderAirmassService
#define INJECTOR_GRAM_SERVICE_ID				4009			// IInjectorGramService
#define INJECTOR_TIMING_SERVICE_ID				4010			// IInjectorTimingService
#define IGNITION_SCHEDULING_SERVICE_ID			4011			// IgnitionSchedulingService
#define INJECTION_SCHEDULING_SERVICE_ID			4012			// InjectionSchedulingService

//callback groups 5001-6000
#define PRE_RELUCTOR_SYNC_CALL_BACK_GROUP		5002
#define POST_RELUCTOR_SYNC_CALL_BACK_GROUP		5003