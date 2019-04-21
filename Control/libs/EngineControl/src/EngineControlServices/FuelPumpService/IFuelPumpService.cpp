#include "EngineControlServices/FuelPumpService/IFuelPumpService.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/ServiceBuilder.h"
#include "EngineControlServices/FuelPumpService/FuelPumpService.h"
#include "EngineControlServices/FuelPumpService/FuelPumpService_Analog.h"

namespace EngineControlServices
{
	void IFuelPumpService::TickCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->Tick();
	}

	void IFuelPumpService::PrimeCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->Prime();
	}

	void IFuelPumpService::OnCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->On();
	}

	void IFuelPumpService::OffCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->Off();
	}
	
	void* IFuelPumpService::CreateFuelPumpService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		IFuelPumpService *ret = 0;
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef FUELPUMPSERVICE_H
		case 1:
			{
				const FuelPumpServiceConfig *serviceConfig = ServiceBuilder::CastConfigAndOffset < FuelPumpServiceConfig >(config, sizeOut);

				ret = new FuelPumpService(
					serviceConfig,
					serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
					ServiceBuilder::CreateServiceAndOffset<IBooleanOutputService>(IBooleanOutputService::BuildBooleanOutputService, serviceLocator, config, sizeOut));
				break;
			}
#endif
#ifdef FUELPUMPSERVICE_ANALOG_H
		case 2:			
			{
				const FuelPumpService_AnalogConfig *serviceConfig = ServiceBuilder::CastConfigAndOffset < FuelPumpService_AnalogConfig >(config, sizeOut);
			
				ret = new FuelPumpService_Analog(
					serviceConfig, 
					serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID), 
					ServiceBuilder::CreateServiceAndOffset<IFloatOutputService>(IFloatOutputService::BuildFloatOutputService, serviceLocator, config, sizeOut), 
					serviceLocator->LocateAndCast<RpmService>(RPMSERVICE),
					serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE),
					serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_THROTTLE_POSITION));
				break;
			}
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(PRE_RELUCTOR_SYNC_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IFuelPumpService::PrimeCallBack,
			ret);
		serviceLocator->LocateAndCast<CallBackGroup>(POST_RELUCTOR_SYNC_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IFuelPumpService::OnCallBack,
			ret);
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IFuelPumpService::TickCallBack,
			ret);
		
		return ret;
	}
}