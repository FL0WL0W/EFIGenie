namespace EngineManagement
{
	class IntakeAirTemperatureService_Static : public IIntakeAirTemperatureService
	{
	public:
		IntakeAirTemperatureService_Static(float intakeAirTemperature, float intakeAirTemperatureDot, float maxIntakeAirTemperature) { IntakeAirTemperature = intakeAirTemperature; IntakeAirTemperatureDot = intakeAirTemperatureDot; MaxIntakeAirTemperature = maxIntakeAirTemperature; }
		void ReadIat() { };
		float IntakeAirTemperature;
		float IntakeAirTemperatureDot;
		float MaxIntakeAirTemperature;
	};
}