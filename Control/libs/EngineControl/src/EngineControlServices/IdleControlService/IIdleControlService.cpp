#include "EngineControlServices/IdleControlService/IIdleControlService.h"

namespace EngineControlServices
{
	void IIdleControlService::TickCallBack(void *idleControlService)
	{
		((IIdleControlService*)idleControlService)->Tick();
	}
}