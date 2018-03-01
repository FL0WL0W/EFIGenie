#if defined(IPrimeServiceExists) && defined(IInjectorServiceExists)
#define PrimeService_StaticPulseWidthExists
namespace EngineManagement
{
	class PrimeService_StaticPulseWidth : public IPrimeService
	{
		unsigned int _pulseWidth;
		bool _started = false;
	public:
		PrimeService_StaticPulseWidth(void *config);
		void Prime();
		void Tick();
	};
}
#endif