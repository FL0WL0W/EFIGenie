#include "EngineControlServices/InjectorGramService/IInjectorGramService.h"
#include "EngineControlServices/InjectorGramService/InjectorGramService.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/ServiceBuilder.h"
#include "HardwareAbstraction/ICallBack.h"

using namespace HardwareAbstraction;

namespace EngineControlServices
{
	void IInjectorGramService::CalculateInjectorGramsCallBack(void *injectorGramService)
	{
		((IInjectorGramService*)injectorGramService)->CalculateInjectorGrams();
	}
	
	void* IInjectorGramService::CreateInjectorGramService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		IInjectorGramService *ret = 0;
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef INJECTORGRAMSERVICE_H
		case 1:
			ret = new InjectorGramService(
				ServiceBuilder::CastConfigAndOffset < InjectorGramServiceConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<ICylinderAirmassService>(BUILDER_ICYLINDERAIRMASSSERVICE, 0),
				serviceLocator->LocateAndCast<IAfrService>(BUILDER_IAFRSERVICE, 0),
				serviceLocator->LocateAndCast<IFuelTrimService>(BUILDER_IFUELTRIMSERVICE, 0));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IInjectorGramService::CalculateInjectorGramsCallBack,
			ret);
		
		return ret;
	}
}