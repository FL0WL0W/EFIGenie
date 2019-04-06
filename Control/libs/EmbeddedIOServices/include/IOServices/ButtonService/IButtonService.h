#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"
#include "stdint.h"

using namespace HardwareAbstraction;
using namespace Service;

#if !defined(IBUTTONSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define IBUTTONSERVICE_H
#define BUILDER_IBUTTONSERVICE 2002
namespace IOServices
{
	class IButtonService
	{
	protected:
		CallBackGroup *_callBackGroup;
		IButtonService();
	public:
		void Add(ICallBack *callBack);
		void Add(void(*callBackPointer)(void *), void *parameters);
		void Remove(ICallBack *callBack);
		void Clear();
		virtual void Tick() = 0;

		static void* BuildButtonService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IButtonService* CreateButtonService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut);
		static void TickCallBack(void *buttonService);
	};
}
#endif
