#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"
#include "HardwareAbstraction/ICallBack.h"
#include "EngineControlServices/FuelTrimService/FuelTrimServiceWrapper_MultiChannel.h"

using namespace HardwareAbstraction;

namespace EngineControlServices
{
	void IFuelTrimService::TickCallBack(void *fuelTrimService)
	{
		((IFuelTrimService*)fuelTrimService)->Tick();
	}
	
	void* IFuelTrimService::CreateFuelTrimService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		IFuelTrimService *ret = 0;
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
		case 1:
			{
				const FuelTrimServiceWrapper_MultiChannelConfig *fuelTrimConfig = ServiceBuilder::CastConfig < FuelTrimServiceWrapper_MultiChannelConfig >(config, sizeOut);
				
				IFuelTrimService **fuelTrimServices = (IFuelTrimService **)malloc(sizeof(IFuelTrimService *)*(fuelTrimConfig->NumberOfFuelTrimChannels));
				
				for (int i = 0; i < fuelTrimConfig->NumberOfFuelTrimChannels; i++)
					fuelTrimServices[i] = ServiceBuilder::CreateServiceAndOffset<IFuelTrimService>(IFuelTrimService::CreateFuelTrimService, serviceLocator, config, sizeOut);
			
				ret = new FuelTrimServiceWrapper_MultiChannel(fuelTrimConfig, fuelTrimServices);
				break;
			}
#endif
		}		

		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IFuelTrimService::TickCallBack,
			ret);
		
		return ret;
	}
}