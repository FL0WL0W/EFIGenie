#include "HardwareAbstraction/HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#ifndef IFLOATOUTPUTSERVICE_H
#define IFLOATOUTPUTSERVICE_H
namespace IOServices
{
	class IFloatOutputService
	{
	public:
		virtual void SetOutput(float output) = 0;
		virtual void Calibrate() = 0;
		
		static IFloatOutputService* CreateFloatOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *sizeOut);
	};
}
#endif