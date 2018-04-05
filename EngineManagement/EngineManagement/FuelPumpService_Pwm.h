#if defined(IFuelPumpServiceExists)
#define FuelPumpService_PwmExists
namespace EngineManagement
{	
	struct __attribute__((__packed__)) FuelPumpService_PwmConfig
	{
	private:
		FuelPumpService_PwmConfig()
		{
		}
	public:
		static FuelPumpService_PwmConfig* Cast(void *p)
		{
			FuelPumpService_PwmConfig* ret = (FuelPumpService_PwmConfig*)p;
			
			ret->PwmTable = (unsigned char *)(ret + 1);
			
			return ret;
		}
		
		unsigned char Pin;
		bool NormalOn;
		
		unsigned char PrimePwm;
		unsigned int PrimeTime;
			
		unsigned short Frequency;
			
		bool UseTps;
		
		unsigned short MaxRpm;
		float MaxY;
		unsigned char RpmRes;
		unsigned char YRes;
		unsigned char *PwmTable;
	};
	
	class FuelPumpService_Pwm : public IFuelPumpService
	{
		const FuelPumpService_PwmConfig *_config;
		unsigned char _currentPwm;
		bool _isOn;
	public:
		bool Started = false;
		FuelPumpService_Pwm(const FuelPumpService_PwmConfig *config);
		void Prime();
		void On();
		void Off();
		void Tick();
		static void PrimeTaskOff(void *parameter);
	};
}
#endif