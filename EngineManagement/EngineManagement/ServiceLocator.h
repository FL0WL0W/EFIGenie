#include <map>

#ifndef SERVICELOCATOR_H
#define SERVICELOCATOR_H
namespace Service
{
	class ServiceLocator
	{
	protected:
		std::map<unsigned short, void *> _services;
	public:
		void Register(unsigned short serviceId, void *service);
		void* Locate(unsigned short serviceId);
		void Unregister(unsigned short serviceId);
	};
}
#endif