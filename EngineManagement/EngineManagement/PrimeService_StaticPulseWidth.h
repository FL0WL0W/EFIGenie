#include "ITimerService.h"
#include "HardwareAbstractionCollection.h"
#include "IBooleanOutputService.h"
#include "ServiceLocator.h"
#include "IPrimeService.h"

using namespace IOService;
using namespace HardwareAbstraction;

#if !defined(PRIMESERVICE_STATICPULSEWIDTH_H) && defined(IPRIMESERVICE_H) && defined(ITIMERSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)
#define PRIMESERVICE_STATICPULSEWIDTH_H
namespace ApplicationService
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
		unsigned int Size()
		{
			return sizeof(PrimeService_StaticPulseWidthConfig);
		}
		float PulseWidth;
	};
	
	class PrimeService_StaticPulseWidth : public IPrimeService
	{			
		ITimerService *_timerService;
		IBooleanOutputService **_injectorServices;
		
		bool _started = false;
		
		unsigned int _pulseTick;
	public:
		PrimeService_StaticPulseWidth(const PrimeService_StaticPulseWidthConfig *config, ITimerService *timerService, IBooleanOutputService **injectorServices);
		void Prime();
		void Tick();
	};
}
#endif