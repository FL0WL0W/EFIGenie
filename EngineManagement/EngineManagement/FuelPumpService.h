#if defined(IFuelPumpServiceExists)
#define FuelPumpServiceExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) FuelPumpServiceConfig
	{
	private:
		FuelPumpServiceConfig()
		{
			
		}
	public:
		static FuelPumpServiceConfig* Cast(void *p)
		{
			return (FuelPumpServiceConfig*)p;
		}
		unsigned char Pin;
		unsigned int PrimeTime;
		bool NormalOn;
	};
	
	class FuelPumpService : public IFuelPumpService
	{
		const FuelPumpServiceConfig *_config;
		bool _highZ;
	public:
		bool Started = false;
		FuelPumpService(const FuelPumpServiceConfig *config, bool highZ);
		void Prime();
		void On();
		void Off();
		void Tick();
		static void PrimeTaskOff(void *parameter);
	};
}
#endif