#if defined(ISensorServiceExists)
#define SensorService_FrequencyExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) SensorService_FrequencyConfig
	{
	private:
		SensorService_FrequencyConfig()
		{
			
		}
	public:
		static SensorService_FrequencyConfig* Cast(void *p)
		{
			return (SensorService_FrequencyConfig *)p;
		}
		unsigned char PwmPin;
		unsigned short MinFrequency;
		float A0, A1, A2, A3;
		float MinValue;
		float MaxValue;
		unsigned short DotSampleRate;
	};
	
	class SensorService_Frequency : public ISensorService
	{
		const SensorService_FrequencyConfig *_config;
		unsigned int _lastReadTick = 0;
		float _lastValue = 0;
	public:
		SensorService_Frequency(const SensorService_FrequencyConfig *config);
		void ReadValue();
	};
}
#endif