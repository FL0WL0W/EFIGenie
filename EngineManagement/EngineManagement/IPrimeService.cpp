#include "IOServiceCollection.h"
#include "IPrimeService.h"
#include "PrimeService_StaticPulseWidth.h"

#ifdef IPRIMESERVICE_H
namespace ApplicationServiceLayer
{
	IPrimeService* IPrimeService::CreatePrimeService(IOServiceLayer::IOServiceCollection *iOServiceLayerCollection, void *config)
	{
		unsigned char primeServiceId = *((unsigned char*)config);
		switch (primeServiceId)
		{
#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
		case 0:
			return new PrimeService_StaticPulseWidth(iOServiceLayerCollection, PrimeService_StaticPulseWidthConfig::Cast((unsigned char*)config + 1));
#endif
		}
	}
}
#endif