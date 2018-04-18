#include "ServiceLocator.h"

using namespace Service;

#ifndef IPRIMESERVICE_H
#define IPRIMESERVICE_H
namespace ApplicationService
{
	class IPrimeService
	{
	public:
		virtual void Prime() = 0;
		virtual void Tick() = 0;
	};
}
#endif