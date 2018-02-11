namespace EngineManagement
{
	class VoltageService_Static : public IVoltageService
	{
	public:
		VoltageService_Static(float voltage, float maxVoltage, float voltageDot) { Voltage = voltage; MaxVoltage = maxVoltage; VoltageDot = voltageDot; }
		void ReadVoltage() { };
		float Voltage;
		float MaxVoltage;
		float VoltageDot;
	};
}