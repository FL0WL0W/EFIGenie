#if defined(IIntakeAirTemperatureServiceExists)
#define IntakeAirTemperatureService_StaticExists
namespace EngineManagement
{
	class IntakeAirTemperatureService_Static : public IIntakeAirTemperatureService
	{
	public:
		IntakeAirTemperatureService_Static(float intakeAirTemperature, float intakeAirTemperatureDot) { IntakeAirTemperature = intakeAirTemperature; IntakeAirTemperatureDot = intakeAirTemperatureDot; }
		void ReadIat() { };
	};
}
#endif