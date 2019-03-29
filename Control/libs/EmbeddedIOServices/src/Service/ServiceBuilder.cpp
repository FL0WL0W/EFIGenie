#include "Service/ServiceBuilder.h"

#ifdef SERVICEBUILDER_H
namespace Service
{
	void ServiceBuilder::Build(ServiceLocator *&serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		uint16_t serviceId;

		while ((serviceId = *reinterpret_cast<const uint16_t *>(config)) != 0)
		{
			OffsetConfig(config, sizeOut, sizeof(const uint16_t));

			void*(*factory)(const ServiceLocator * const &, const void *, unsigned int &) = ServiceLocator::LocateAndCast<void*(const ServiceLocator * const&, const void *, unsigned int &)>(serviceId);

			void *service = CreateServiceAndOffset<void>(factory, serviceLocator, config, sizeOut);
			
			RegisterIfNotNull(serviceLocator, serviceId, service);
		}
	}
	
	void ServiceBuilder::Unregister(uint16_t serviceId)
	{
		ServiceLocator::Unregister(serviceId);
	}
}
#endif
