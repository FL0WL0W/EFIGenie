#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "IOServices/BooleanInputService/BooleanInputService_Static.h"
#include "IOServices/BooleanInputService/BooleanInputService.h"

#ifdef IBOOLEANINPUTSERVICE_H
namespace IOServices
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
		
		IBooleanInputService *inputService = 0;

		switch (inputServiceId)
		{
#ifdef BOOLEANINPUTSERVICE_STATIC_H
		case 1:
			*size += sizeof(float);
			inputService = new BooleanInputService_Static(*((bool *)config));
			break;
#endif
			
#ifdef BOOLEANINPUTSERVICE_H
		case 2:
			{
				BooleanInputServiceConfig *booleanInputServiceConfig = BooleanInputServiceConfig::Cast((unsigned char*)config);
				*size += booleanInputServiceConfig->Size();
				inputService = new BooleanInputService(hardwareAbstractionCollection, booleanInputServiceConfig);
				break;
			}
#endif
		}
		
		return inputService;
	}
}
#endif