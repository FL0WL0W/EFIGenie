namespace EngineManagement
{
	class PrimeService_StaticPulseWidth : public IPrimeService
	{
		unsigned int _pulseWidth;
		bool _started;
	public:
		PrimeService_StaticPulseWidth(void *config);
		void PrimeTick();
	};
}