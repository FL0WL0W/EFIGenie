#include "IOServiceCollection.h"

#ifndef IPRIMESERVICE_H
#define IPRIMESERVICE_H
namespace ApplicationServiceLayer
{
	class IPrimeService
	{
	public:
		virtual void Prime() = 0;
		virtual void Tick() = 0;
		
		static IPrimeService* CreatePrimeService(IOServiceLayer::IOServiceCollection *iOServiceLayerCollection, void *config);
	};
}
#endif