#define MAX_CYLINDERS 8

namespace EngineManagement
{
	class PistonEngineController
	{
	protected:
		IIgnitionService *_ignitionServices[MAX_CYLINDERS];
		IInjectorService *_injectorServices[MAX_CYLINDERS];
		Decoder::IDecoder *_decoder;
		MicroRtos::MicroRtos *_microRtos;
		IPistonEngineConfig *_pistonEngineConfig;
		MicroRtos::Task *_injectorOpenTask[MAX_CYLINDERS];
		MicroRtos::Task *_injectorCloseTask[MAX_CYLINDERS];
		MicroRtos::Task *_ignitionDwellTask[MAX_CYLINDERS];
		MicroRtos::Task *_ignitionFireTask[MAX_CYLINDERS];
	public:
		PistonEngineController(MicroRtos::MicroRtos *microRtos, Decoder::IDecoder *decoder, IIgnitionService *ignitionServices[MAX_CYLINDERS], IInjectorService *injectorServices[MAX_CYLINDERS], IPistonEngineConfig *pistonEngineConfig);
		void ScheduleEvents(void);
	};
}