#include "HardwareAbstractionCollection.h"

#ifndef IFLOATOUTPUTSERVICE_H
#define IFLOATOUTPUTSERVICE_H
namespace IOServiceLayer
{
	class IFloatOutputService
	{
	public:
		virtual void SetOutput(float output) = 0;

		static IFloatOutputService* CreateFloatOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config);
	};
}
#endif