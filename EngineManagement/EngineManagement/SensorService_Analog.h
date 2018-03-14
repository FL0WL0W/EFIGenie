#if defined(ISensorServiceExists)
#define SensorService_AnalogExists
namespace EngineManagement
{
	class SensorService_Analog : public ISensorService
	{
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick = 0;
		float _lastValue = 0;
		unsigned short _dotSampleRate;
	public:
		float MaxValue;
		float MinValue;
		SensorService_Analog(void *config);
		void ReadValue();
	};
}
#endif