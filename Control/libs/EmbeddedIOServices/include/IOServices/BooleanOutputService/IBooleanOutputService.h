#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "stdint.h"

using namespace HardwareAbstraction;

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
		
		static IBooleanOutputService *CreateBooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
