#if defined(ISensorServiceExists)
#define SensorService_AnalogExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) SensorService_AnalogConfig
	{
	private:
		SensorService_AnalogConfig()
		{
			
		}
	public:
		static SensorService_AnalogConfig* Cast(void *p)
		{
			return (SensorService_AnalogConfig *)p;
		}
		unsigned char AdcPin;
		float A0, A1, A2, A3;
		float MinValue;
		float MaxValue;
		unsigned short DotSampleRate;
	};
	
	class SensorService_Analog : public ISensorService
	{
		const SensorService_AnalogConfig *_config;
		
		unsigned int _lastReadTick = 0;
		float _lastValue = 0;
	public:
		SensorService_Analog(const SensorService_AnalogConfig *config);
		void ReadValue();
	};
}
#endif