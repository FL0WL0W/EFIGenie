#include "Reluctor/IReluctor.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Reluctor/Gm24xReluctor.h"
#include "Reluctor/Universal2xReluctor.h"

#ifdef IRELUCTOR_H
namespace Reluctor
{
	void* IReluctor::BuildReluctor(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return CreateReluctor(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), config, sizeOut);
	}

	IReluctor* IReluctor::CreateReluctor(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		IReluctor *ret = 0;		
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef GM24XRELUCTOR_H
		case 1:
			ret = new Gm24xReluctor(hardwareAbstractionCollection, *reinterpret_cast<const uint16_t *>(config));
			ServiceBuilder::OffsetConfig(config, sizeOut, sizeof(uint16_t));
			break;
#endif
#ifdef UNIVERSAL2XRELUCTOR_H
		case 2:
			ret = new Universal2xReluctor(hardwareAbstractionCollection, ServiceBuilder::CastConfigAndOffset < Universal2xReluctorConfig >(config, sizeOut));
			break;
#endif
		}

		return ret;
	}
}
#endif
