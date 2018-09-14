#include "EngineManagementServices/PrimeService/IPrimeService.h"

namespace EngineManagementServices
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