#include "Service/ServiceLocator.h"

#ifdef SERVICELOCATOR_H
namespace Service
{
	void ServiceLocator::Register(unsigned short serviceId, void *service)
	{
		_services.insert(std::pair<unsigned short, void *>(serviceId, service));
	}

	void* ServiceLocator::Locate(unsigned short serviceId)
	{
		const std::map<unsigned short, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
			return it->second;
		return 0;
	}

	void ServiceLocator::Unregister(unsigned short serviceId)
	{
		const std::map<unsigned short, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
			_services.erase(it);
	}
}
#endif