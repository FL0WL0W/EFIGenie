#include "ServiceLocator.h"
#include "IPrimeService.h"
#include "PrimeService_StaticPulseWidth.h"

#ifdef IPRIMESERVICE_H
namespace ApplicationServiceLayer
{
	IPrimeService* CreatePrimeService(ServiceLocator *serviceLocator, void *config, unsigned int *size)
	{
		unsigned char primeServiceId = *((unsigned char*)config);
		switch (primeServiceId)
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 0:B
			return new PrimeService_StaticPulseWidth(PrimeService_StaticPulseWidthConfig::Cast((unsigned char*)config + 1));
#endif
		}
	}
}
#endif