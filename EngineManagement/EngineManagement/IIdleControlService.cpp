#include "IdleControlService_Pid.h"

#ifdef IIdleControlServiceExists
namespace EngineManagement
{
	IIdleControlService *CurrentIdleControlService;
	IIdleControlService* CreateIdleControlService(void *config)
	{
		unsigned char idleControlServiceId = *((unsigned char*)config);
		switch (idleControlServiceId)
		{
		case 0:
			return 0;
#ifdef	IdleControlService_PidExists
		case 1:
			return new IdleControlService_Pid(IdleControlService_PidConfig::Cast((unsigned char*)config + 1));
#endif
		}
	}
}
#endif