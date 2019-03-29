#include "Service/ServiceLocator.h"
#include <map>
#include "stdint.h"

#ifndef SERVICEBUILDER_H
#define SERVICEBUILDER_H

namespace Service
{
	class ServiceBuilder : protected ServiceLocator
	{
	public:
		void Build(ServiceLocator *&serviceLocator, const void *config, unsigned int &sizeOut);
		
		void Register(uint16_t serviceId, void*(*factory)(const ServiceLocator * const &, const void *, unsigned int &))
		{
			ServiceLocator::Register(serviceId, reinterpret_cast<void *>(factory));
		}

		void Unregister(uint16_t serviceId);

		static constexpr void OffsetConfig(const void *&config, unsigned int &totalSize, unsigned int offset) 
		{
			config = reinterpret_cast<const void *>(reinterpret_cast<const unsigned char *>(config) + offset);
			if(totalSize != 0)
			{
				totalSize += offset;
			}
		}
		
		template<typename T>
		static constexpr const T* CastConfig(const void *&config, unsigned int &size)
		{
			const T *castedConfig = reinterpret_cast<const T *>(config);
			const unsigned int confSize = castedConfig->Size();
			OffsetConfig(config, size, confSize);
			
			return castedConfig;
		}

		template<typename Service> 
		static constexpr Service *CreateServiceAndOffset(void*(*factory)(const ServiceLocator * const &, const void *, unsigned int &), const ServiceLocator * const &serviceLocator, const void *&config, unsigned int &totalSize)
		{
			unsigned int size;
			Service *service = reinterpret_cast<Service *>(factory(serviceLocator, config, size));
			OffsetConfig(config, totalSize, size);
			return service;
		}

		static constexpr const unsigned char GetServiceTypeId(const void *&config, unsigned int &size)
		{
			const unsigned char serviceId = *reinterpret_cast<const unsigned char*>(config);
			size = 0;
			OffsetConfig(config, size, 1);
			return serviceId;
		}

		static constexpr void RegisterIfNotNull(ServiceLocator *&serviceLocator, uint16_t serviceId, void *pointer) 
		{
			if(pointer != 0)
			{
				serviceLocator->Register(serviceId, pointer);
			}
		}
	};
}
#endif
