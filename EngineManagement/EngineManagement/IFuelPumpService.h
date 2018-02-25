#define IFuelPumpServiceExists
namespace EngineManagement
{
	class IFuelPumpService
	{
	public:
		virtual void Prime() = 0;
		virtual void On() = 0;
		virtual void Off() = 0;
		virtual void Tick() = 0;
	};

	extern IFuelPumpService *CurrentFuelPumpService;

	IFuelPumpService* CreateFuelPumpService(void *config, bool fuelPumpHighZ);
}