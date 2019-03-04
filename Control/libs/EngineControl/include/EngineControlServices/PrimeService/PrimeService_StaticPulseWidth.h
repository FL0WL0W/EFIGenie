#include "HardwareAbstraction/ITimerService.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "Service/ServiceLocator.h"
#include "EngineControlServices/PrimeService/IPrimeService.h"
#include "Packed.h"
#include "math.h"

using namespace IOServices;
using namespace HardwareAbstraction;

#if !defined(PRIMESERVICE_STATICPULSEWIDTH_H) && defined(IPRIMESERVICE_H) && defined(ITIMERSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)
#define PRIMESERVICE_STATICPULSEWIDTH_H
namespace EngineControlServices
{
	PACK(
	struct PrimeService_StaticPulseWidthConfig
	{
	private:
		PrimeService_StaticPulseWidthConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(PrimeService_StaticPulseWidthConfig);
		}

		float PulseWidth;
	});
	
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