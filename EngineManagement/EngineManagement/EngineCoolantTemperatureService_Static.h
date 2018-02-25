#if defined(IEngineCoolantTemperatureServiceExists)
#define EngineCoolantTemperatureService_StaticExists
namespace EngineManagement
{
	class EngineCoolantTemperatureService_Static : public IEngineCoolantTemperatureService
	{
	public:
		EngineCoolantTemperatureService_Static(float engineCoolantTemperature, float engineCoolantTemperatureDot) { EngineCoolantTemperature = engineCoolantTemperature; EngineCoolantTemperatureDot = engineCoolantTemperatureDot; }
		void ReadEct() { };
	};
}
#endif