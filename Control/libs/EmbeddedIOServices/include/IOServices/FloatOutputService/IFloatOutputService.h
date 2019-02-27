#include "HardwareAbstraction/HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#if !defined(IFLOATOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define IFLOATOUTPUTSERVICE_H
namespace IOServices
{
	class IFloatOutputService
	{
	public:
		virtual void SetOutput(float output) = 0;
		virtual void Calibrate() = 0;
		
		static IFloatOutputService* CreateFloatOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, uint32_t *sizeOut);
	};
}
#endif
