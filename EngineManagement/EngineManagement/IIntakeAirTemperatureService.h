namespace EngineManagement
{
	class IIntakeAirTemperatureService
	{
	public:
		virtual void ReadIat() = 0;
		float IntakeAirTemperature;
		float IntakeAirTemperatureDot;
	};
}