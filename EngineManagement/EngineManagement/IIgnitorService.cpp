#ifndef NOIGNITION
#include "IIgnitorService.h"

namespace EngineManagement
{
	void IIgnitorService::CoilDwellTask(void *parameters)
	{
		((IIgnitorService *)parameters)->CoilDwell();
	}
	
	void IIgnitorService::CoilFireTask(void *parameters)
	{
		((IIgnitorService *)parameters)->CoilFire();
	}
}
#endif