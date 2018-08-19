#include "IPrimeService.h"

namespace ApplicationService
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