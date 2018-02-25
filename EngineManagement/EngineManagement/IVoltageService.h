#define IVoltageServiceExists
namespace EngineManagement
{
	class IVoltageService
	{
	public:
		virtual void ReadVoltage() = 0;
		float Voltage = 0;
		float VoltageDot = 0;
	};

	extern IVoltageService *CurrentVoltageService;

	IVoltageService* CreateVoltageService(void *config);
}