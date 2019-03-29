#include "EngineControlServices/PrimeService/IPrimeService.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"
#include "EngineControlServices/PrimeService/PrimeService_StaticPulseWidth.h"

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
	
	void* IPrimeService::CreatePrimeService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		IPrimeService* ret = 0;
		
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			ret = new PrimeService_StaticPulseWidth(
				ServiceBuilder::CastConfig < PrimeService_StaticPulseWidthConfig >(config, sizeOut), 
				serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
				serviceLocator->LocateAndCast<IBooleanOutputService *>(INJECTOR_SERVICES_ID));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(POST_RELUCTOR_SYNC_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IPrimeService::PrimeCallBack,
			ret);

		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IPrimeService::TickCallBack,
			ret);
		
		return ret;
	}
}