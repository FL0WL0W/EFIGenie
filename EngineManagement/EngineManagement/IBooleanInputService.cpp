#include "IBooleanInputService.h"
#include "BooleanInputService_Static.h"
#include "BooleanInputService.h"

#ifdef IBOOLEANINPUTSERVICE_H
namespace IOService
{
	void IBooleanInputService::ReadValueCallBack(void *booleanInputService)
	{
		((IBooleanInputService *)booleanInputService)->ReadValue();
	}

	IBooleanInputService* IBooleanInputService::CreateBooleanInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char inputServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*size = sizeof(unsigned char);
		
		switch (inputServiceId)
		{
		case 0:
			return 0;
			
#ifdef BOOLEANINPUTSERVICE_STATIC_H
		case 1:
			*size += sizeof(float);
			return new BooleanInputService_Static(*((bool *)config));
#endif
			
#ifdef BOOLEANINPUTSERVICE_H
		case 2:
			{
				BooleanInputServiceConfig *booleanInputServiceConfig = BooleanInputServiceConfig::Cast((unsigned char*)config);
				*size += booleanInputServiceConfig->Size();
				return new BooleanInputService(hardwareAbstractionCollection, booleanInputServiceConfig);
			}
#endif
		}
		
		return 0;
	}
}
#endif