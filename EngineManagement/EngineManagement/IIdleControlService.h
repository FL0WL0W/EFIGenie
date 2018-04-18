#include "ServiceLocator.h"

using namespace Service;

#ifndef IIDLECONTROLSERVICE_H
#define IIDLECONTROLSERVICE_H
namespace ApplicationService
{
	class IIdleControlService
	{
	public:
		short RpmError;
		virtual void Tick() = 0;
	};
}
#endif