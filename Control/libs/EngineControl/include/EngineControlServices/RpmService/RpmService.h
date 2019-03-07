#include "Reluctor/IReluctor.h"
#include "stdint.h"

using namespace Reluctor;

#if !defined(RPMSERVICE_H) && defined(IRELUCTOR_H)
#define RPMSERVICE_H
namespace EngineControlServices
{	
	class RpmService
	{
	public:
        IReluctor *_crankReluctor;
        IReluctor *_camReluctor;
        uint16_t Rpm;
		RpmService(IReluctor *crankReluctor, IReluctor *camReluctor);
        void Tick();

        static void TickCallBack(void *rpmService);
	};
}
#endif