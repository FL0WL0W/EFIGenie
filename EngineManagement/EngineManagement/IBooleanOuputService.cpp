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
	
	IBooleanOutputService *IBooleanOutputService::CreateBooleanOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size, bool highZ)
	{
		unsigned char outputServiceId = *((unsigned char*)config);
		switch (outputServiceId)
		{
		case 0:
			*size = 1;
			return 0;
#ifdef BOOLEANOUTPUTSERVICE_H
		case 1:
			{
				BooleanOutputServiceConfig *booleanOutputServiceConfig = BooleanOutputServiceConfig::Cast((unsigned char*)config + 1);
				*size = 1 + booleanOutputServiceConfig->Size();
				return new BooleanOutputService(hardwareAbstractionCollection, booleanOutputServiceConfig, highZ);
			}
#endif
		}
	}
}
#endif