#include "EngineManagementServices/IdleControlService/IIdleControlService.h"

namespace EngineManagementServices
{
	void IIdleControlService::TickCallBack(void *idleControlService)
	{
		((IIdleControlService*)idleControlService)->Tick();
	}
}