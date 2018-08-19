#include "ServiceLocator.h"

using namespace Service;

#ifndef IFUELTRIMSERVICE_H
#define IFUELTRIMSERVICE_H
namespace ApplicationService
{
	class IFuelTrimService
	{
	public:
		//returns 1/128 %
		virtual short GetFuelTrim(unsigned char cylinder) = 0;
		virtual void Tick() = 0;

		static void TickCallBack(void *fuelTrimService);
	};
}
#endif
