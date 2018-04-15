#include "IBooleanInputService.h"
#include "BooleanInputService_Static.h"
#include "BooleanInputService.h"

#ifdef IBOOLEANINPUTSERVICE_H
namespace IOServiceLayer
{
	IBooleanInputService* IBooleanInputService::CreateBooleanInputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char inputServiceId = *((unsigned char*)config);
		switch (inputServiceId)
		{
		case 0:
			*size = 1;
			return 0;
#ifdef BOOLEANINPUTSERVICE_STATIC_H
		case 1:
			*size = 5;
			return new BooleanInputService_Static(*((float *)((unsigned char*)config + 1)));
#endif
#ifdef BOOLEANINPUTSERVICE_H
		case 2:
			{
				BooleanInputServiceConfig *booleanInputServiceConfig = BooleanInputServiceConfig::Cast((unsigned char*)config + 1);
				*size = 1 + booleanInputServiceConfig->Size();
				return new BooleanInputService(hardwareAbstractionCollection, booleanInputServiceConfig);
			}
#endif
		}
	}
}
#endif