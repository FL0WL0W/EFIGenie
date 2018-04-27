#include "HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#ifndef IFLOATOUTPUTSERVICE_H
#define IFLOATOUTPUTSERVICE_H
namespace IOService
{
	class IFloatOutputService
	{
	public:
		virtual void SetOutput(float output) = 0;
		
		static IFloatOutputService* CreateFloatOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size);
	};
}
#endif