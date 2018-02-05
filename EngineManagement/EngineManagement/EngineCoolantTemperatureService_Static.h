namespace EngineManagement
{
	class EngineCoolantTemperatureService_Static : public IEngineCoolantTemperatureService
	{
	public:
		EngineCoolantTemperatureService_Static(float engineCoolantTemperature, float engineCoolantTemperatureDerivative, float maxEngineCoolantTemperature) { EngineCoolantTemperature = engineCoolantTemperature; EngineCoolantTemperatureDerivative = engineCoolantTemperatureDerivative; MaxEngineCoolantTemperature = maxEngineCoolantTemperature; }
		void ReadEct() { };
		float EngineCoolantTemperature;
		float EngineCoolantTemperatureDerivative;
		float MaxEngineCoolantTemperature;
	};
}