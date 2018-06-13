#include "IBooleanOutputService.h"
#include "BooleanOutputService.h"

#ifdef IBOOLEANOUTPUTSERVICE_H
namespace IOService
{
	void IBooleanOutputService::OutputSetTask(void *parameters)
	{
		((IBooleanOutputService *)parameters)->OutputSet();
	}
	
	void IBooleanOutputService::OutputResetTask(void *parameters)
	{
		((IBooleanOutputService *)parameters)->OutputReset();
	}
	
	IBooleanOutputService *IBooleanOutputService::CreateBooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char outputServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*size = sizeof(unsigned char);
		
		switch (outputServiceId)
		{
		case 0:
			return 0;
			
#ifdef BOOLEANOUTPUTSERVICE_H
		case 1:
			{
				BooleanOutputServiceConfig *booleanOutputServiceConfig = BooleanOutputServiceConfig::Cast((unsigned char*)config);
				*size += booleanOutputServiceConfig->Size();
				return new BooleanOutputService(hardwareAbstractionCollection, booleanOutputServiceConfig);
			}
#endif
		}
		
		return 0;
	}
}
#endif