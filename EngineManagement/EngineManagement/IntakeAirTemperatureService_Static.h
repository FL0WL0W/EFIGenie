namespace EngineManagement
{
	class IntakeAirTemperatureService_Static : public IIntakeAirTemperatureService
	{
	public:
		IntakeAirTemperatureService_Static(float intakeAirTemperature, float intakeAirTemperatureDerivative, float maxIntakeAirTemperature) { IntakeAirTemperature = intakeAirTemperature; IntakeAirTemperatureDerivative = intakeAirTemperatureDerivative; MaxIntakeAirTemperature = maxIntakeAirTemperature; }
		void ReadIat() { };
		float IntakeAirTemperature;
		float IntakeAirTemperatureDerivative;
		float MaxIntakeAirTemperature;
	};
}