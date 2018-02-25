#define IIntakeAirTemperatureServiceExists
namespace EngineManagement
{
	class IIntakeAirTemperatureService
	{
	public:
		virtual void ReadIat() = 0;
		float IntakeAirTemperature = 0;
		float IntakeAirTemperatureDot = 0;
	};

	extern IIntakeAirTemperatureService *CurrentIntakeAirTemperatureService;

	IIntakeAirTemperatureService* CreateIntakeAirTemperatureService(void *config);
}