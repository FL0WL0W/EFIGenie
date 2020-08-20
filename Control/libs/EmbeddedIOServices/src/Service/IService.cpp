#include "Service/IService.h"

#ifdef ISERVICE_H
namespace Service
{
	Service::ServiceLocator Service::IService::serviceFactoryLocator;

	void IService::Build(ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		uint16_t builderId;

		while ((builderId = CastAndOffset<uint16_t>(config, sizeOut)) != 0)
		{
			void(*factory)(ServiceLocator * const &, const void *, unsigned int &) = serviceFactoryLocator.LocateAndCast<void(ServiceLocator * const&, const void *, unsigned int &)>(builderId);
			
			CreateServiceAndOffset(factory, serviceLocator, config, sizeOut);
		}
	}
	
	void IService::CreateServiceAndOffset(void(*factory)(ServiceLocator * const &, const void *, unsigned int &), ServiceLocator * const &serviceLocator, const void *&config, unsigned int &totalSize)
	{
		unsigned int size = 0;
		factory(serviceLocator, config, size);
		OffsetConfig(config, totalSize, size);
	}
	
	void IService::OffsetConfig(const void *&config, unsigned int &totalSize, unsigned int offset) 
	{
		config = reinterpret_cast<const void *>(reinterpret_cast<const uint8_t *>(config) + offset);
		totalSize += offset;
	}
}
#endif
