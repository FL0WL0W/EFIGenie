namespace EngineManagement
{
	class FuelPumpService : public IFuelPumpService
	{
		unsigned char _pin;
		unsigned int _primeTime;
		bool _normalOn;
		bool _highZ;
	public:
		bool Started = false;
		FuelPumpService(void *config, bool highZ);
		void Prime();
		void On();
		void Off();
		void Tick();
		static void PrimeTaskOff(void *parameter);
	};
}