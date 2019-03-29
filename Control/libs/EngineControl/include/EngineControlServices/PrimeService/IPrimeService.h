#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef IPRIMESERVICE_H
#define IPRIMESERVICE_H
namespace EngineControlServices
{
	class IPrimeService
	{
	public:
		virtual void Prime() = 0;
		virtual void Tick() = 0;

		static void PrimeCallBack(void *primeService);
		static void TickCallBack(void *primeService);
		
		static void* CreatePrimeService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif