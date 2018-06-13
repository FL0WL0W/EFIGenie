#include "HardwareAbstractionCollection.h"

using namespace HardwareAbstraction;

#ifndef IBOOLEANOUTPUTSERVICE_H
#define IBOOLEANOUTPUTSERVICE_H
namespace IOService
{
	class IBooleanOutputService
	{
	public:
		virtual void OutputSet() = 0;
		virtual void OutputReset() = 0;
		virtual void OutputWrite(bool value) = 0;

		static void OutputSetTask(void *booleanOutputService);
		static void OutputResetTask(void *booleanOutputService);
		
		static IBooleanOutputService *CreateBooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size);
	};
}
#endif