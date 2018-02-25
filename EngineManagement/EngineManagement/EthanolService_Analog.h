#if defined(IEthanolServiceExists)
#define EthanolService_AnalogExists
namespace EngineManagement
{
	class EthanolService_Analog : public IEthanolService
	{
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
	public:
		EthanolService_Analog(void *config);
		void ReadEthanolContent();
	};
}
#endif