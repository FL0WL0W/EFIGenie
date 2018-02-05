namespace EngineManagement
{
	class VoltageService_Static : public IVoltageService
	{
	public:
		VoltageService_Static(float voltage, float maxVoltage, float voltageDerivative) { Voltage = voltage; MaxVoltage = maxVoltage; VoltageDerivative = voltageDerivative; }
		void ReadVoltage() { };
		float Voltage;
		float MaxVoltage;
		float VoltageDerivative;
	};
}