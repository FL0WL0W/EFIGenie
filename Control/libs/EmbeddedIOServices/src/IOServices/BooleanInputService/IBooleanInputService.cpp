#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "IOServices/BooleanInputService/BooleanInputService_Static.h"
#include "IOServices/BooleanInputService/BooleanInputService.h"

#ifdef IBOOLEANINPUTSERVICE_H
namespace IOServices
{
	void IBooleanInputService::ReadValueCallBack(void *booleanInputService)
	{
		reinterpret_cast<IBooleanInputService *>(booleanInputService)->ReadValue();
	}

	IBooleanInputService* IBooleanInputService::CreateBooleanInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int *sizeOut)
	{
		const unsigned char inputServiceId = *reinterpret_cast<const unsigned char *>(config);
		config = reinterpret_cast<const unsigned char *>(config) + 1;
		*sizeOut = sizeof(unsigned char);
		
		IBooleanInputService *inputService = 0;

		switch (inputServiceId)
		{
#ifdef BOOLEANINPUTSERVICE_STATIC_H
		case 1:
			*sizeOut += sizeof(float);
			inputService = new BooleanInputService_Static(*reinterpret_cast<const bool *>(config));
			break;
#endif
			
#ifdef BOOLEANINPUTSERVICE_H
		case 2:
			{
				const BooleanInputServiceConfig *booleanInputServiceConfig = reinterpret_cast<const BooleanInputServiceConfig *>(config);
				*sizeOut += booleanInputServiceConfig->Size();
				inputService = new BooleanInputService(hardwareAbstractionCollection, booleanInputServiceConfig);
				break;
			}
#endif
		}
		
		return inputService;
	}
}
#endif
