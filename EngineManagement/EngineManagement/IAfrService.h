#include "ServiceLocator.h"

using namespace Service;

#ifndef IAFRSERVICE_H
#define IAFRSERVICE_H
namespace ApplicationService
{
	class IAfrService
	{
	public:
		float Afr;
		float Lambda;
		virtual void CalculateAfr() = 0;
	};
}
#endif