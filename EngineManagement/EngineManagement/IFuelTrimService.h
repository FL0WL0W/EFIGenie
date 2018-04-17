#include "ServiceLocator.h"

using namespace Service;

#ifndef IFUELTRIMSERVICE_H
#define IFUELTRIMSERVICE_H
namespace EngineManagement
{
	class IFuelTrimService
	{
	public:
		//returns 1/128 %
		virtual short GetFuelTrim(unsigned char cylinder) = 0;
		virtual void TrimTick() = 0;
		
		static IFuelTrimService *CreateFuelTrimService(ServiceLocator *serviceLocator, void *config, unsigned int *size);
	};
}
#endif