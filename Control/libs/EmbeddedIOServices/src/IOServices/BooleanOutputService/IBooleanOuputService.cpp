#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "IOServices/BooleanOutputService/BooleanOutputService.h"

#ifdef IBOOLEANOUTPUTSERVICE_H
namespace IOServices
{
	void IBooleanOutputService::OutputSetCallBack(void *parameters)
	{
		((IBooleanOutputService *)parameters)->OutputSet();
	}
	
	void IBooleanOutputService::OutputResetCallBack(void *parameters)
	{
		((IBooleanOutputService *)parameters)->OutputReset();
	}
	
	IBooleanOutputService *IBooleanOutputService::CreateBooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *sizeOut)
	{
		unsigned char outputServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*sizeOut = sizeof(unsigned char);
		
		IBooleanOutputService *outputService = 0;
		
		switch (outputServiceId)
		{			
#ifdef BOOLEANOUTPUTSERVICE_H
		case 1:
			{
				BooleanOutputServiceConfig *booleanOutputServiceConfig = BooleanOutputServiceConfig::Cast((unsigned char*)config);
				*sizeOut += booleanOutputServiceConfig->Size();
				outputService = new BooleanOutputService(hardwareAbstractionCollection, booleanOutputServiceConfig);
				break;
			}
#endif
		}
		
		return outputService;
	}
}
#endif