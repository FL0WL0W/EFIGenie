namespace EngineManagement
{
	class IVoltageService
	{
	public:
		virtual void ReadVoltage() = 0;
		float Voltage;
		float VoltageDerivative;
	};
}