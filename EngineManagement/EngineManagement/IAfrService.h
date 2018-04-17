#include "ServiceLocator.h"

using namespace Service;

#ifndef IAFRSERVICE_H
#define IAFRSERVICE_H
namespace EngineManagement
{
	class IAfrService
	{
	public:
		float Afr;
		float Lambda;
		virtual void CalculateAfr() = 0;
		
		static IAfrService* CreateAfrService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
	};
}
#endif