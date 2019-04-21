#include "EngineControlServices/PrimeService/IPrimeService.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
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
		sizeOut = 0;
		IPrimeService* ret = 0;		
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 1:
			ret = new PrimeService_StaticPulseWidth(
				ServiceBuilder::CastConfigAndOffset < PrimeService_StaticPulseWidthConfig >(config, sizeOut), 
				serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
				serviceLocator->LocateAndCast<IBooleanOutputService *>(BUILDER_IBOOLEANOUTPUTSERVICEARRAY, INSTANCE_INJECTORS));
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