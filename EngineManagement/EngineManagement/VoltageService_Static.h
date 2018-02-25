#if defined(IVoltageServiceExists)
#define VoltageService_StaticExists
namespace EngineManagement
{
	class VoltageService_Static : public IVoltageService
	{
	public:
		VoltageService_Static(float voltage, float voltageDot) { Voltage = voltage; VoltageDot = voltageDot; }
		void ReadVoltage() { };
	};
}
#endif