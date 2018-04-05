#define TachometerServiceExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) TachometerServiceConfig
	{
	private:
		TachometerServiceConfig()
		{
			
		}
	public:
		TachometerServiceConfig* Cast(void *p)
		{
			return (TachometerServiceConfig *)p;
		}
		unsigned char DigitalPin;
		unsigned char PulsesPer2Rpm;
	};
	
	class TachometerService
	{
	protected:
		HardwareAbstraction::Task *TachometerTask;
		const TachometerServiceConfig *_config;
		unsigned short _ticksPerRpm;
		bool _pinStatus;
		bool _pinHighZ;
	public:
		TachometerService(const TachometerServiceConfig *config, bool highZ);
		static void TogglePinTask(void *parameters);
	};

	extern TachometerService *CurrentTachometerService;
}