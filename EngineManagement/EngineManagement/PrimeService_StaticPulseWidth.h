#include "IOServiceCollection.h"
#include "IPrimeService.h"

#if !defined(PRIMESERVICE_STATICPULSEWIDTH_H) && defined(IPRIMESERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)// && defined(IOServiceCollection::InjectorService)
#define PRIMESERVICE_STATICPULSEWIDTH_H
namespace ApplicationServiceLayer
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
		const IOServiceLayer::IOServiceCollection *_IOServiceCollection;
		const PrimeService_StaticPulseWidthConfig *_config;
			
		bool _started = false;
	public:
		PrimeService_StaticPulseWidth(const IOServiceLayer::IOServiceCollection *iOServiceCollection, const PrimeService_StaticPulseWidthConfig *config);
		void Prime();
		void Tick();
	};
}
#endif