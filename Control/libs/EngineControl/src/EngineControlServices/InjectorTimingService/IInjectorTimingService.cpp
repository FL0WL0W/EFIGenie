#include "EngineControlServices/InjectorTimingService/IInjectorTimingService.h"
#include "EngineControlServices/InjectorTimingService/InjectorTimingService.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
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
		sizeOut = 0;
		IInjectorTimingService *ret = 0;
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef INJECTORTIMINGSERVICE_H
		case 1:
			ret = new InjectorTimingService(
				ServiceBuilder::CastConfigAndOffset < InjectorTimingServiceConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<IInjectorGramService>(INJECTOR_GRAM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, MANIFOLD_ABSOLUTE_PRESSURE_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, VOLTAGE_INSTANCE_ID));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IInjectorTimingService::CalculateInjectorTimingCallBack,
			ret);
		
		return ret;
	}
}