#include "Service/ServiceLocator.h"

#ifdef SERVICELOCATOR_H
namespace Service
{
	void ServiceLocator::Register(uint16_t serviceId, void *service)
	{
		_services.insert(std::pair<uint16_t, void *>(serviceId, service));
	}

	void* ServiceLocator::Locate(uint16_t serviceId)
	{
		const std::map<uint16_t, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
			return it->second;
		return 0;
	}

	void ServiceLocator::Unregister(uint16_t serviceId)
	{
		const std::map<uint16_t, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
			_services.erase(it);
	}
}
#endif
