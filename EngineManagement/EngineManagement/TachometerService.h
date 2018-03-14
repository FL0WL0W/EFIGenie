#define TachometerServiceExists
namespace EngineManagement
{
	class TachometerService
	{
	public:
		HardwareAbstraction::Task *TachometerTask;
		unsigned short TicksPerRpm;
		unsigned char DigitalPin;
		bool PinStatus;
		bool PinHighZ;
		TachometerService(void *config, bool highZ);
		static void TogglePinTask(void *parameters);
	};

	extern TachometerService *CurrentTachometerService;
}