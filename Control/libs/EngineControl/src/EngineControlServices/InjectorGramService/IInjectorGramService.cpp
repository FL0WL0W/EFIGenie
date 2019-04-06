#include "EngineControlServices/InjectorGramService/IInjectorGramService.h"
#include "EngineControlServices/InjectorGramService/InjectorGramService.h"
#include "Service/EngineControlServiceIds.h"
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
				serviceLocator->LocateAndCast<ICylinderAirmassService>(CYLINDER_AIRMASS_SERVICE_ID),
				serviceLocator->LocateAndCast<IAfrService>(AFR_SERVICE_ID),
				serviceLocator->LocateAndCast<IFuelTrimService>(FUEL_TRIM_SERVICE_ID));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IInjectorGramService::CalculateInjectorGramsCallBack,
			ret);
		
		return ret;
	}
}