#include "Service/ServiceBuilder.h"

#ifdef SERVICEBUILDER_H
namespace Service
{
	void ServiceBuilder::Build(ServiceLocator *&serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		uint16_t builderId;

		while ((builderId = CastAndOffset<uint16_t>(config, sizeOut)) != 0)
		{
			uint8_t instanceId = CastAndOffset<uint8_t>(config, sizeOut);

			void*(*factory)(const ServiceLocator * const &, const void *, unsigned int &) = ServiceLocator::LocateAndCast<void*(const ServiceLocator * const&, const void *, unsigned int &)>(builderId);

			void *service = CreateServiceAndOffset<void>(factory, serviceLocator, config, sizeOut);
			
			serviceLocator->RegisterIfNotNull(builderId, instanceId, service);
		}
	}
	
	void ServiceBuilder::Register(uint16_t serviceId, void*(*factory)(const ServiceLocator * const &, const void *, unsigned int &))
	{
		ServiceLocator::Register(serviceId, reinterpret_cast<void *>(factory));
	}
}
#endif
