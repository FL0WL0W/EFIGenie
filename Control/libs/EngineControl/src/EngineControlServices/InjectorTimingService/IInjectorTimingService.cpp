#include "EngineControlServices/InjectorTimingService/IInjectorTimingService.h"
#include "EngineControlServices/InjectorTimingService/InjectorTimingService.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
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
			{
				const InjectorTimingServiceConfig *injectorTimingServiceConfig = ServiceBuilder::CastConfigAndOffset < InjectorTimingServiceConfig >(config, sizeOut);
				ret = new InjectorTimingService(
					injectorTimingServiceConfig,  
					serviceLocator->LocateAndCast<IInjectorGramService>(BUILDER_IINJECTORGRAMSERVICE, 0),
					serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE),
					serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_VOLTAGE));
				break;
			}
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IInjectorTimingService::CalculateInjectorTimingCallBack,
			ret);
		
		return ret;
	}
}