#include "EngineControlServices/InjectorTimingService/IInjectorTimingService.h"
#include "EngineControlServices/InjectorTimingService/InjectorTimingService.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"
#include "HardwareAbstraction/ICallBack.h"

namespace EngineControlServices
{
	void IInjectorTimingService::CalculateInjectorTimingCallBack(void *injectorTimingService)
	{
		((IInjectorTimingService*)injectorTimingService)->CalculateInjectorTiming();
	}
	
	void* IInjectorTimingService::CreateInjectorTimingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		IInjectorTimingService *ret = 0;
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef INJECTORTIMINGSERVICE_H
		case 1:
			ret = new InjectorTimingService(
				ServiceBuilder::CastConfig < InjectorTimingServiceConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<IInjectorGramService>(INJECTOR_GRAM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(VOLTAGE_SERVICE_ID));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IInjectorTimingService::CalculateInjectorTimingCallBack,
			ret);
		
		return ret;
	}
}