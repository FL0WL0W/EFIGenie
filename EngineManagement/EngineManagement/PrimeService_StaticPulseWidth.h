#if defined(IPrimeServiceExists) && defined(IInjectorServiceExists)
#define PrimeService_StaticPulseWidthExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) PrimeService_StaticPulseWidthConfig
	{
	private:
		PrimeService_StaticPulseWidthConfig()
		{
			
		}
	public:
		static PrimeService_StaticPulseWidthConfig* Cast(void *p)
		{
			return (PrimeService_StaticPulseWidthConfig *)p;
		}
		float PulseWidth;
	};
	
	class PrimeService_StaticPulseWidth : public IPrimeService
	{
		unsigned int _pulseWidth;
		bool _started = false;
	public:
		PrimeService_StaticPulseWidth(const PrimeService_StaticPulseWidthConfig *config);
		void Prime();
		void Tick();
	};
}
#endif