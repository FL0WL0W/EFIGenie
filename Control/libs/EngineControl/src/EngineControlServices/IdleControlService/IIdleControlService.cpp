#include "EngineControlServices/IdleControlService/IIdleControlService.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/ServiceBuilder.h"
#include "EngineControlServices/IdleControlService/IdleControlService_Pid.h"

namespace EngineControlServices
{
	void IIdleControlService::TickCallBack(void *idleControlService)
	{
		((IIdleControlService*)idleControlService)->Tick();
	}
	
	void* IIdleControlService::CreateIdleControlService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		IIdleControlService *ret = 0;
		
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef IDLECONTROLSERVICE_PID_H
		case 1:	
			ret = new IdleControlService_Pid(
				ServiceBuilder::CastConfigAndOffset < IdleControlService_PidConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), 
				serviceLocator->LocateAndCast<RpmService>(RPMSERVICE), 
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_THROTTLE_POSITION), 
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_ENGINE_COOLANT_TEMPERATURE), 
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_VEHICLE_SPEED),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_INTAKE_AIR_TEMPERATURE),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE),
				serviceLocator->LocateAndCast<IFloatOutputService>(BUILDER_IFLOATOUTPUTSERVICE, INSTANCE_IDLE_AIR_CONTROL_VALVE));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IIdleControlService::TickCallBack,
			ret);
		
		return ret;
	}
}