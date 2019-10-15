#include <map>
#include "stdint.h"

#ifndef SERVICELOCATOR_H
#define SERVICELOCATOR_H

namespace Service
{
	class ServiceLocator
	{
	protected:
		std::map<uint16_t, void *> _services;
	public:
		bool Register(uint16_t const &serviceId, void * const &service);
		bool RegisterIfNotNull(uint16_t const &serviceId, void * const &service);
		bool Register(uint16_t const &serviceId, uint32_t const &instanceId, void * const &service);
		bool RegisterIfNotNull(uint16_t const &serviceId, uint32_t const &instanceId, void * const &service);
		void* Locate(uint16_t const &serviceId) const;
		void* Locate(uint16_t const &serviceId, uint32_t const &instanceId) const;
		template<typename K>
		K *LocateAndCast(uint16_t const &serviceId) const
		{
			return reinterpret_cast<K *>(Locate(serviceId));
		}
		template<typename K>
		K *LocateAndCast(uint16_t const &serviceId, uint32_t const &instanceId) const
		{
			return reinterpret_cast<K *>(Locate(serviceId, instanceId));
		}

		void Unregister(uint16_t const &serviceId);
		void Unregister(uint16_t const &serviceId, uint32_t const &instanceId);
	};
}
#endif
