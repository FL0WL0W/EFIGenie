namespace EngineManagement
{
	class IEngineCoolantTemperatureService
	{
	public:
		virtual void ReadEct() = 0;
		float EngineCoolantTemperature = 0;
		float EngineCoolantTemperatureDot = 0;
	};
}