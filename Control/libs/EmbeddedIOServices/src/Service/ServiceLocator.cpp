#include "Service/ServiceLocator.h"

#ifdef SERVICELOCATOR_H
namespace Service
{
	void ServiceLocator::Register(uint16_t const &serviceId, void * const &service)
	{
		if(Locate(serviceId) != 0)
			Unregister(serviceId);
		_services.insert(std::pair<uint16_t, void *>(serviceId, service));
	}

	void ServiceLocator::RegisterIfNotNull(uint16_t const &serviceId, void * const &service)
	{
		if(service != 0)
		{
			Register(serviceId, service);
		}
	}

	void ServiceLocator::Register(uint16_t const &serviceId, uint32_t const &instanceId, void * const &service)
	{
		if(Locate(serviceId, instanceId) != 0)
			Unregister(serviceId, instanceId);

		void* serviceArray = Locate(serviceId);

		if(serviceArray == 0)
		{
			serviceArray = calloc((instanceId + 2) * sizeof(void *) + sizeof(uint32_t), (instanceId + 2) * sizeof(void *) + sizeof(uint32_t));
			*reinterpret_cast<uint32_t *>(serviceArray) = instanceId + 1;
			Register(serviceId, serviceArray);
		}
		else
		{
			uint32_t size = *reinterpret_cast<uint32_t *>(serviceArray);
			if(instanceId + 1 > size)
			{
				void* oldServiceArray = serviceArray;
				serviceArray = calloc((instanceId + 2) * sizeof(void *) + sizeof(uint32_t), (instanceId + 2) * sizeof(void *) + sizeof(uint32_t));
				memcpy(serviceArray, oldServiceArray, (size + 1) * sizeof(void *) + sizeof(uint32_t));
				*reinterpret_cast<uint32_t *>(serviceArray) = instanceId + 1;
				
				Register(serviceId, serviceArray);
				free(oldServiceArray);
			}
		}
		
		reinterpret_cast<void **>(reinterpret_cast<uint32_t *>(serviceArray) + 1)[instanceId] = service;
	}

	void ServiceLocator::RegisterIfNotNull(uint16_t const &serviceId, uint32_t const &instanceId, void * const &service)
	{
		if(service != 0)
		{
			Register(serviceId, instanceId, service);
		}
	}

	void* ServiceLocator::Locate(uint16_t const &serviceId) const
	{
		const std::map<uint16_t, void *>::const_iterator it = _services.find(serviceId);
		if (it != _services.end())
			return it->second;
		return 0;
	}

	void* ServiceLocator::Locate(uint16_t const &serviceId, uint32_t const &instanceId) const
	{
		void* serviceArray = Locate(serviceId);

		if(serviceArray != 0 && instanceId < *reinterpret_cast<uint32_t *>(serviceArray))
		{
			return reinterpret_cast<void **>(reinterpret_cast<uint32_t *>(serviceArray) + 1)[instanceId];
		}

		return 0;
	}

	void ServiceLocator::Unregister(uint16_t const &serviceId)
	{
		const std::map<uint16_t, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
			_services.erase(it);
	}

	void ServiceLocator::Unregister(uint16_t const &serviceId, uint32_t const &instanceId)
	{
		const std::map<uint16_t, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
		{
			uint32_t size = *reinterpret_cast<uint32_t *>(it->second);
			if(instanceId < size)
			{
				reinterpret_cast<void **>(it->second)[instanceId + 1] = 0;
				uint32_t newSize = size;
				while(newSize != 0 && reinterpret_cast<void **>(it->second)[size] == 0)
					newSize--;

				if(newSize == 0)
				{
					_services.erase(it);
				}
				else
				{
					*reinterpret_cast<uint32_t *>(it->second) = newSize;
				}
			}
		}
	}
}
#endif
