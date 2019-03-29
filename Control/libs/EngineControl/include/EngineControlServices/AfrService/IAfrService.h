#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef IAFRSERVICE_H
#define IAFRSERVICE_H
namespace EngineControlServices
{
	class IAfrService
	{
	public:
		float Afr;
		float Lambda;
		virtual void CalculateAfr() = 0;

		static void CalculateAfrCallBack(void *afrService);
		
		static void* CreateAfrService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif