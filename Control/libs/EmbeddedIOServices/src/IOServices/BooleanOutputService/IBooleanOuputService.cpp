#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "IOServices/BooleanOutputService/BooleanOutputService.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/ServiceBuilder.h"

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
	
	void* IBooleanOutputService::BuildBooleanOutputService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return CreateBooleanOutputService(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), config, sizeOut);
	}
	
	IBooleanOutputService *IBooleanOutputService::CreateBooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;		
		IBooleanOutputService *outputService = 0;
		
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{			
#ifdef BOOLEANOUTPUTSERVICE_H
		case 1:
			{
				const BooleanOutputServiceConfig *booleanOutputServiceConfig = reinterpret_cast<const BooleanOutputServiceConfig *>(config);
				sizeOut += booleanOutputServiceConfig->Size();
				outputService = new BooleanOutputService(hardwareAbstractionCollection, booleanOutputServiceConfig);
				break;
			}
#endif
		}
		
		return outputService;
	}
}
#endif
