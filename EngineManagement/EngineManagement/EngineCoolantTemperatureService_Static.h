namespace EngineManagement
{
	class EngineCoolantTemperatureService_Static : public IEngineCoolantTemperatureService
	{
	public:
		EngineCoolantTemperatureService_Static(float engineCoolantTemperature, float engineCoolantTemperatureDot, float maxEngineCoolantTemperature) { EngineCoolantTemperature = engineCoolantTemperature; EngineCoolantTemperatureDot = engineCoolantTemperatureDot; MaxEngineCoolantTemperature = maxEngineCoolantTemperature; }
		void ReadEct() { };
		float EngineCoolantTemperature;
		float EngineCoolantTemperatureDot;
		float MaxEngineCoolantTemperature;
	};
}