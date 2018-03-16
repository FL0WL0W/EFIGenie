#include "Services.h"
#include "IdleControlService_Pd.h"

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
#ifdef	IdleControlService_PdExists
		case 1:
			return new IdleControlService_Pd((void*)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif