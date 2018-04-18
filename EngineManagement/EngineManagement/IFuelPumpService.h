#include "ServiceLocator.h"

using namespace Service;

#ifndef IFUELPUMPSERVICE_H
#define IFUELPUMPSERVICE_H
namespace ApplicaionService
{
	class IFuelPumpService
	{
	public:
		virtual void Prime() = 0;
		virtual void On() = 0;
		virtual void Off() = 0;
		virtual void Tick() = 0;
		
		static IFuelPumpService* CreateFuelPumpService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
	};
}
#endif