#include "EngineControlServices/IdleControlService/IIdleControlService.h"
#include "Service/EngineControlServiceIds.h"
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
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, THROTTLE_POSITION_INSTANCE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, ENGINE_COOLANT_TEMPERATURE_INSTANCE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, VEHICLE_SPEED_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INTAKE_AIR_TEMPERATURE_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, MANIFOLD_ABSOLUTE_PRESSURE_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatOutputService>(IDLE_AIR_CONTROL_VALVE_SERVICE_ID));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IIdleControlService::TickCallBack,
			ret);
		
		return ret;
	}
}