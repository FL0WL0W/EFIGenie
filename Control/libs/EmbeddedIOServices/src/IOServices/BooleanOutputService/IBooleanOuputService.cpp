#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "IOServices/BooleanOutputService/BooleanOutputService.h"

#ifdef IBOOLEANOUTPUTSERVICE_H
namespace IOServices
{
	void IBooleanOutputService::OutputSetCallBack(void *booleanOutputService)
	{
		reinterpret_cast<IBooleanOutputService *>(booleanOutputService)->OutputSet();
	}
	
	void IBooleanOutputService::OutputResetCallBack(void *booleanOutputService)
	{
		reinterpret_cast<IBooleanOutputService *>(booleanOutputService)->OutputReset();
	}
	
	IBooleanOutputService *IBooleanOutputService::CreateBooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int *sizeOut)
	{
		const unsigned char outputServiceId = *reinterpret_cast<const unsigned char *>(config);
		config = reinterpret_cast<const unsigned char *>(config) + 1;
		*sizeOut = sizeof(unsigned char);
		
		IBooleanOutputService *outputService = 0;
		
		switch (outputServiceId)
		{			
#ifdef BOOLEANOUTPUTSERVICE_H
		case 1:
			{
				const BooleanOutputServiceConfig *booleanOutputServiceConfig = reinterpret_cast<const BooleanOutputServiceConfig *>(config);
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
