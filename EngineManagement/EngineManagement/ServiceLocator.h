#include <map>

#ifndef SERVICELOCATOR_H
#define SERVICELOCATOR_H
namespace Service
{
	class ServiceLocator
	{
	protected:
		std::map<unsigned char, void *> _services;
	public:
		void Register(unsigned char serviceId, void *service);
		void* Locate(unsigned char serviceId);
		void* Unregister(unsigned char serviceId);
	};
}
#endif