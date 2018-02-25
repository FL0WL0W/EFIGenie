#define IEngineCoolantTemperatureServiceExists
namespace EngineManagement
{
	class IEngineCoolantTemperatureService
	{
	public:
		virtual void ReadEct() = 0;
		float EngineCoolantTemperature = 0;
		float EngineCoolantTemperatureDot = 0;
	};

	extern IEngineCoolantTemperatureService *CurrentEngineCoolantTemperatureService;

	IEngineCoolantTemperatureService* CreateEngineCoolantTemperatureService(void *config);
}