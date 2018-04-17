#include "ServiceLocator.h"

using namespace Service;

#ifndef IPRIMESERVICE_H
#define IPRIMESERVICE_H
namespace ApplicationServiceLayer
{
	class IPrimeService
	{
	public:
		virtual void Prime() = 0;
		virtual void Tick() = 0;
		
		static IPrimeService* CreatePrimeService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
	};
}
#endif