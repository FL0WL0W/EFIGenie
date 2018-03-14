#if defined(ISensorServiceExists)
#define SensorService_FrequencyExists
namespace EngineManagement
{
	class SensorService_Frequency : public ISensorService
	{
		unsigned char _pwmPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick = 0;
		float _lastValue = 0;
		unsigned short _dotSampleRate;
	public:
		float MaxValue;
		float MinValue;
		SensorService_Frequency(void *config);
		void ReadValue();
	};
}
#endif