namespace EngineManagement
{
	class IEngineCoolantTemperatureService
	{
	public:
		virtual void ReadEct() = 0;
		float EngineCoolantTemperature;
		float EngineCoolantTemperatureDot;
		float MaxEngineCoolantTemperature;
	};
}