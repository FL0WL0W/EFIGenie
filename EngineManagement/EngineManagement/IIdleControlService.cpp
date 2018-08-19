#include "IIdleControlService.h"

namespace ApplicationService
{
	void IIdleControlService::TickCallBack(void *idleControlService)
	{
		((IIdleControlService*)idleControlService)->Tick();
	}
}