#include "EngineControlServices/IdleControlService/IIdleControlService.h"
#include "Service/EngineControlServiceIds.h"
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
		IIdleControlService *ret = 0;
		
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef IDLECONTROLSERVICE_PID_H
		case 1:	
			ret = new IdleControlService_Pid(
				ServiceBuilder::CastConfig < IdleControlService_PidConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), 
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(THROTTLE_POSITION_SERVICE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID), 
				serviceLocator->LocateAndCast<IFloatInputService>(VEHICLE_SPEED_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
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