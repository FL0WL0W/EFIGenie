#include "HardwareAbstractionCollection.h"

#ifndef IBOOLEANOUTPUTSERVICE_H
#define IBOOLEANOUTPUTSERVICE_H
namespace IOServiceLayer
{
	class IBooleanOutputService
	{
	public:
		virtual void OutputSet() = 0;
		virtual void OutputReset() = 0;
		virtual void OutputWrite(bool) = 0;

		static void OutputSetTask(void *);
		static void OutputResetTask(void *);

		static IBooleanOutputService *CreateBooleanOutputService(const HardwareAbstraction::HardwareAbstractionCollection *, void *, unsigned int *, bool);
	};
}
#endif