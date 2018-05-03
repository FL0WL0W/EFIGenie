#include "ServiceLocator.h"

#ifdef SERVICELOCATOR_H
namespace Service
{
	void ServiceLocator::Register(unsigned char serviceId, void *service)
	{
		_services.insert(std::pair<unsigned char, void *>(serviceId, service));
	}

	void* ServiceLocator::Locate(unsigned char serviceId)
	{
		std::map<unsigned char, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
			return it->second;
		return 0;
	}

	void* ServiceLocator::Unregister(unsigned char serviceId)
	{
		std::map<unsigned char, void *>::iterator it = _services.find(serviceId);
		if (it != _services.end())
			_services.erase(it);
	}
}
#endif