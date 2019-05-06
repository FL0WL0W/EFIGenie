#include "Service/ServiceLocator.h"
#include "stdint.h"

#ifndef SERVICEBUILDER_H
#define SERVICEBUILDER_H

namespace Service
{
	class ServiceBuilder : protected ServiceLocator
	{
	public:
		virtual void Build(ServiceLocator *&serviceLocator, const void *config, unsigned int &sizeOut);
		
		virtual void Register(uint16_t serviceId, void*(*factory)(const ServiceLocator * const &, const void *, unsigned int &));

		static constexpr void OffsetConfig(const void *&config, unsigned int &totalSize, unsigned int offset) 
		{
			config = reinterpret_cast<const void *>(reinterpret_cast<const unsigned char *>(config) + offset);
			totalSize += offset;
		}
		
		template<typename T>
		static constexpr const T* CastConfigAndOffset(const void *&config, unsigned int &size)
		{
			const T *castedConfig = reinterpret_cast<const T *>(config);
			OffsetConfig(config, size, castedConfig->Size());
			
			return castedConfig;
		}
		
		template<typename T>
		static constexpr const T CastAndOffset(const void *&config, unsigned int &size)
		{
			const T casted = *reinterpret_cast<const T *>(config);
			OffsetConfig(config, size, sizeof(T));
			
			return casted;
		}

		template<typename Service> 
		static constexpr Service *CreateServiceAndOffset(void*(*factory)(const ServiceLocator * const &, const void *, unsigned int &), const ServiceLocator * const &serviceLocator, const void *&config, unsigned int &totalSize)
		{
			unsigned int size;
			Service *service = reinterpret_cast<Service *>(factory(serviceLocator, config, size));
			OffsetConfig(config, totalSize, size);
			return service;
		}
	};
}
#endif
