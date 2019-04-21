#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"
#include "stdint.h"

using namespace HardwareAbstraction;
using namespace Service;

#if !defined(IBOOLEANOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define IBOOLEANOUTPUTSERVICE_H
namespace IOServices
{
	class IBooleanOutputService
	{
	public:
		virtual void OutputSet() = 0;
		virtual void OutputReset() = 0;
		virtual void OutputWrite(bool value) = 0;

		static void OutputSetCallBack(void *booleanOutputService);
		static void OutputResetCallBack(void *booleanOutputService);
		
		static void *BuildBooleanOutputService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IBooleanOutputService *CreateBooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
