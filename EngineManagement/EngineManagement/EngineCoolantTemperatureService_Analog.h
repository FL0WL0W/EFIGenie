#if defined(IEngineCoolantTemperatureServiceExists)
#define EngineCoolantTemperatureService_AnalogExists
namespace EngineManagement
{
	class EngineCoolantTemperatureService_Analog : public IEngineCoolantTemperatureService
	{
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick = 0;
		float _lastEct = 0;
		unsigned short _dotSampleRate;
	public:
		EngineCoolantTemperatureService_Analog(void *config);
		void ReadEct();
	};
}
#endif