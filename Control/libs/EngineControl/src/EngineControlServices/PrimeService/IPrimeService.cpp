#include "EngineControlServices/PrimeService/IPrimeService.h"

namespace EngineControlServices
{
	void IPrimeService::TickCallBack(void *primeService)
	{
		((IPrimeService*)primeService)->Tick();
	}

	void IPrimeService::PrimeCallBack(void *primeService)
	{
		((IPrimeService*)primeService)->Prime();
	}
}