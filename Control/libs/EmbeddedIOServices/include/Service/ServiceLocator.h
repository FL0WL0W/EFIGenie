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
		void Register(uint16_t serviceId, void *service);
		void* Locate(uint16_t serviceId);
		template<typename K>
		K *LocateAndCast(uint16_t serviceId)
		{
			return reinterpret_cast<K *>(Locate(serviceId));
		}

		void Unregister(uint16_t serviceId);
	};
}
#endif
