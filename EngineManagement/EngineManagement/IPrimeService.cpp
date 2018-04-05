#include "Services.h"
#include "PrimeService_StaticPulseWidth.h"

#ifdef IPrimeServiceExists
namespace EngineManagement
{
	IPrimeService *CurrentPrimeService;

	IPrimeService* CreatePrimeService(void *config)
	{
		unsigned char primeServiceId = *((unsigned char*)config);
		switch (primeServiceId)
		{
#ifdef PrimeService_StaticPulseWidthExists
		case 0:
			return new PrimeService_StaticPulseWidth(PrimeService_StaticPulseWidthConfig::Cast((unsigned char*)config + 1));
#endif
		}
	}
}
#endif