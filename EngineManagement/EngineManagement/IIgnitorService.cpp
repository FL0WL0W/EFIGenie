#include "Services.h"
#ifdef IIgnitorServiceExists
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

	IIgnitorService *CurrentIgnitorServices[MAX_CYLINDERS];
}
#endif